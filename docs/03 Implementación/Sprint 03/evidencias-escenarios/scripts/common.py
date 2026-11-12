import httpx, json, subprocess, datetime, os, pathlib
from zoneinfo import ZoneInfo
API='http://127.0.0.1:8000'; ORIGIN='http://localhost:5173'
PW='SoloPruebas_Cambiar_2026!'
OUT=pathlib.Path('/tmp/AP/docs/03 Implementación/Sprint 03/evidencias-escenarios')
COMMIT=subprocess.check_output(['git','-C','/tmp/AP','rev-parse','--short','HEAD'],text=True).strip()
def stamp(): return datetime.datetime.now(ZoneInfo('America/Lima')).strftime('%d/%m/%Y %H:%M:%S')
def client(): return httpx.Client(base_url=API, headers={'Origin':ORIGIN}, timeout=30)
def login(c, user):
    r=c.post('/api/session', json={'email':f'{user}@example.invalid','password':PW})
    c.headers['X-CSRF-Token']=r.json().get('csrf_token','') if r.status_code==200 else ''
    return r
def psql(q):
    return subprocess.check_output(['sudo','-u','postgres','psql','-d','ecologistica_test','-AtF','|','-c',q],text=True).strip()
class Log:
    def __init__(s,name,title):
        s.name=name; s.lines=[f'# {title}',f'Ejecución: {stamp()} (America/Lima)',f'Commit probado: {COMMIT} (rama fix/sprint4-owasp-revision)','Entorno: Ubuntu 26.04, Python 3.14, PostgreSQL 18 + PostGIS 3.6, datos ficticios de scripts/create_test_db.py','']
    def __call__(s,*a): s.lines.append(' '.join(str(x) for x in a)); print(*a)
    def save(s): (OUT/f'{s.name}.txt').write_text('\n'.join(s.lines)+'\n',encoding='utf-8')
