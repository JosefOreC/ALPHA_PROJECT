// Contenedor del mapa de rutas. El componente real (Leaflet + OpenStreetMap) llega con US-006.
export function MapPlaceholder() {
  return (
    <div className="eco-map" role="img" aria-label="Mapa de rutas de Lima Este">
      <span className="eco-map__note">Mapa de rutas disponible próximamente</span>
    </div>
  )
}
