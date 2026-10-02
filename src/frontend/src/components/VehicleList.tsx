import React, { useState } from 'react';
import type { Vehicle, VehicleStatus } from '../types/vehicle';

interface VehicleListProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  onEdit: (vehicle: Vehicle) => void;
  onQuickStatusChange: (vehicle: Vehicle, newStatus: VehicleStatus) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  serverMessage?: string | null;
}

export const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  isLoading,
  onEdit,
  onQuickStatusChange,
  activeFilter,
  onFilterChange,
  serverMessage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrado local en base al término de búsqueda
  const filteredVehicles = vehicles.filter((v) => {
    const matchSearch =
      v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.tipo_combustible.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.estado.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const activeVehiclesCount = vehicles.filter((v) => v.estado !== 'INACTIVO').length;
  const showNoActiveVehiclesMessage = activeVehiclesCount === 0 || serverMessage === 'No hay vehículos activos registrados';

  const getStatusBadge = (estado: VehicleStatus) => {
    switch (estado) {
      case 'DISPONIBLE':
        return <span className="status-badge badge-disponible">● Disponible</span>;
      case 'EN_RUTA':
        return <span className="status-badge badge-en-ruta">● En Ruta</span>;
      case 'MANTENIMIENTO':
        return <span className="status-badge badge-mantenimiento">● Mantenimiento</span>;
      case 'INACTIVO':
        return <span className="status-badge badge-inactivo">● Inactivo</span>;
      default:
        return <span className="status-badge badge-default">{estado}</span>;
    }
  };

  const getFuelBadge = (combustible: string) => {
    const isGreen = combustible === 'ELECTRICO' || combustible === 'GNV' || combustible === 'HIBRIDO';
    return (
      <span className={`fuel-badge ${isGreen ? 'fuel-green' : 'fuel-standard'}`}>
        {combustible}
      </span>
    );
  };

  return (
    <div className="card vehicle-list-card" id="vehicle-list-card">
      <div className="list-toolbar">
        <div className="filter-chips" role="tablist" aria-label="Filtros de estado">
          <button
            type="button"
            id="filter-all"
            className={`filter-chip ${activeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => onFilterChange('ALL')}
          >
            Todos ({vehicles.length})
          </button>
          <button
            type="button"
            id="filter-disponible"
            className={`filter-chip ${activeFilter === 'DISPONIBLE' ? 'active' : ''}`}
            onClick={() => onFilterChange('DISPONIBLE')}
          >
            Disponibles ({vehicles.filter(v => v.estado === 'DISPONIBLE').length})
          </button>
          <button
            type="button"
            id="filter-en-ruta"
            className={`filter-chip ${activeFilter === 'EN_RUTA' ? 'active' : ''}`}
            onClick={() => onFilterChange('EN_RUTA')}
          >
            En Ruta ({vehicles.filter(v => v.estado === 'EN_RUTA').length})
          </button>
          <button
            type="button"
            id="filter-mantenimiento"
            className={`filter-chip ${activeFilter === 'MANTENIMIENTO' ? 'active' : ''}`}
            onClick={() => onFilterChange('MANTENIMIENTO')}
          >
            Mantenimiento ({vehicles.filter(v => v.estado === 'MANTENIMIENTO').length})
          </button>
          <button
            type="button"
            id="filter-inactivo"
            className={`filter-chip ${activeFilter === 'INACTIVO' ? 'active' : ''}`}
            onClick={() => onFilterChange('INACTIVO')}
          >
            Inactivos ({vehicles.filter(v => v.estado === 'INACTIVO').length})
          </button>
        </div>

        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            id="search-vehicles-input"
            type="text"
            className="search-input"
            placeholder="Buscar por placa, combustible o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state" id="vehicles-loading">
          <div className="spinner"></div>
          <p>Cargando flota de vehículos...</p>
        </div>
      ) : showNoActiveVehiclesMessage ? (
        <div className="empty-state" id="empty-state-no-active">
          <div className="empty-icon">🚛</div>
          <h3 className="empty-title">No hay vehículos activos registrados</h3>
          <p className="empty-description">
            Actualmente no existen unidades vehiculares operativas en la flota activa.
          </p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="empty-state" id="empty-state-no-results">
          <div className="empty-icon">🔎</div>
          <h3 className="empty-title">No se encontraron vehículos</h3>
          <p className="empty-description">
            Ningún vehículo coincide con el filtro o término de búsqueda aplicado.
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="vehicle-table" id="vehicles-table">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Capacidad (kg)</th>
                <th>Volumen (m³)</th>
                <th>Combustible</th>
                <th>Estado Operativo</th>
                <th>Disponibilidad</th>
                <th className="th-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.vehiculo_id} id={`vehicle-row-${vehicle.placa}`} className="table-row">
                  <td>
                    <div className="plate-badge" title="Placa de matrícula">
                      <span className="plate-country">PE</span>
                      <span className="plate-number">{vehicle.placa}</span>
                    </div>
                  </td>
                  <td>
                    <div className="capacity-cell">
                      <span className="capacity-number">{vehicle.capacidad_kg.toLocaleString()}</span>
                      <span className="capacity-unit">kg</span>
                    </div>
                  </td>
                  <td>
                    <span className="volume-text">
                      {vehicle.capacidad_m3 ? `${vehicle.capacidad_m3} m³` : '—'}
                    </span>
                  </td>
                  <td>{getFuelBadge(vehicle.tipo_combustible)}</td>
                  <td>{getStatusBadge(vehicle.estado)}</td>
                  <td>
                    {vehicle.disponible ? (
                      <span className="disponibilidad-tag disp-yes">
                        ✓ Asignable a Ruta
                      </span>
                    ) : (
                      <span className="disponibilidad-tag disp-no">
                        ✕ No Asignable
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        id={`btn-edit-${vehicle.placa}`}
                        className="btn-action-edit"
                        onClick={() => onEdit(vehicle)}
                        title="Editar vehículo"
                      >
                        ✏ Editar
                      </button>
                      
                      <div className="quick-status-dropdown">
                        <select
                          id={`select-status-${vehicle.placa}`}
                          className="status-quick-select"
                          value={vehicle.estado}
                          onChange={(e) => onQuickStatusChange(vehicle, e.target.value as VehicleStatus)}
                          title="Cambio rápido de estado"
                        >
                          <option value="DISPONIBLE">Disponible</option>
                          <option value="EN_RUTA">En Ruta</option>
                          <option value="MANTENIMIENTO">Mantenimiento</option>
                          <option value="INACTIVO">Inactivo</option>
                        </select>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
