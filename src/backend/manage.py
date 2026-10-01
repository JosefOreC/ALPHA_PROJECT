import sys
import uvicorn


def main():
    args = sys.argv[1:]
    command = args[0] if args else "runserver"

    if command in ("runserver", "start"):
        port = 8000
        host = "127.0.0.1"
        if len(args) > 1:
            try:
                port = int(args[1])
            except ValueError:
                pass
        print(f"Iniciando servidor de desarrollo en http://{host}:{port}")
        uvicorn.run("interfaces.api.main:app", host=host, port=port, reload=True)
    elif command == "test":
        import pytest
        sys.exit(pytest.main(["tests"]))
    else:
        print(f"Comando '{command}' no reconocido. Uso: python manage.py [runserver [puerto]|test]")


if __name__ == "__main__":
    main()
