from fastapi import HTTPException
from fastapi.testclient import TestClient
from domain.access_control import Identity
from domain.entities.order import Order
from domain.value_objects import OrderStatus
from infrastructure.persistence.memory_orders import MemoryOrderRepository
from interfaces.api.deps import create_app


def fixture():
    return MemoryOrderRepository([Order(str(i),None,'Cliente ficticio '+str(i),'Direccion ficticia','Ate',
                                       '2026-11-12T08:00:00-05:00','2026-11-12T18:00:00-05:00',2.5,'Prueba',OrderStatus.PENDING)
                                  for i in range(100)])


def test_private_etag_revalidation_and_gzip_keep_the_same_authorized_payload():
    client = TestClient(create_app(fixture(),lambda: Identity('u','Persona ficticia','planner'),lambda:None))
    url = '/api/pedidos?limit=100'
    plain = client.get(url,headers={'Accept-Encoding':'identity'})
    compressed = client.get(url,headers={'Accept-Encoding':'gzip'})
    assert plain.status_code == compressed.status_code == 200
    assert plain.content == compressed.content
    assert compressed.headers['content-encoding']=='gzip'
    with client.stream('GET', url, headers={'Accept-Encoding':'gzip'}) as stream:
        wire = b''.join(stream.iter_raw())
    assert gzip.decompress(wire)==plain.content and len(wire)<len(plain.content)/2
    assert 'Accept-Encoding' in compressed.headers['vary']
    assert compressed.headers['cache-control'].startswith('private')
    assert plain.headers['etag']==compressed.headers['etag']
    cached = client.get(url,headers={'If-None-Match':'W/'+plain.headers['etag']})
    assert cached.status_code==304 and cached.content==b''
    assert client.get('/api/session').headers['cache-control']=='no-store'
    assert client.post('/api/pedidos',json={}).headers['cache-control']=='no-store'


def test_conditional_requests_still_require_authorization_and_do_not_cache_errors():
    def denied():
        raise HTTPException(401,'Inicia sesion')
    client=TestClient(create_app(fixture(),denied,lambda:None))
    result=client.get('/api/pedidos',headers={'If-None-Match':'*'})
    assert result.status_code==401 and result.headers['cache-control']=='no-store'
    assert 'etag' not in result.headers


def test_changed_data_invalidates_etag_and_pagination_bounds_are_enforced():
    repository=fixture()
    client=TestClient(create_app(repository,lambda:Identity('u','Persona ficticia','planner'),lambda:None))
    first=client.get('/api/pedidos?limit=1')
    repository._orders.pop('0')
    changed=client.get('/api/pedidos?limit=1',headers={'If-None-Match':first.headers['etag']})
    assert changed.status_code==200 and changed.headers['etag']!=first.headers['etag']
    for url in ['/api/v1/vehicles?limit=0','/api/v1/drivers?limit=101','/api/audit?offset=-1&limit=20']:
        assert client.get(url).status_code in (403,422)
import gzip
