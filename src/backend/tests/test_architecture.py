"""Reglas hexagonales del backend: escaneo AST de cada .py bajo las capas."""
from pathlib import Path

import pytest

from tests.architecture_checker import LAYER_NAMES, check_layers, layer_files

BACKEND = Path(__file__).resolve().parent.parent

DASHBOARD_FILES = [
    "domain/value_objects/dashboard.py",
    "domain/exceptions/dashboard.py",
    "domain/ports/dashboard.py",
    "application/dto/dashboard.py",
    "application/use_cases/get_dashboard_summary.py",
    "application/use_cases/list_districts.py",
    "infrastructure/persistence/in_memory_dashboard.py",
    "interfaces/api/dashboard/router.py",
    "interfaces/api/dashboard/schemas.py",
    "interfaces/api/dashboard/deps.py",
    "interfaces/api/dashboard/app.py",
]


@pytest.mark.parametrize("relative_path", DASHBOARD_FILES)
def test_dashboard_file_exists(relative_path):
    assert (BACKEND / relative_path).is_file()


def test_real_tree_is_scanned_by_directory_not_by_a_fixed_list():
    scanned = {p.relative_to(BACKEND).as_posix() for p in layer_files(BACKEND)}
    assert set(DASHBOARD_FILES) <= scanned
    for layer in LAYER_NAMES:
        assert any(s.startswith(f"{layer}/") for s in scanned), layer


def test_real_tree_respects_the_dependency_rule():
    assert check_layers(BACKEND) == []


# ---------------------------------------------------------------- fixtures ---
def write(root: Path, relative: str, source: str) -> None:
    path = root / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(source, encoding="utf-8")


def violations_for(tmp_path: Path, relative: str, source: str) -> list[str]:
    write(tmp_path, relative, source)
    return check_layers(tmp_path)


@pytest.mark.parametrize(
    "relative, source",
    [
        ("domain/a.py", "from ..infrastructure import x\n"),
        ("domain/entities/a.py", "from ...infrastructure.persistence import x\n"),
        ("domain/a.py", "from .. import infrastructure\n"),
        ("domain/a.py", "from ..application.dto import x\n"),
        ("application/use_cases/a.py", "from ...infrastructure import x\n"),
        ("infrastructure/a.py", "from ..application import x\n"),
    ],
)
def test_relative_imports_to_forbidden_layers_are_detected(tmp_path, relative, source):
    assert violations_for(tmp_path, relative, source) != []


def test_relative_imports_inside_the_same_layer_are_allowed(tmp_path):
    write(tmp_path, "domain/entities/b.py", "X = 1\n")
    assert violations_for(tmp_path, "domain/entities/a.py", "from .b import X\nfrom ..entities import b\n") == []


def test_relative_import_escaping_the_backend_root_is_a_violation(tmp_path):
    assert violations_for(tmp_path, "domain/a.py", "from ... import x\n") != []


def test_new_files_are_found_without_registering_them(tmp_path):
    found = violations_for(tmp_path, "application/use_cases/brand_new.py", "import infrastructure\n")
    assert any("brand_new.py" in v for v in found)


@pytest.mark.parametrize("layer", ["domain", "application"])
@pytest.mark.parametrize(
    "source",
    [
        "import importlib\nimportlib.import_module('infrastructure')\n",
        "from importlib import import_module\nimport_module('infrastructure')\n",
        "__import__('infrastructure')\n",
    ],
)
def test_dynamic_imports_are_detected(tmp_path, layer, source):
    found = violations_for(tmp_path, f"{layer}/a.py", source)
    assert any("dynamic" in v for v in found)


@pytest.mark.parametrize(
    "module", ["sqlite3", "socket", "http.client", "urllib.request", "subprocess", "os", "shutil", "ftplib", "smtplib"]
)
def test_domain_forbids_io_stdlib_modules(tmp_path, module):
    assert violations_for(tmp_path, "domain/a.py", f"import {module}\n") != []


def test_domain_still_allows_pure_stdlib_and_asyncio(tmp_path):
    source = "import asyncio\nfrom dataclasses import dataclass\nfrom datetime import date\n"
    assert violations_for(tmp_path, "domain/a.py", source) == []


def test_application_may_use_domain_and_stdlib_but_not_frameworks(tmp_path):
    write(tmp_path, "application/ok.py", "from domain.x import y\nimport os\n")
    assert check_layers(tmp_path) == []
    write(tmp_path, "application/bad.py", "import fastapi\n")
    assert any("bad.py" in v for v in check_layers(tmp_path))


def test_infrastructure_may_only_depend_on_domain(tmp_path):
    assert violations_for(tmp_path, "infrastructure/a.py", "from application.dto import x\n") != []


def test_interfaces_import_infrastructure_only_in_deps_py(tmp_path):
    write(tmp_path, "interfaces/api/dashboard/deps.py", "from infrastructure.persistence import x\n")
    assert check_layers(tmp_path) == []
    write(tmp_path, "interfaces/api/dashboard/router.py", "from infrastructure.persistence import x\n")
    found = check_layers(tmp_path)
    assert len(found) == 1 and "router.py" in found[0]


def test_interfaces_relative_import_of_infrastructure_outside_deps_is_detected(tmp_path):
    found = violations_for(tmp_path, "interfaces/api/dashboard/router.py", "from ....infrastructure import x\n")
    assert found != []


def test_unknown_third_party_in_infrastructure_is_a_violation(tmp_path):
    assert violations_for(tmp_path, "infrastructure/a.py", "import requests\n") != []
