"""Reproduce the technical snapshot; does not enable real-database integration.

Run with the repository virtualenv Python and one task argument:
    quality, coverage, backend, ui, inventory, docs, docs-baseline, node,
    markdown, or backend-after-docs.
Each execution records its own commit, command, exit code and Lima timestamps.
"""
from datetime import datetime, timedelta, timezone
from hashlib import sha256
from pathlib import Path
import gzip
import importlib.metadata
import json
import os
import platform
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[4]
OUTPUT = Path(__file__).resolve().parent
FRONTEND = ROOT / 'src/frontend'
LIMA = timezone(timedelta(hours=-5), 'America/Lima')


def now():
    return datetime.now(LIMA).isoformat(timespec='seconds')


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT, encoding='utf-8').strip()


def save(name, data):
    (OUTPUT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def run(name, command, cwd):
    env = os.environ.copy()
    env['PYTHONPATH'] = str(ROOT / 'src/backend')
    env['PYTHONIOENCODING'] = 'utf-8'
    env['NO_COLOR'] = '1'
    env['ECOLOGISTICA_VERIFY_DATABASE'] = '0'
    env.pop('ECOLOGISTICA_TEST_ENV_FILE', None)
    record = dict(commit=git('rev-parse', 'HEAD'), branch=git('branch', '--show-current'),
                  started_lima=now(), command=command, cwd=Path(cwd).relative_to(ROOT).as_posix() or '.',
                  database_integration=False, status='running', python=platform.python_version(),
                  working_tree=git('status', '--porcelain'))
    save(name + '.json', record)
    with (OUTPUT / (name + '.txt')).open('w', encoding='utf-8') as output:
        result = subprocess.run(command, cwd=cwd, env=env, stdout=output, stderr=subprocess.STDOUT)
    record.update(finished_lima=now(), exit_code=result.returncode, status='finished',
                  output_sha256=sha256((OUTPUT / (name + '.txt')).read_bytes()).hexdigest())
    save(name + '.json', record)
    print(json.dumps(record, ensure_ascii=False), flush=True)
    return result.returncode


def inventory():
    assets = []
    for path in sorted((FRONTEND / 'dist').rglob('*')):
        if path.is_file() and (path.suffix in {'.js', '.css'} or path.name == 'index.html'):
            content = path.read_bytes()
            assets.append(dict(path=path.relative_to(FRONTEND / 'dist').as_posix(), bytes=len(content),
                               gzip_bytes=len(gzip.compress(content, mtime=0)), sha256=sha256(content).hexdigest()))
    versions = {}
    for name in ('fastapi', 'starlette', 'pytest', 'pytest-cov', 'psycopg'):
        try:
            versions[name] = importlib.metadata.version(name)
        except importlib.metadata.PackageNotFoundError:
            versions[name] = 'not installed'
    record = dict(captured_lima=now(), timezone='America/Lima (UTC-05:00)',
                  commit=git('rev-parse', 'HEAD'), branch=git('branch', '--show-current'),
                  python=platform.python_version(), os=platform.platform(), python_packages=versions,
                  node=subprocess.check_output(['node', '--version'], encoding='utf-8').strip(),
                  source_diff=git('diff', '--name-only', 'HEAD', '--', 'src', 'scripts'),
                  assets=assets, note='Build artifact bytes, not measured HTTP transfer or emissions.')
    save('inventario.json', record)
    print(json.dumps(record, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    task = sys.argv[1]
    npm = shutil.which('npm.cmd' if os.name == 'nt' else 'npm')
    if task == 'inventory':
        inventory()
        sys.exit(0)
    if task == 'quality':
        build = run('compilacion', [npm, 'run', 'build'], FRONTEND)
        lint = run('lint', [npm, 'run', 'lint'], FRONTEND)
        sys.exit(build or lint)
    commands = {
        'coverage': ('frontend-cobertura', [npm, 'run', 'test:coverage'], FRONTEND),
        'backend': ('backend-pruebas', [sys.executable, '-m', 'pytest', 'src/backend/tests', '-q', '-rs', '-p', 'no:cacheprovider'], ROOT),
        'ui': ('interfaz-pruebas', [npm, 'run', 'test:ui'], FRONTEND),
        'docs': ('documentacion', [sys.executable, 'scripts/check_docs.py'], ROOT),
        'docs-baseline': ('documentacion-previa', [sys.executable, 'scripts/check_docs.py'], ROOT),
        'node': ('frontend-node', [npm, 'run', 'test:orders'], FRONTEND),
        'backend-after-docs': ('backend-postdocumentacion', [sys.executable, '-m', 'pytest', 'src/backend/tests', '-q', '-rs', '-p', 'no:cacheprovider'], ROOT),
        'markdown': ('markdown', [npm, 'exec', '--cache', str(ROOT / '.npm-cache'), '--ignore-scripts', '--yes', '--package=markdownlint-cli2@0.24.1', '--', 'markdownlint-cli2'], ROOT),
    }
    sys.exit(run(*commands[task]))
