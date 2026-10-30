"""El umbral debe fallar si falta evidencia o una métrica cae por debajo de 90 %."""
import importlib.util
import json
from pathlib import Path

import pytest

spec = importlib.util.spec_from_file_location('coverage_gate', Path(__file__).resolve().parents[3] / 'scripts/check_python_coverage.py')
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)


@pytest.mark.parametrize('lines,branches,passed', [(90,90,True),(100,89,False),(89,100,False),(100,100,True)])
def test_gate_requires_both_metrics_independently(lines,branches,passed):
    metrics,result=gate.check({'totals':{'covered_lines':lines,'num_statements':100,'covered_branches':branches,'num_branches':100}})
    assert result is passed
    assert metrics == {'Líneas':lines,'Ramas':branches}


@pytest.mark.parametrize('covered,total',[(0,0),(-1,100),(101,100),('90',100),(90,100.0)])
def test_invalid_counters_never_pass(covered,total):
    with pytest.raises(ValueError):
        gate.check({'totals':{'covered_lines':covered,'num_statements':total,'covered_branches':100,'num_branches':100}})


def test_cli_rejects_missing_and_malformed_reports(tmp_path,capsys,monkeypatch):
    monkeypatch.chdir(tmp_path)
    path=tmp_path/'reports/coverage/backend.json'
    path.parent.mkdir(parents=True)
    assert gate.main([])==1
    path.write_text('{bad',encoding='utf-8')
    assert gate.main([])==1
    path.write_text('{}',encoding='utf-8')
    assert gate.main([])==1
    assert 'no verificable' in capsys.readouterr().out


@pytest.mark.parametrize('covered,exit_code',[(90,0),(89,1)])
def test_cli_returns_failure_for_coverage_below_threshold(tmp_path,covered,exit_code,monkeypatch):
    monkeypatch.chdir(tmp_path)
    path=tmp_path/'reports/coverage/backend.json'
    path.parent.mkdir(parents=True)
    path.write_text(json.dumps({'totals':{'covered_lines':covered,'num_statements':100,'covered_branches':90,'num_branches':100}}),encoding='utf-8')
    assert gate.main([])==exit_code


def test_cli_cannot_choose_an_arbitrary_file(tmp_path):
    with pytest.raises(SystemExit) as error:
        gate.main([str(tmp_path/'outside.json')])
    assert error.value.code == 2
