from common import *
import pathlib
p=OUT/'EN-05-borde.txt'; lines=p.read_text(encoding='utf-8').rstrip('\n').split('\n')
c=client(); login(c,'conductor04')
pid=psql("select pedido_id from pedidos p join conductores c using(conductor_id) join usuarios u using(usuario_id) where u.email='conductor04@example.invalid' and p.cliente_nombre='Cliente ficticio 094' and p.ventana_inicio::date='2026-11-11'")
before=psql(f"select to_char(confirmed_at at time zone 'America/Lima','HH24:MI:SS.MS')||' v'||version from pedidos where pedido_id='{pid}'")
r=c.post(f'/api/conductor/pedidos/{pid}/confirmacion')
after=psql(f"select to_char(confirmed_at at time zone 'America/Lima','HH24:MI:SS.MS')||' v'||version from pedidos where pedido_id='{pid}'")
lines+=['',f'Repetición directa del POST de confirmación (misma sesión del conductor, {stamp()}): {r.status_code}, estado {r.json().get("status") or r.json().get("estado")}',f'  confirmed_at y versión antes {before} | después {after} | sin cambios: {before==after}',
'Comportamiento: domain/entities/order.py devuelve el pedido sin cambios si ya está entregado (idempotencia). D-04 (rechazar la repetición o aceptarla de forma idempotente) sigue sin decisión formal.',
'Nota: la confirmación actualiza pedidos.estado, confirmed_at y version; no inserta filas en la tabla entregas.']
p.write_text('\n'.join(lines)+'\n',encoding='utf-8'); print('\n'.join(lines[-5:]))
