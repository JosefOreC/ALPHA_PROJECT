"""Check project Markdown paths, GitHub-style anchors, navigation and versions.

Run: python scripts/check_docs.py [--json path]
Offline: external URLs are counted but never requested. Only stdlib is needed.
"""
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse
import collections
import html
import json
import os
import re
import subprocess
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {'.git', 'node_modules', '.venv', 'venv', 'dist', 'build', 'coverage',
            '.pytest_cache', '__pycache__', 'test-results', 'playwright-report'}


def markdown_files():
    # Git also excludes ignored dependency/generated directories; include untracked docs.
    result = subprocess.run(['git', '-c', f'safe.directory={ROOT.as_posix()}',
                             'ls-files', '--cached', '--others', '--exclude-standard', '-z'],
                            cwd=ROOT, check=True, capture_output=True)
    return sorted({ROOT / p for p in result.stdout.decode('utf-8').split('\0')
                   if p and Path(p).suffix.lower() == '.md'
                   and not EXCLUDED.intersection(Path(p).parts) and (ROOT / p).is_file()})


def prose(text):
    lines, fence = [], None
    for line in text.splitlines():
        match = re.match(r'^\s{0,3}(`{3,}|~{3,})', line)
        if match:
            marker = match[1]
            if fence is None:
                fence = marker
            elif marker[0] == fence[0] and len(marker) >= len(fence):
                fence = None
            lines.append('')
        else:
            lines.append('' if fence else line)
    return re.sub(r'<!--.*?-->', '', '\n'.join(lines), flags=re.S)


def anchors(text):
    text = prose(text)
    result = set(re.findall(r'\b(?:id|name)=["\']([^"\']+)["\']', text))
    used = set()
    headings = re.findall(r'^\s{0,3}#{1,6}\s+(.+?)(?:\s+#+)?$', text, re.M)
    headings += re.findall(r'^([^\n]+)\n(?:=+|-+)\s*$', text, re.M)
    for heading in headings:
        heading = re.sub(r'!?\[([^\]]*)\]\([^)]*\)', r'\1', heading)
        heading = html.unescape(re.sub(r'<[^>]+>', '', heading)).lower()
        # GitHub preserves Unicode letters/marks, digits, hyphens and underscores.
        slug = ''.join(c for c in heading if c in '-_ ' or unicodedata.category(c)[0] in 'LMN').replace(' ', '-')
        base, suffix = slug, 0
        while slug in used:
            suffix += 1
            slug = f'{base}-{suffix}'
        used.add(slug)
        result.add(slug)
    return result


def links(text):
    """Inline/reference links, images, HTML href/src and autolinks; ignore code."""
    text = prose(text)
    # Preserve backticked link labels; remove only standalone inline code spans.
    text = re.sub(r'(`+)(.*?)\1', lambda m: ' ' * len(m[0]), text)
    refs = {}
    definition = re.compile(r'^\s{0,3}\[([^\]]+)\]:\s*(<[^>]+>|\S+)', re.M)
    for m in definition.finditer(text):
        refs[m[1].casefold()] = m[2].strip('<>')
        yield text.count('\n', 0, m.start()) + 1, m[2].strip('<>')
    text = definition.sub(lambda m: ' ' * len(m[0]), text)
    inline = re.compile(r'!?\[[^\]\n]*\]\(\s*(<[^>]+>|(?:[^\s()]|\([^()]*\))+)(?:\s+["\'][^\n]*?["\'])?\s*\)')
    occupied = []
    for m in inline.finditer(text):
        occupied.append(m.span())
        yield text.count('\n', 0, m.start()) + 1, m[1].strip('<>')
    for m in re.finditer(r'!?\[([^\]\n]+)\](?:\[([^\]\n]*)\])?', text):
        if any(a <= m.start() < b for a, b in occupied):
            continue
        key = (m[2] or m[1]).casefold()
        if key in refs:
            yield text.count('\n', 0, m.start()) + 1, refs[key]
    for m in re.finditer(r'\b(?:href|src)=["\']([^"\']+)["\']|<(https?://[^>]+)>', text):
        yield text.count('\n', 0, m.start()) + 1, m[1] or m[2]


