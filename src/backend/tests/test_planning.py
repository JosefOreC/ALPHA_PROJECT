from datetime import datetime, timedelta, timezone
import pytest
from domain.planning import propose

START = datetime(2026,10,9,10,tzinfo=timezone.utc)
ORDER = {'latitud':-12.02,'longitud':-77.01,'peso_kg':50,'ventana_inicio':START,'ventana_fin':START+timedelta(hours=4),'distrito':'Ate'}
FLEET = [{'placa':'ABC-123','tipo_combustible':'DIESEL','capacidad_kg':100,'nombre_completo':'Conductor'}]
CONFIG = {'maxLoadPercent':95}
SETTINGS = {'respectWindows':True,'prioritizeLowEmission':True,'goal':'co2'}


def test_proposal_covers_real_orders_without_savings_claims_or_mutation():
    orders = [dict(ORDER)]
    result = propose(orders,FLEET,(-12,-77),{'DIESEL':2.68},CONFIG,SETTINGS,START)
    assert result['ordersAssigned'] == 1
    assert result['totalKm'] > 0
    assert result['co2Kg'] > 0
    assert result['kmSaved'] is None and result['co2SavedPercent'] is None
    assert orders == [ORDER]


@pytest.mark.parametrize('order,fleet,factors',[
    ({**ORDER,'peso_kg':150},FLEET,{'DIESEL':2.68}),
    ({**ORDER,'ventana_fin':START-timedelta(minutes=1)},FLEET,{'DIESEL':2.68}),
    (ORDER,FLEET,{}),
    ({**ORDER,'latitud':None},FLEET,{'DIESEL':2.68}),
])
def test_capacity_windows_missing_factors_and_coordinates_never_appear_successful(order,fleet,factors):
    with pytest.raises(ValueError):
        propose([order],fleet,(-12,-77),factors,CONFIG,SETTINGS,START)
