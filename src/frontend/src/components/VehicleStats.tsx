import React from 'react';
import type { Vehicle } from '../types/vehicle';

interface VehicleStatsProps {
  vehicles: Vehicle[];
}

export const VehicleStats: React.FC<VehicleStatsProps> = ({ vehicles }) => {
  const total = vehicles.length;
  const disponibles = vehicles.filter(v => v.estado === 'DISPONIBLE').length;
  const enRuta = vehicles.filter(v => v.estado === 'EN_RUTA').length;
  const mantenimiento = vehicles.filter(v => v.estado === 'MANTENIMIENTO').length;
  const totalCapacidad = vehicles.reduce((sum, v) => sum + (v.capacidad_kg || 0), 0);

  return (
    <div className="stats-grid" id="vehicle-stats-container">
      <div className="stat-card" id="stat-total-vehicles">
        <div className="stat-header">
          <span className="stat-label">Total en Flota</span>
          <span className="stat-badge">EP-01</span>
        </div>
        <div className="stat-value">{total}</div>
        <div className="stat-subtext">Unidades vehiculares</div>
      </div>

      <div className="stat-card stat-disponible" id="stat-disponibles">
        <div className="stat-header">
          <span className="stat-label">Disponibles</span>
          <span className="stat-dot dot-green"></span>
        </div>
        <div className="stat-value">{disponibles}</div>
        <div className="stat-subtext">Listas para asignación (US-002)</div>
      </div>

      <div className="stat-card stat-en-ruta" id="stat-en-ruta">
        <div className="stat-header">
          <span className="stat-label">En Ruta</span>
          <span className="stat-dot dot-blue"></span>
        </div>
        <div className="stat-value">{enRuta}</div>
        <div className="stat-subtext">Entregas en progreso</div>
      </div>

      <div className="stat-card stat-mantenimiento" id="stat-mantenimiento">
        <div className="stat-header">
          <span className="stat-label">Mantenimiento</span>
          <span className="stat-dot dot-amber"></span>
        </div>
        <div className="stat-value">{mantenimiento}</div>
        <div className="stat-subtext">Fuera de servicio temporal</div>
      </div>

      <div className="stat-card stat-capacidad" id="stat-capacidad-total">
        <div className="stat-header">
          <span className="stat-label">Capacidad de Carga</span>
          <span className="stat-badge">KG</span>
        </div>
        <div className="stat-value">{totalCapacidad.toLocaleString()} kg</div>
        <div className="stat-subtext">Carga útil combinada</div>
      </div>
    </div>
  );
};
