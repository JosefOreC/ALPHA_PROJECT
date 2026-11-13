"""Measure actual HTTP encoding/conditional responses on isolated synthetic orders."""
from pathlib import Path
from datetime import datetime, timezone
import gzip
import json
import os
import statistics
import subprocess
import sys
import time
from urllib.request import Request, urlopen
from urllib.error import HTTPError

ROOT = Path(__file__).resolve().parents[1]
stage, output = sys.argv[1:]
env = os.environ.copy()
env['PYTHONPATH'] = str(ROOT / ('.test-deps/green-it/before/src/backend' if stage == 'before' else 'src/backend'))
server = subprocess.Popen([sys.executable, 'scripts/green_it_fixture.py', 'src/frontend/dist'], cwd=ROOT,
                          env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
started = datetime.now(timezone.utc).isoformat()
url = 'http://127.0.0.1:5189/api/pedidos?limit=100'
result = {}
try:
    for attempt in range(100):
        try:
            urlopen('http://127.0.0.1:5189/health', timeout=1).close()
            break
        except OSError:
            time.sleep(.1)
    for encoding in ('identity', 'gzip'):
        samples, sizes = [], []
        for i in range(35):
            t0 = time.perf_counter()
            with urlopen(Request(url, headers={'Accept-Encoding': encoding}), timeout=10) as response:
                body = response.read()
                headers = dict(response.headers.items())
            elapsed = (time.perf_counter() - t0)*1000
            actual_encoding = next((value for name,value in headers.items() if name.lower()=='content-encoding'), None)
            decoded = gzip.decompress(body) if actual_encoding == 'gzip' else body
            assert len(json.loads(decoded)['items'])==100
            if i>=5:
                samples.append(elapsed); sizes.append(len(body))
        result[encoding] = dict(samples_ms=samples, mean_ms=statistics.mean(samples), median_ms=statistics.median(samples),
                                p95_ms=sorted(samples)[int(len(samples)*.95)-1], body_bytes=sizes[0], response_headers=headers)
    etag = next((value for name,value in headers.items() if name.lower()=='etag'), '"baseline-no-etag"')
    try:
        response = urlopen(Request(url, headers={'If-None-Match': etag}), timeout=10)
    except HTTPError as error:
        response = error
    with response:
        result['conditional'] = {'status':response.status,'body_bytes':len(response.read())}
finally:
    server.terminate()
    server.wait(timeout=10)
Path(output).write_text(json.dumps({'stage':stage,'started_utc':started,'finished_utc':datetime.now(timezone.utc).isoformat(),
                                  'dataset':'150 synthetic orders; real HTTP localhost; 100 returned; 5 warmups + 30 samples/mode; no database',
                                  'commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),
                                  'result':result},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({mode:{k:v for k,v in data.items() if k!='samples_ms' and k!='response_headers'} for mode,data in result.items()}))
