# Backend - ALPHA_PROJECT

## Propósito

Esta carpeta contiene la aplicación backend del proyecto ALPHA_PROJECT, desarrollada con FastAPI y Python. Aquí se implementarán todos los servicios, APIs, modelos de datos y lógica empresarial de la aplicación.

## Próximos Pasos

La base de pruebas se prepara desde la raíz con `.venv\Scripts\python.exe scripts/create_test_db.py`, usando `DATABASE_URL` en `.env`. Ver [guía de configuración y datos](../../docs/03%20Implementaci%C3%B3n/Base%20de%20datos%20de%20pruebas.md). Instalar `requirements-postgres.txt` para este comando; la API conserva sus adaptadores en memoria hasta integrar persistencia explícitamente.

- [ ] Configurar estructura base de FastAPI
- [ ] Definir modelos de datos
- [ ] Implementar autenticación y autorización
- [ ] Crear endpoints principales
- [ ] Configurar base de datos
