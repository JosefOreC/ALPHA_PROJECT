"""Entradas límite y estados inconsistentes deben fallar antes de persistir."""
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from application.dto.driver_dto import CreateDriverRequest, UpdateDriverRequest
from application.dto.vehicle_dto import CreateVehicleDTO, UpdateVehicleDTO
from domain.access_control import Identity
from domain.entities.driver import Driver
from domain.entities.vehicle import Vehicle
from domain.value_objects import DriverStates, VehicleCombustibles, VehicleStates
from interfaces.api.deps import create_app


@pytest.mark.parametrize('changes', [{'nombre_completo':' '}, {'dni':' '}, {'dni':'abcdefgh'}, {'licencia':' '}, {'vehiculo_id':' '}])
def test_driver_rejects_missing_or_malformed_identity(changes):
    data = dict(nombre_completo='Ana Pérez', dni='12345678', licencia='LIC-1', vehiculo_id='v1')
    with pytest.raises(ValueError):
        Driver(**{**data, **changes})


def test_driver_updates_each_field_and_validates_corrupt_state():
    item = Driver('Ana Pérez','12345678','LIC-1','v1')
    item.update_info(dni=' 87654321 ', estado='inactivo')
    item.update_info(nombre_completo=' Ana Nueva ', licencia=' lic-2 ', vehiculo_id=' v2 ')
    item.update_info()
    assert (item.nombre_completo,item.dni,item.licencia,item.vehiculo_id) == ('Ana Nueva','87654321','LIC-2','v2')
    assert not item.is_active()
    item.estado = 'corrupt'
    with pytest.raises(ValueError, match='Estado inválido'):
        item.validate()


@pytest.mark.parametrize('changes', [{'placa':None}, {'placa':'   '}, {'placa':'A!?'}, {'capacidad_kg':0}, {'capacidad_m3':0}])
def test_vehicle_rejects_invalid_plate_and_capacity(changes):
    with pytest.raises(ValueError):
        Vehicle(**{**dict(placa='TST-001',capacidad_kg=100,tipo_combustible='DIESEL'), **changes})


def test_vehicle_updates_optional_values_and_validates_corrupt_enums():
    item = Vehicle('TST-001',100,'DIESEL')
    item.update_info(placa=' tst-002 ',capacidad_m3=2)
    item.update_info(capacidad_kg=200,tipo_combustible='gnv',estado='inactivo')
    item.update_info()
    assert item.placa == 'TST-002' and item.capacidad_m3 == 2 and not item.is_active()
    item.estado = 'corrupt'
    with pytest.raises(ValueError, match='Estado inválido'):
        item.validate()
    item.estado = VehicleStates.DISPONIBLE
    item.tipo_combustible = 'corrupt'
    with pytest.raises(ValueError, match='combustible'):
        item.validate()


@pytest.mark.parametrize('enum', [DriverStates, VehicleStates, VehicleCombustibles])
@pytest.mark.parametrize('value', [None, {}, [], 123, 'unknown'])
def test_enums_reject_invalid_values(enum, value):
    with pytest.raises(ValueError):
        enum.parse(value)


def test_enum_representations_are_stable():
    assert str(DriverStates.ACTIVO) == 'ACTIVO'
    assert str(VehicleStates.DISPONIBLE) == 'DISPONIBLE'
    assert str(VehicleCombustibles.GNV) == repr(VehicleCombustibles.GNV) == 'GNV'


def test_dtos_distinguish_null_from_valid_values_and_reject_blank_plates():
    assert CreateVehicleDTO(placa='tst-001',capacidad_kg=100,tipo_combustible='DIESEL',estado=None).estado == VehicleStates.DISPONIBLE
    assert UpdateVehicleDTO(placa=None,tipo_combustible=None,estado=None).placa is None
    assert UpdateVehicleDTO(placa=' tst-002 ',tipo_combustible='gnv',estado='en_ruta').estado == VehicleStates.EN_RUTA
    assert UpdateDriverRequest(dni=None,estado=None).dni is None
    assert UpdateDriverRequest(dni='12345678',estado='inactivo').estado == DriverStates.INACTIVO
    for dto in (CreateVehicleDTO,UpdateVehicleDTO):
        with pytest.raises(ValidationError):
            dto(placa='   ',capacidad_kg=100,tipo_combustible='DIESEL')
    for dto in (CreateDriverRequest,UpdateDriverRequest):
        with pytest.raises(ValidationError):
            dto(nombre_completo='Ana',dni='abcdefgh',licencia='LIC-1',vehiculo_id='v1')


def test_fleet_api_missing_records_conflicts_and_domain_validation():
    client = TestClient(create_app(authenticate=lambda: Identity('u1','Ana','admin'),protect_mutation=lambda: None))
    base = '/api/v1/vehicles'
    created = client.post(base,json=dict(placa='EDG-001',capacidad_kg=100,tipo_combustible='DIESEL')).json()
    other = client.post(base,json=dict(placa='EDG-002',capacidad_kg=100,tipo_combustible='DIESEL')).json()
    assert client.get(f'{base}/{created["vehiculo_id"]}').json()['placa'] == 'EDG-001'
    assert client.get(f'{base}/missing').status_code == 404
    assert client.put(f'{base}/missing',json={'estado':'INACTIVO'}).status_code == 404
    assert client.put(f'{base}/{other["vehiculo_id"]}',json={'placa':'EDG-001'}).status_code == 409
    assert client.post(base,json=dict(placa='A!!',capacidad_kg=100,tipo_combustible='DIESEL')).status_code == 422
    assert client.put(f'{base}/{other["vehiculo_id"]}',json={'placa':'A!!'}).status_code == 422
    for method,path in [('put','/api/v1/drivers/missing'),('patch','/api/v1/drivers/missing/activate'),('patch','/api/v1/drivers/missing/deactivate')]:
        assert client.request(method,path,json={} if method == 'put' else None).status_code == 404
