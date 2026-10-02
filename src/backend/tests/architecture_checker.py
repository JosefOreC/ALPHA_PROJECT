"""Verificador puro de reglas hexagonales (AST) parametrizado por directorio raiz."""
import ast
import sys
from pathlib import Path

LAYER_NAMES = ("domain", "application", "infrastructure", "interfaces")
STDLIB = set(sys.stdlib_module_names)

# Capas internas permitidas por capa; el resto debe ser stdlib (o framework en interfaces).
ALLOWED_LAYERS = {
    "domain": {"domain"},
    "application": {"domain", "application"},
    "infrastructure": {"domain", "infrastructure"},
    "interfaces": {"domain", "application", "infrastructure", "interfaces"},
}
INTERFACES_FRAMEWORKS = {"fastapi", "pydantic", "starlette"}
# stdlib con I/O prohibida en domain (asyncio se permite a proposito).
DOMAIN_FORBIDDEN_STDLIB = {
    "sqlite3", "socket", "http", "urllib", "subprocess", "os", "shutil", "ftplib", "smtplib",
}
DYNAMIC_IMPORT_LAYERS = {"domain", "application"}
COMPOSITION_ROOT = "deps.py"  # unico archivo de interfaces que puede importar infrastructure


def layer_files(root: Path) -> list[Path]:
    return sorted(
        path
        for layer in LAYER_NAMES
        if (root / layer).is_dir()
        for path in (root / layer).rglob("*.py")
        if "__pycache__" not in path.parts
    )


def _imported_tops(tree: ast.AST, package: list[str]) -> list[tuple[str, str]]:
    """(top-level, nombre completo) de cada import; relativos resueltos contra `package`."""
    found: list[tuple[str, str]] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            found += [(a.name.split(".")[0], a.name) for a in node.names]
        elif isinstance(node, ast.ImportFrom):
            if node.level == 0:
                if node.module:
                    found.append((node.module.split(".")[0], node.module))
                continue
            keep = len(package) - (node.level - 1)
            if keep < 0:
                found.append(("<escapes-root>", "." * node.level + (node.module or "")))
                continue
            base = package[:keep]
            if node.module:
                full = [*base, *node.module.split(".")]
                found.append((full[0], ".".join(full)))
            else:
                for alias in node.names:
                    full = [*base, alias.name]
                    found.append((full[0], ".".join(full)))
    return found


def _dynamic_imports(tree: ast.AST) -> list[int]:
    lines = []
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call):
            continue
        func = node.func
        name = func.attr if isinstance(func, ast.Attribute) else getattr(func, "id", "")
        if name in {"import_module", "__import__"}:
            lines.append(node.lineno)
    return lines


def check_file(root: Path, path: Path) -> list[str]:
    relative = path.relative_to(root)
    layer = relative.parts[0]
    where = relative.as_posix()
    tree = ast.parse(path.read_text(encoding="utf-8"), filename=where)
    allowed = ALLOWED_LAYERS[layer]
    problems: list[str] = []

    for top, full in _imported_tops(tree, list(relative.parts[:-1])):
        if top in LAYER_NAMES:
            if top not in allowed:
                problems.append(f"{where}: imports layer '{full}' (forbidden in {layer})")
            elif layer == "interfaces" and top == "infrastructure" and path.name != COMPOSITION_ROOT:
                problems.append(f"{where}: imports infrastructure outside {COMPOSITION_ROOT}")
        elif top in STDLIB:
            if layer == "domain" and top in DOMAIN_FORBIDDEN_STDLIB:
                problems.append(f"{where}: domain imports I/O stdlib '{full}'")
        elif not (layer == "interfaces" and top in INTERFACES_FRAMEWORKS):
            problems.append(f"{where}: imports non-stdlib/unknown '{full}' (forbidden in {layer})")

    if layer in DYNAMIC_IMPORT_LAYERS:
        problems += [f"{where}:{n}: dynamic import in {layer}" for n in _dynamic_imports(tree)]
    return problems


def check_layers(root: Path) -> list[str]:
    return [problem for path in layer_files(root) for problem in check_file(root, path)]
