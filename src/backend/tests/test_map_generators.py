"""Offline contracts for map generators: no network or repository assets are changed."""
import copy
import importlib.util
import io
import json
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[3]


def load(name):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'src/frontend/scripts' / (name + '.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def sample_style():
    groups = {
        'background': ['background'],
        'fill': ['water', 'park', 'landuse_residential', 'building', 'landuse_industrial', 'sand'],
        'line': ['waterway_river', 'waterway_stream', 'road_motorway', 'road_motorway_casing',
                 'bridge_trunk_primary', 'bridge_trunk_primary_casing', 'tunnel_minor',
                 'tunnel_minor_casing', 'boundary'],
        'symbol': ['water_name', 'poi_shop', 'highway-name-major', 'label_other',
                   'highway-shield-non-us', 'plain'],
        'circle': ['point'],
        'raster': ['hillshade'],
        'fill-extrusion': ['3d_building'],
    }
    layers = [{'id': name, 'type': kind, 'maxzoom': 20} for kind, names in groups.items() for name in names]
    layers.extend({'id': name, 'type': 'fill'} for name in ['park_outline', 'area_hatching', 'road_one_way'])
    next(x for x in layers if x['id'] == 'water_name')['layout'] = {'text-field': ['get', 'name']}
    next(x for x in layers if x['id'] == 'highway-shield-non-us')['filter'] = ['<', ['get', 'ref_length'], 6]
    return {'sources': {'ne2_shaded': {}, 'openmaptiles': {}}, 'layers': layers}


def test_basemap_preserves_input_attribution_and_spanish_labels():
    generator = load('generate-basemap-style')
    original = sample_style()
    before = copy.deepcopy(original)
    tokens = (ROOT / 'src/frontend/src/shared/ui/tokens.css').read_text(encoding='utf-8')
    result = generator.adapt_style(original, tokens)
    assert original == before
    assert 'ne2_shaded' not in result['sources']
    assert 'OpenStreetMap' in result['sources']['openmaptiles']['attribution']
    layers = {layer['id']: layer for layer in result['layers']}
    assert {'hillshade', '3d_building', 'park_outline', 'area_hatching', 'road_one_way'}.isdisjoint(layers)
    assert layers['water_name']['layout']['text-field'][1] == ['get', 'name:es']
    assert layers['highway-shield-non-us']['filter'] == ['<', ['coalesce', ['get', 'ref_length'], 999], 6]
    assert layers['building']['minzoom'] == layers['poi_shop']['minzoom'] == 15
    assert layers['highway-name-major']['minzoom'] == 12
    assert layers['label_other']['minzoom'] == layers['highway-shield-non-us']['minzoom'] == 11
    assert 'maxzoom' not in layers['building'] and 'maxzoom' not in layers['landuse_residential']
    assert layers['road_motorway']['paint']['line-color'] != layers['road_motorway_casing']['paint']['line-color']


def test_basemap_reads_only_its_fixed_input_and_writes_in_its_asset_directory(tmp_path, monkeypatch):
    generator = load('generate-basemap-style')
    frontend = tmp_path / 'frontend'
    (frontend / '.test-deps').mkdir(parents=True)
    (frontend / 'src/shared/ui').mkdir(parents=True)
    (frontend / 'src/shared/ui/tokens.css').write_bytes((ROOT / 'src/frontend/src/shared/ui/tokens.css').read_bytes())
    (frontend / '.test-deps/liberty-style.json').write_text(json.dumps(sample_style()), encoding='utf-8')
    arbitrary = tmp_path / 'outside.json'
    arbitrary.write_text('this is not JSON', encoding='utf-8')
    monkeypatch.setattr(generator, 'ROOT', frontend)
    monkeypatch.setattr('sys.argv', ['generate-basemap-style.py', str(arbitrary)])
    generator.main()
    saved = json.loads((frontend / 'public/maps/lima-pastel.json').read_text(encoding='utf-8'))
    assert saved['metadata']['source'] == 'https://tiles.openfreemap.org/styles/liberty'
    assert arbitrary.read_text(encoding='utf-8') == 'this is not JSON'


@pytest.mark.parametrize('status,code,error', [(200, 'Ok', None), (503, 'Ok', 'HTTP 503'), (200, 'NoRoute', 'NoRoute')])
def test_map_fixtures_fixed_https_host_geographic_coordinates_and_errors(tmp_path, monkeypatch, status, code, error):
    generator = load('generate-map-fixtures')
    calls = []
    closed = []

    class Client:
        def __init__(self, host, timeout):
            assert host == 'router.project-osrm.org' and timeout == 25

        def request(self, method, path):
            calls.append((method, path))
            assert method == 'GET' and path.startswith('/route/v1/driving/')

        def getresponse(self):
            count = 2 if len(calls) == 2 else 3
            response = io.BytesIO(json.dumps({'code': code, 'routes': [{'geometry': {'coordinates': [[-77, -12], [-76.9, -12.1]]}}],
                'waypoints': [{'location': [-77, -12]}, {'location': [-76.9, -12.1]}] + ([{'location': [-76.8, -12.2]}] if count == 3 else [])}).encode())
            response.status = status
            return response

        def close(self):
            closed.append(True)

    (tmp_path / 'src/infrastructure').mkdir(parents=True)
    monkeypatch.setattr(generator, 'ROOT', tmp_path)
    monkeypatch.setattr(generator, 'HTTPSConnection', Client)
    if error:
        with pytest.raises(RuntimeError, match=error):
            generator.main()
        assert not (tmp_path / 'src/infrastructure/limaRoadFixtures.ts').exists()
    else:
        generator.main()
        text = (tmp_path / 'src/infrastructure/limaRoadFixtures.ts').read_text(encoding='utf-8')
        fixtures = json.loads(text.split('export const ROAD_FIXTURES = ')[1])
        assert len(fixtures) == 4 and fixtures[0]['path'][0] == [-12, -77]
        assert fixtures[0]['done'] == 1 and fixtures[1]['done'] == 0
    assert len(closed) == len(calls)
