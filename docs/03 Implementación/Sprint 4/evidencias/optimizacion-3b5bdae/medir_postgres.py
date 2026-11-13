"""Read-only comparison except a rolled-back index drop, on this isolated fixture only."""
from pathlib import Path
from datetime import date, datetime, timezone
import json
import psycopg
from psycopg.rows import dict_row
from infrastructure.persistence import postgres_dashboard as dashboard

DSN='postgresql://green_fixture@127.0.0.1:55439/green_it_test'
OUTPUT=Path(__file__).resolve().parent
day=date(2026,11,12)
where=" FROM pedidos WHERE estado='PENDIENTE' AND conductor_id IS NULL AND latitud IS NOT NULL AND longitud IS NOT NULL AND (ventana_inicio AT TIME ZONE 'America/Lima')::date=%s ORDER BY ventana_inicio,pedido_id LIMIT 151"
record={'captured_utc':datetime.now(timezone.utc).isoformat(),'database':'green_it_test, isolated local PostgreSQL/PostGIS; synthetic data'}
with psycopg.connect(DSN) as conn:
    record['server']=conn.execute('SELECT version()').fetchone()[0]
    record['orders']=conn.execute('SELECT count(*) FROM pedidos').fetchone()[0]
    conn.execute('ANALYZE pedidos'); conn.commit()
    # Restore automatically before leaving this transaction; never drop user indexes.
    conn.execute('DROP INDEX IF EXISTS idx_pedidos_dia_estado_ventana')
    before='SELECT *'+where
    record['before']={'query':before,'plan':conn.execute('EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) '+before,(day,)).fetchone()[0]}
    conn.rollback()
    after='SELECT pedido_id,cliente_nombre,distrito,estado,latitud,longitud,ventana_inicio,ventana_fin,peso_kg,version'+where
    record['after']={'query':after,'plan':conn.execute('EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) '+after,(day,)).fetchone()[0]}
    record['day_index_exists']=bool(conn.execute("SELECT 1 FROM pg_indexes WHERE indexname='idx_pedidos_dia_estado_ventana'").fetchone())

with psycopg.connect(DSN,row_factory=dict_row) as conn:
    calls=[]
    def query(statement,params=()):
        calls.append(str(statement))
        return conn.execute(statement,params).fetchall()
    original=dashboard.rows; dashboard.rows=query
    try:
        counts={}
        for enabled in (False,True):
            calls.clear(); metrics=dashboard.PostgresDashboard(cache=enabled)
            metrics.get_order_counts(day,None); metrics.get_window_compliance(day,None)
            metrics.has_routes(day,None); metrics.get_fleet_distance_km(day,None); metrics.get_co2_emitted_kg(day,None)
            counts[str(enabled)]=len(calls)
        record['queries_per_summary_without_and_with_request_cache']=counts
    finally:
        dashboard.rows=original
(OUTPUT/'postgres-planes.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'orders':record['orders'],'day_index_exists':record['day_index_exists'],'summary_queries':counts}))
