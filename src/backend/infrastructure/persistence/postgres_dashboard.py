from datetime import time
from domain.value_objects.dashboard import District, OperatingHours, OrderCounts, WindowCompliance
from infrastructure.persistence.database import rows

DISTRICTS = {'150132': 'San Juan de Lurigancho', '150111': 'El Agustino', '150137': 'Santa Anita', '150103': 'Ate'}


class PostgresDistrictCatalog:
    def list_districts(self):
        return [District(key, name) for key, name in DISTRICTS.items()]

    def exists(self, district_id):
        return district_id in DISTRICTS


class PostgresDashboard:
    def _orders(self, day, district_id):
        return rows("SELECT * FROM pedidos WHERE (ventana_inicio AT TIME ZONE 'America/Lima')::date=%s" + (' AND distrito=%s' if district_id else ''), (day,DISTRICTS[district_id]) if district_id else (day,))

    def get_order_counts(self, day, district_id):
        orders = self._orders(day, district_id)
        return OrderCounts(*(sum(row['estado']==status for row in orders) for status in ('ENTREGADO','EN_CAMINO','PENDIENTE','CANCELADO')))

    def get_window_compliance(self, day, district_id):
        delivered = [row for row in self._orders(day, district_id) if row['estado']=='ENTREGADO']
        return WindowCompliance(len(delivered), sum(row['ventana_inicio']<=row['confirmed_at']<=row['ventana_fin'] for row in delivered))

    def route_metrics(self, day, district_id):
        # Distribuye distancia y emisiones por cantidad de paradas del distrito.
        return rows('''SELECT r.distancia_total_km,r.co2_estimado_kg,r.co2_base_kg,
            CASE WHEN %s::text IS NULL THEN 1.0 ELSE
            (SELECT count(*)::float FROM ruta_pedido rp JOIN pedidos p USING(pedido_id) WHERE rp.ruta_id=r.ruta_id AND p.distrito=%s)
            / NULLIF((SELECT count(*) FROM ruta_pedido WHERE ruta_id=r.ruta_id),0) END AS fraction
            FROM rutas r WHERE fecha_operacion=%s''', (DISTRICTS.get(district_id), DISTRICTS.get(district_id),day))

    def get_fleet_distance_km(self, day, district_id):
        return sum(float(row['distancia_total_km'])*(row['fraction'] or 0) for row in self.route_metrics(day,district_id))

    def get_co2_emitted_kg(self, day, district_id):
        return sum(float(row['co2_estimado_kg'])*(row['fraction'] or 0) for row in self.route_metrics(day,district_id))

    def has_routes(self, day, district_id):
        return any((row['fraction'] or 0)>0 for row in self.route_metrics(day,district_id))

    def operating_hours(self):
        return OperatingHours(time(5),time(22))