def exact_path(path):
    try:
        parts = path.relative_to(ROOT).parts
    except ValueError:
        return False
    current = ROOT
    for part in parts:
        if not current.is_dir() or part not in {p.name for p in current.iterdir()}:
            return False
        current /= part
    return current.exists()


def check():
    files = markdown_files()
    contents = {p: p.read_text(encoding='utf-8-sig') for p in files}
    graph = {p: set() for p in files}
    errors, external, local = [], set(), 0
    for source, content in contents.items():
        for line, url in links(content):
            url = html.unescape(url)
            split = urlsplit(url)
            if split.scheme or split.netloc:
                external.add(url)
                continue
            local += 1
            path = unquote(split.path)
            target = Path(os.path.abspath(source.parent / path)) if path else source
            label = f'{source.relative_to(ROOT).as_posix()}:{line}: {url}'
            if not exact_path(target):
                errors.append('Ruta ausente o capitalización incorrecta: ' + label)
                continue
            if target.is_dir() and (target / 'README.md').exists():
                target /= 'README.md'
            if target in graph:
                graph[source].add(target)
                if split.fragment and unquote(split.fragment) not in anchors(contents[target]):
                    errors.append('Encabezado/anchor ausente: ' + label)
        match = re.search(r'V_\d+_\d+_\d+(?=\.md$)', source.name)
        if match:
            declared = re.search(r'\*\*Versión del documento:\*\*\s*(V_\d+_\d+_\d+)', content)
            if declared and declared[1] != match[0]:
                errors.append(f'Versión interna distinta: {source.relative_to(ROOT)}')
        if source.name != 'README.md':
            # A project document must link to an index, not just be indexed.
            if not any(p.name == 'README.md' for p in graph[source]):
                errors.append(f'Sin retorno a índice: {source.relative_to(ROOT)}')
    reached, pending = set(), [ROOT / 'README.md']
    while pending:
        p = pending.pop()
        if p not in reached:
            reached.add(p)
            pending.extend(graph.get(p, set()) - reached)
    for p in files:
        if p not in reached:
            errors.append(f'Markdown no navegable desde README: {p.relative_to(ROOT)}')
    # Each sprint index must select one current version per document kind.
    implementation = ROOT / 'docs/03 Implementación'
    for directory in sorted(implementation.glob('Sprint *')):
        by_kind = collections.defaultdict(list)
        current = [p for p in files if p.parent == directory and p.name != 'README.md']
        for p in current:
            kind = re.sub(r'^\d+\s+|\s+V_\d+_\d+_\d+\.md$', '', p.name)
            by_kind[kind].append(p)
            version = re.search(r'V_\d+_\d+_\d+', p.name)
            if version and not re.search(r'^\|\s*' + version[0] + r'\s*\|', contents[p], re.M):
                errors.append(f'Sin registro de cambio vigente: {p.relative_to(ROOT)}')
            if p not in graph.get(directory / 'README.md', set()):
                errors.append(f'Versión vigente no enlazada por su índice: {p.relative_to(ROOT)}')
        for kind, versions in by_kind.items():
            if len(versions) != 1:
                errors.append(f'Varias versiones activas de {kind}: {directory.relative_to(ROOT)}')
        for archived in [p for p in files if p.parent == directory / 'Histórico' and p.name != 'README.md']:
            if 'HISTÓRICO — no vigente' not in contents[archived]:
                errors.append(f'Histórico sin identificación: {archived.relative_to(ROOT)}')
            if not graph[archived].intersection(current):
                errors.append(f'Histórico sin vínculo vigente: {archived.relative_to(ROOT)}')
    return {'markdown_files': len(files), 'reachable_markdown': len(set(files) & reached),
            'local_links_checked': local, 'external_urls_not_checked': len(external),
            'external_urls': sorted(external), 'errors': errors}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--json', type=Path)
    args = parser.parse_args()
    result = check()
    if args.json:
        args.json.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: v for k, v in result.items() if k != 'external_urls'}, ensure_ascii=False, indent=2))
    raise SystemExit(bool(result['errors']))
