"""Aggregate the three measured runs; keep estimates separate from measurements."""
from pathlib import Path
from datetime import datetime, timezone
from statistics import median
import base64
import hashlib
import json
import subprocess

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
before=json.loads((HERE/'before-summary.json').read_text(encoding='utf-8'))
after=json.loads((HERE/'after-summary.json').read_text(encoding='utf-8'))
output={'captured_utc':datetime.now(timezone.utc).isoformat(),
        'before_commit':'3b5bdae3930856101e8f8d7955813bc9ddaa9619',
        'implementation_commit':'9f953d6acc79d569d3896ab1e2a161d8321b3720',
        'method':'median of 3 production-build mobile Lighthouse runs; controlled fixture; localhost HTTP',
        'model':{'name':'SWDM v4, first visit, global intensity', 'kwh_per_GB':.300,'gCO2e_per_kwh':494,
                 'GB_bytes':1000000000,'new_visitor_ratio':1,'return_visitor_ratio':0,'green_hosting_factor':0,
                 'source':'https://sustainablewebdesign.org/estimating-digital-emissions/',
                 'annual_visits_scenario':10000,'annual_visits_are_observed':False},'pages':{}}
for scenario in ('login','pedidos'):
    values={}
    for stage,data in [('before',before),('after',after)]:
        runs=[item for item in data['results'] if item['scenario']==scenario]
        assert len(runs)==3
        values[stage]={key:median(item[key] for item in runs) for key in ('performance','accessibility','fcp_ms','lcp_ms','tbt_ms','cls','transfer_bytes','requests')}
        size=values[stage]['transfer_bytes']
        values[stage]['estimated_kwh_per_visit']=size/1e9*.300
        values[stage]['estimated_gCO2e_per_visit']=size/1e9*.300*494
        # Original screenshot bytes, extracted without modifying the image.
        lhr=json.loads((HERE/f'{stage}-{scenario}-1.json').read_text(encoding='utf-8'))
        screenshot=lhr['audits']['final-screenshot']['details']['data']
        (HERE/f'{stage}-{scenario}.jpg').write_bytes(base64.b64decode(screenshot.split(',',1)[1]))
    values['transfer_reduction_percent']=(1-values['after']['transfer_bytes']/values['before']['transfer_bytes'])*100
    values['scenario_annual_kgCO2e_saved']=(values['before']['estimated_gCO2e_per_visit']-values['after']['estimated_gCO2e_per_visit'])*10000/1000
    output['pages'][scenario]=values
(HERE/'comparacion.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(output['pages'],ensure_ascii=False,indent=2))
