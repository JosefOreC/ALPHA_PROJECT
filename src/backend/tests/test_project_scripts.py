"""Scripts administrativos aislados: nunca conectar ni modificar una base real."""
import ast
import importlib.util
import json
import runpy
import sys
from contextlib import contextmanager
from dataclasses import replace
from datetime import date
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock

import dotenv
import psycopg
import pytest

from infrastructure.persistence import database as app_database
from tests.test_postgres_services import Connection
ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / 'scripts'))
from test_db.config import Settings, SetupError
from test_db import database as seed_database

def load(name):
    spec = importlib.util.spec_from_file_location(f'script_test_{name}', ROOT / 'scripts' / f'{name}.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.fixture(autouse=True)
def isolate(monkeypatch):
    monkeypatch.setattr(dotenv, 'load_dotenv', lambda *args, **kwargs: None)
    def forbidden(*args, **kwargs):
        raise AssertionError('La prueba no puede abrir una conexión real.')
    monkeypatch.setattr(psycopg, 'connect', forbidden)


class ScriptConnection(Connection):
    def execute(self, sql, params=()):
        return super().execute(sql.as_string() if isinstance(sql, psycopg.sql.Composable) else sql, params)

    def cursor(self):
        return self

    def executemany(self, query, values):
        self.calls.append((query.as_string(), values))


def connect_to(conn):
    @contextmanager
    def connect(*args, **kwargs):
        yield conn
    return connect


def test_documentation_parser_handles_fences_references_and_duplicate_anchors():
    docs = load('check_docs')
    text = '# Título\n# Título\n<!-- [oculto](missing) -->\n```python\n[no](missing)\n```\n[real][ref]\n[ref]: <README.md>\n[inline](README.md)\n<a id="manual" href="README.md">ok</a>\n<https://example.invalid>\n'
    assert {'título','título-1','manual'} <= docs.anchors(text)
    found = [url for _,url in docs.links(text)]
    assert 'missing' not in found and 'README.md' in found and 'https://example.invalid' in found


def test_documentation_checks_current_repository():
    result = load('check_docs').check()
    assert result['markdown_files'] > 0 and result['errors'] == []


def test_documentation_reports_missing_paths_anchors_versions_and_sprint_history(tmp_path,monkeypatch):
    docs = load('check_docs')
    sprint = tmp_path/'docs/03 Implementación/Sprint 1'
    history = sprint/'Histórico'
    history.mkdir(parents=True)
    contents = {
        tmp_path/'README.md': '[sprint](docs/03%20Implementaci%C3%B3n/Sprint%201)\n[external](https://example.invalid)\n[bad](absent.md)\n[anchor](#missing)\n',
        sprint/'README.md': '[inicio](../../../README.md)\n',
        sprint/'01 Plan V_1_0_0.md': '**Versión del documento:** V_2_0_0\n',
        sprint/'01 Plan V_2_0_0.md': '# Plan\n',
        history/'old.md': '# Old\n',
    }
    for path, content in contents.items():
        path.write_text(content,encoding='utf-8')
    monkeypatch.setattr(docs,'ROOT',tmp_path)
    monkeypatch.setattr(docs,'markdown_files',lambda: sorted(contents))
    errors='\n'.join(docs.check()['errors'])
    for phrase in ('Ruta ausente','anchor ausente','Versión interna','Sin retorno','no navegable','Sin registro','no enlazada','Varias versiones','Histórico sin identificación','Histórico sin vínculo'):
        assert phrase in errors
    assert not docs.exact_path(tmp_path.parent/'outside')
    assert not docs.exact_path(tmp_path/'README.md'/'child')


@pytest.mark.parametrize('existing,configured',[(False,False),(True,True)])
def test_create_admin_uses_environment_hashes_password_and_initializes_parameters(monkeypatch,capsys,existing,configured):
    module=load('create_admin')
    conn=ScriptConnection({'SELECT rol FROM usuarios':[{'rol':'ADMIN'}] if existing else [],'SELECT rol FROM roles':[{'rol':'ADMIN'}],
                           'SELECT 1 FROM parametros':[{'n':1}] if configured else []})
    monkeypatch.setattr(module,'connection',connect_to(conn))
    monkeypatch.setattr(sys,'argv',['create_admin.py','--from-env'])
    for key,value in {'ADMIN_INITIAL_NAME':' Ana ','ADMIN_INITIAL_EMAIL':' ANA@EXAMPLE.INVALID ','ADMIN_INITIAL_PASSWORD':'test password 123'}.items():
        monkeypatch.setenv(key,value)
    module.main()
    inserts=[args for sql,args in conn.calls if sql.startswith('INSERT INTO usuarios')]
    assert bool(inserts) != existing
    if inserts:
        assert inserts[0][1:3] == ('Ana','ana@example.invalid')
        assert inserts[0][3].startswith('pbkdf2_sha256$')
    assert 'test password 123' not in capsys.readouterr().out


@pytest.mark.parametrize('change,message', [({'ADMIN_INITIAL_NAME':'x'},'nombre'),({'ADMIN_INITIAL_EMAIL':'bad'},'correo'),({'ADMIN_INITIAL_PASSWORD':'short'},'contraseña')])
def test_create_admin_rejects_invalid_initial_credentials(monkeypatch,change,message):
    module=load('create_admin');conn=ScriptConnection({'SELECT rol FROM roles':[{'rol':'ADMIN'}]})
    monkeypatch.setattr(module,'connection',connect_to(conn));monkeypatch.setattr(sys,'argv',['create_admin.py','--from-env'])
    for key,value in {'ADMIN_INITIAL_NAME':'Ana','ADMIN_INITIAL_EMAIL':'ana@example.invalid','ADMIN_INITIAL_PASSWORD':'test password 123',**change}.items():
        monkeypatch.setenv(key,value)
    with pytest.raises(ValueError,match=message):module.main()
    assert not any('INSERT INTO usuarios' in sql for sql,_ in conn.calls)


@pytest.mark.parametrize('match',[False,True])
def test_create_admin_interactive_confirmation_and_missing_roles(monkeypatch,match):
    module=load('create_admin');conn=ScriptConnection()
    monkeypatch.setattr(module,'connection',connect_to(conn));monkeypatch.setattr(sys,'argv',['create_admin.py'])
    with pytest.raises(ValueError,match='rol administrador'):module.main()
    conn.responses={'SELECT rol FROM roles':[{'rol':'ADMIN'}],'SELECT 1 FROM parametros':[{'n':1}]}
    values=iter(['Ana','ana@example.invalid']);passwords=iter(['password12345','password12345' if match else 'different'])
    monkeypatch.setattr('builtins.input',lambda *args:next(values));monkeypatch.setattr(module.getpass,'getpass',lambda *args:next(passwords))
    if match:module.main()
    else:
        with pytest.raises(ValueError,match='no coinciden'):module.main()


@pytest.mark.parametrize('dsn',['','sqlite:///test','postgresql://localhost/postgres','postgresql://localhost/template0','postgresql://localhost/a/b'])
def test_initialize_database_rejects_unsafe_destinations(monkeypatch,dsn):
    module=load('initialize_database');monkeypatch.setenv('DATABASE_URL',dsn)
    with pytest.raises(ValueError,match='base de aplicación'):module.main()


@pytest.mark.parametrize('available,exists,tables',[(False,False,False),(True,True,True),(True,False,False)])
def test_initialize_database_preserves_existing_tables_and_prepares_empty_schema(monkeypatch,available,exists,tables):
    module=load('initialize_database');monkeypatch.setenv('DATABASE_URL','postgresql://tester@localhost/app_test');monkeypatch.setenv('DATABASE_ADMIN_DB','postgres')
    conn=ScriptConnection({'pg_available_extensions':[(1,)] if available else [],'pg_database':[(1,)] if exists else [],'pg_tables':[(1,)] if tables else []})
    monkeypatch.setattr(psycopg,'connect',lambda *args,**kwargs:conn)
    if not available:
        with pytest.raises(ValueError,match='PostGIS'):module.main()
    else:
        module.main()
        assert any('CREATE TABLE' in sql for sql,_ in conn.calls) != tables
        assert any('CREATE DATABASE' in sql for sql,_ in conn.calls) != exists
        if not tables:assert any('INSERT INTO roles' in sql for sql,_ in conn.calls)


@pytest.mark.parametrize('fail',[False,True])
def test_migration_cli_applies_scripts_or_exits_on_failure(monkeypatch,fail,capsys):
    conn=ScriptConnection({'CREATE':RuntimeError('private DSN')} if fail else {})
    monkeypatch.setattr(app_database,'connection',connect_to(conn))
    if fail:
        with pytest.raises(SystemExit) as caught:runpy.run_path(str(ROOT/'scripts/migrate.py'),run_name='__main__')
        assert caught.value.code==1
    else:runpy.run_path(str(ROOT/'scripts/migrate.py'),run_name='__main__')
    assert 'private DSN' not in capsys.readouterr().out


def test_backend_launcher_passes_explicit_local_binding(monkeypatch):
    import uvicorn
    run=MagicMock();monkeypatch.setattr(uvicorn,'run',run)
    runpy.run_path(str(ROOT/'scripts/run_backend.py'),run_name='__main__')
    assert run.call_args.kwargs['host']=='127.0.0.1' and run.call_args.kwargs['port']==8000


@pytest.mark.parametrize('invalid',[None,'actor','grant'])
def test_rbac_generator_validates_policy_before_writing(monkeypatch,invalid):
    read=Path.read_text;writes=[]
    policy=json.loads((ROOT/'src/shared/rbac.json').read_text(encoding='utf-8'))
    if invalid=='actor':policy['excludedActor']['code']='admin'
    if invalid=='grant':policy['permissions']['invalid']={'unknown':'all'}
    monkeypatch.setattr(Path,'read_text',lambda path,*args,**kwargs:json.dumps(policy) if path.name=='rbac.json' else read(path,*args,**kwargs))
    monkeypatch.setattr(Path,'write_text',lambda path,content,**kwargs:writes.append(content) or len(content))
    if invalid:
        with pytest.raises(ValueError):runpy.run_path(str(ROOT/'scripts/generate-rbac.py'))
        assert not writes
    else:
        runpy.run_path(str(ROOT/'scripts/generate-rbac.py'))
        ast.parse(writes[0]);assert 'ROLE_ALIASES' in writes[0]


@pytest.fixture
def settings():
    return Settings('postgresql://tester@localhost/seed_test','seed_test','postgres',True,date(2026,10,30),1,20,'Test password 123')


@pytest.mark.parametrize('create,exists',[(False,False),(True,False),(True,True)])
def test_seed_database_creation_uses_maintenance_only_when_authorized(monkeypatch,settings,create,exists):
    conn=ScriptConnection({'SELECT 1 FROM pg_database':[(1,)] if exists else []})
    connect=MagicMock(return_value=conn);monkeypatch.setattr(psycopg,'connect',connect)
    seed_database.ensure_database(replace(settings,create_if_missing=create))
    assert connect.called==create
    if create:assert any('CREATE DATABASE' in sql for sql,_ in conn.calls)!=exists


@pytest.mark.parametrize('case',['empty','marked','reset','wrong-db','foreign','bad-owner','missing-table','changed'])
def test_seed_loader_protects_ownership_and_binds_json_and_geometry(monkeypatch,settings,case):
    expected=set(seed_database.TABLES)|{seed_database.METADATA}
    signature=seed_database.seed_signature(settings)
    tables=sorted(expected) if case in ('marked','reset','bad-owner','missing-table','changed') else ['foreign'] if case=='foreign' else []
    if case=='missing-table':tables.remove('usuarios')
    metadata=[('wrong-owner' if case=='bad-owner' else seed_database.OWNER,seed_database.SCHEMA_VERSION,{} if case=='changed' else signature)]
    conn=ScriptConnection({'SELECT current_database':[(settings.database_name if case!='wrong-db' else 'other',)],'SELECT tablename':[(t,) for t in tables],
                           'SELECT owner':metadata,'SELECT count(*)':[(1,)]})
    monkeypatch.setattr(seed_database,'ensure_database',lambda *args:None);monkeypatch.setattr(psycopg,'connect',lambda **kwargs:conn)
    dataset={table:[] for table in seed_database.TABLES}
    dataset['usuarios']=[{'usuario_id':'u1','detalle':{'safe':True}}]
    dataset['rutas']=[{'ruta_id':'r1','geometria':{'type':'LineString','coordinates':[[-77,-12],[-77.1,-12.1]]}}]
    if case in ('wrong-db','foreign','bad-owner','missing-table','changed'):
        with pytest.raises(SetupError):seed_database.prepare_database(settings,dataset)
        assert not any('TRUNCATE' in sql or 'INSERT INTO' in sql for sql,_ in conn.calls)
    else:
        counts=seed_database.prepare_database(settings,dataset,reset=case=='reset')
        assert set(counts)==set(seed_database.TABLES)
        assert any('ST_SetSRID' in sql for sql,_ in conn.calls)
        assert any('TRUNCATE' in sql for sql,_ in conn.calls)==(case=='reset')


@pytest.mark.parametrize('state',['28P01','28000','3D000','42501','0A000','58P01','55P03',None])
def test_seed_database_errors_never_echo_credentials(state):
    message=seed_database.database_error_message(SimpleNamespace(sqlstate=state))
    assert 'PostgreSQL' in message or 'PostGIS' in message or 'base' in message
    assert 'postgresql://' not in message
