"""Mide los tiempos de lectura en el servicio de Render del curso."""

import argparse
import csv
from datetime import datetime, timezone
from getpass import getpass
from http.cookiejar import CookieJar
import json
from pathlib import Path
import re
from time import perf_counter, sleep
from urllib.error import HTTPError, URLError
from urllib.request import HTTPCookieProcessor, HTTPRedirectHandler, Request, build_opener

ORIGIN = "https://ecologistica-lima-qolz.onrender.com"
ORDERS_PATH = "/api/pedidos?limit=12&offset=0"
LIMIT_MS = 500
COLUMNS = ("utc", "endpoint", "sample", "http_status", "milliseconds", "valid", "under_500_ms")
DIAGNOSTIC_COLUMNS = ("api_ms", "until_headers_ms")


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def request_json(client, path, *, method="GET", data=None, csrf=None):
    headers = {"Accept": "application/json", "Origin": ORIGIN}
    if data is not None:
        headers["Content-Type"] = "application/json"
    if csrf:
        headers["X-CSRF-Token"] = csrf
    request = Request(ORIGIN + path, method=method, headers=headers,
                      data=json.dumps(data).encode() if data is not None else None)
    start = perf_counter()
    try:
        with client.open(request, timeout=60) as response:
            until_headers = (perf_counter() - start) * 1000
            server_timing = response.headers.get("Server-Timing", "")
            status, body = response.status, response.read()
    except HTTPError as error:
        with error:
            return error.code, (perf_counter() - start) * 1000, None, ("", "")
    except (URLError, TimeoutError, OSError):
        return 0, (perf_counter() - start) * 1000, None, ("", "")
    elapsed = (perf_counter() - start) * 1000
    try:
        payload = json.loads(body) if body else None
    except (ValueError, UnicodeError):
        payload = None
    match = re.search(r"(?:^|,)\s*eco_api;dur=(\d+(?:\.\d+)?)\s*(?:,|$)", server_timing)
    api_ms = match[1] if match else ""
    return status, elapsed, payload, (api_ms, f"{until_headers:.3f}")


def measure(client, report, path, endpoint, count, check_payload, *, diagnostic=False):
    passed = 0
    for index in range(1, count + 1):
        timestamp = datetime.now(timezone.utc).isoformat(timespec="seconds")
        status, elapsed, payload, timings = request_json(client, path)
        valid = status == 200 and isinstance(payload, dict) and check_payload(payload)
        under_limit = valid and elapsed < LIMIT_MS
        row = (timestamp, endpoint, index, status, f"{elapsed:.3f}", valid, under_limit)
        report.writerow(row + timings if diagnostic else row)
        print(f"{endpoint} · muestra {index}: HTTP {status}, {elapsed:.1f} ms", flush=True)
        passed += under_limit
        if index < count:
            sleep(2)
    return passed


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--solo-salud", action="store_true", help="Ejecuta solo las consultas públicas.")
    parser.add_argument("--diagnostico", action="store_true", help="Registra los tiempos de la API y de llegada de cabeceras.")
    parser.add_argument("--salida", type=Path, default=Path("latencia-render.csv"))
    args = parser.parse_args()
    if args.salida.exists():
        parser.error(f"Ya existe {args.salida}. Elige otro nombre con --salida.")

    account = None
    if not args.solo_salud:
        account = {"email": input("Correo de una cuenta autorizada: ").strip(),
                   "password": getpass("Contraseña: ")}
        if not all(account.values()):
            parser.error("Se requiere una cuenta autorizada para medir Pedidos.")

    client = build_opener(HTTPCookieProcessor(CookieJar()), NoRedirect())
    with args.salida.open("x", encoding="utf-8", newline="") as output:
        report = csv.writer(output)
        report.writerow(COLUMNS + DIAGNOSTIC_COLUMNS if args.diagnostico else COLUMNS)
        healthy = lambda payload: payload.get("status") == "ok"
        measure(client, report, "/health", "salud_primera_consulta", 1, healthy, diagnostic=args.diagnostico)
        health_passed = measure(client, report, "/health", "salud_seguimiento", 5, healthy, diagnostic=args.diagnostico)
        if account is None:
            return 0 if health_passed == 5 else 1

        status, _, session, _ = request_json(client, "/api/session", method="POST", data=account)
        del account
        if status != 200 or not isinstance(session, dict) or not session.get("csrf_token"):
            print(f"El inicio de sesión no se pudo verificar (HTTP {status}).")
            return 1

        try:
            orders_passed = measure(client, report, ORDERS_PATH, "pedidos", 5,
                                    lambda payload: isinstance(payload.get("items"), list),
                                    diagnostic=args.diagnostico)
        finally:
            logout_status, _, _, _ = request_json(client, "/api/session", method="DELETE",
                                                  csrf=session["csrf_token"])
            if logout_status != 204:
                print(f"El cierre de sesión no se pudo confirmar (HTTP {logout_status}).")

        print(f"Muestras bajo 500 ms: salud {health_passed}/5, pedidos {orders_passed}/5.")
        return 0 if health_passed == orders_passed == 5 and logout_status == 204 else 1


if __name__ == "__main__":
    raise SystemExit(main())
