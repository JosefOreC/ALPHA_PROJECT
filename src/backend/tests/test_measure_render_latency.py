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


@pytest.mark.parametrize("content,expected,server_timing,api_ms", [
    (b'{"status":"ok"}', {"status": "ok"}, "edge;dur=2, eco_api;dur=32.125, cache", "32.125"),
    (b"<!DOCTYPE html>", None, "eco_api;dur=invalid", ""),
    (b"", None, "", ""),
])
def test_requests_use_origin_and_parse_only_json(content, expected, server_timing, api_ms):
    probe = load("measure_render_latency")
    client = MagicMock()
    client.open.return_value = nullcontext(SimpleNamespace(
        status=200, read=lambda: content, headers={"Server-Timing": server_timing},
    ))
    code, elapsed, payload, timings = probe.request_json(client, "/api/session", method="POST",
                                                         data={"email": "qa@example.invalid"}, csrf="test")
    sent = client.open.call_args.args[0]
    assert sent.full_url == probe.ORIGIN + "/api/session"
    assert sent.get_method() == "POST"
    assert sent.get_header("Origin") == probe.ORIGIN
    assert sent.get_header("X-csrf-token") == "test"
    assert json.loads(sent.data) == {"email": "qa@example.invalid"}
    assert code == 200 and elapsed >= 0 and payload == expected
    assert timings[0] == api_ms and float(timings[1]) >= 0
    assert probe.NoRedirect().redirect_request(sent, None, 302, "", {}, "/other") is None


@pytest.mark.parametrize("failure,code", [
    (HTTPError("https://example.invalid", 401, "Unauthorized", {}, io.BytesIO(b"private details")), 401),
    (URLError("timeout"), 0),
])
def test_request_failure_keeps_status_without_response_body(failure, code):
    probe = load("measure_render_latency")
    client = MagicMock()
    client.open.side_effect = failure

    status, elapsed, response, timings = probe.request_json(client, "/health")

    assert status == code and elapsed >= 0 and response is None
    assert timings == ("", "")
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
    if mode == "private":
        args.append("--diagnostico")
    monkeypatch.setattr(sys, "argv", args)
    monkeypatch.setattr("builtins.input", lambda _: "qa@example.invalid")
    monkeypatch.setattr(probe, "getpass", lambda _: "" if mode == "missing" else "test password")
    monkeypatch.setattr(probe, "sleep", lambda _: None)
    calls = []

    def request(client, path, *, method="GET", data=None, csrf=None):
        calls.append((method, path))
        if path == "/health":
            return (*health, ("3.500", "180.000"))
        if method == "POST":
            assert data == {"email": "qa@example.invalid", "password": "test password"}
            return (*login, ("", "180.000"))
        if method == "DELETE":
            assert csrf == "token"
            return logout, 200, None, ("", "180.000")
        assert path == probe.ORDERS_PATH
        return (*order, ("62.000", "190.000"))

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
        assert rows[-1]["api_ms"] == "62.000"
        assert rows[-1]["until_headers_ms"] == "190.000"
    if mode == "public":
        assert "api_ms" not in rows[0]


def test_cli_exits_after_showing_help(monkeypatch):
    probe = load("measure_render_latency")
    monkeypatch.setattr(sys, "argv", ["measure_render_latency", "--help"])
    with pytest.raises(SystemExit) as error:
        runpy.run_path(probe.__file__, run_name="__main__")
    assert error.value.code == 0


def test_existing_report_is_preserved_without_prompting_for_credentials(tmp_path, monkeypatch, capsys):
    probe = load("measure_render_latency")
    report = tmp_path / "latencia.csv"
    report.write_text("informe anterior", encoding="utf-8")
    prompt = MagicMock()
    monkeypatch.setattr("builtins.input", prompt)
    monkeypatch.setattr(sys, "argv", ["measure_render_latency", "--salida", str(report)])

    with pytest.raises(SystemExit) as error:
        probe.main()

    assert error.value.code == 2
    assert "Elige otro nombre con --salida" in capsys.readouterr().err
    assert report.read_text(encoding="utf-8") == "informe anterior"
    prompt.assert_not_called()
