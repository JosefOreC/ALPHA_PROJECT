"""Comprueba el medidor de Render sin hacer solicitudes externas."""

import csv
import io
import json
import runpy
import sys
from contextlib import nullcontext
from types import SimpleNamespace
from unittest.mock import MagicMock
from urllib.error import HTTPError, URLError

import pytest

from tests.test_project_scripts import load


@pytest.mark.parametrize("content,expected", [
    (b'{"status":"ok"}', {"status": "ok"}),
    (b"<!DOCTYPE html>", None),
    (b"", None),
])
def test_requests_use_origin_and_parse_only_json(content, expected):
    probe = load("measure_render_latency")
    client = MagicMock()
    client.open.return_value = nullcontext(SimpleNamespace(status=200, read=lambda: content))
    code, elapsed, payload = probe.request_json(client, "/api/session", method="POST",
                                                data={"email": "qa@example.invalid"}, csrf="test")
    sent = client.open.call_args.args[0]
    assert sent.full_url == probe.ORIGIN + "/api/session"
    assert sent.get_method() == "POST"
    assert sent.get_header("Origin") == probe.ORIGIN
    assert sent.get_header("X-csrf-token") == "test"
    assert json.loads(sent.data) == {"email": "qa@example.invalid"}
    assert code == 200 and elapsed >= 0 and payload == expected
    assert probe.NoRedirect().redirect_request(sent, None, 302, "", {}, "/other") is None


@pytest.mark.parametrize("failure,code", [
    (HTTPError("https://example.invalid", 401, "Unauthorized", {}, io.BytesIO(b"private details")), 401),
    (URLError("timeout"), 0),
])
def test_request_failure_keeps_status_without_response_body(failure, code):
    probe = load("measure_render_latency")
    client = MagicMock()
    client.open.side_effect = failure

    status, elapsed, response = probe.request_json(client, "/health")

    assert status == code and elapsed >= 0 and response is None
    assert client.open.call_args.args[0].data is None


@pytest.mark.parametrize("mode,health,login,order,logout,expected", [
    ("public", (200, 200, {"status": "ok"}), None, None, None, 0),
    ("public", (200, 500, {"status": "ok"}), None, None, None, 1),
    ("public", (503, 200, None), None, None, None, 1),
    ("public", (200, 200, []), None, None, None, 1),
    ("public", (200, 200, {"status": "unavailable"}), None, None, None, 1),
    ("missing", None, None, None, None, 2),
    ("private", (200, 200, {"status": "ok"}), (401, 200, None), None, None, 1),
    ("private", (200, 200, {"status": "ok"}), (200, 200, []), None, None, 1),
    ("private", (200, 200, {"status": "ok"}), (200, 200, {}), None, None, 1),
    ("private", (200, 200, {"status": "ok"}), (200, 200, {"csrf_token": "token"}), (200, 250, {"items": [{"customer": "private data"}]}), 204, 0),
    ("private", (200, 200, {"status": "ok"}), (200, 200, {"csrf_token": "token"}), (200, 250, {"items": []}), 503, 1),
    ("private", (200, 200, {"status": "ok"}), (200, 200, {"csrf_token": "token"}), (200, 250, {}), 204, 1),
])
def test_report_validates_latency_and_closes_authenticated_session(
    tmp_path, monkeypatch, mode, health, login, order, logout, expected,
):
    probe = load("measure_render_latency")
    output = tmp_path / "latency.csv"
    args = ["measure_render_latency", "--salida", str(output)]
    if mode == "public":
        args.append("--solo-salud")
    monkeypatch.setattr(sys, "argv", args)
    monkeypatch.setattr("builtins.input", lambda _: "qa@example.invalid")
    monkeypatch.setattr(probe, "getpass", lambda _: "" if mode == "missing" else "test password")
    monkeypatch.setattr(probe, "sleep", lambda _: None)
    calls = []

    def request(client, path, *, method="GET", data=None, csrf=None):
        calls.append((method, path))
        if path == "/health":
            return health
        if method == "POST":
            assert data == {"email": "qa@example.invalid", "password": "test password"}
            return login
        if method == "DELETE":
            assert csrf == "token"
            return logout, 200, None
        assert path == probe.ORDERS_PATH
        return order

    monkeypatch.setattr(probe, "request_json", request)
    if mode == "missing":
        with pytest.raises(SystemExit) as error:
            probe.main()
        assert error.value.code == expected and not output.exists()
        return

    assert probe.main() == expected
    report = output.read_text(encoding="utf-8")
    rows = list(csv.DictReader(io.StringIO(report)))
    assert len(rows) == (11 if logout else 6)
    assert "private data" not in report and "test password" not in report and "qa@example.invalid" not in report
    assert calls.count(("POST", "/api/session")) == (1 if login else 0)
    assert calls.count(("DELETE", "/api/session")) == (1 if logout else 0)
    if logout:
        assert rows[-1]["endpoint"] == "pedidos"


def test_cli_exits_after_showing_help(monkeypatch):
    probe = load("measure_render_latency")
    monkeypatch.setattr(sys, "argv", ["measure_render_latency", "--help"])
    with pytest.raises(SystemExit) as error:
        runpy.run_path(probe.__file__, run_name="__main__")
    assert error.value.code == 0
