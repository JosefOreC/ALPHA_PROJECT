import { useState, useEffect, useCallback } from 'react';
import type { CreateVehicleInput, UpdateVehicleInput, Vehicle, VehicleStatus } from './types/vehicle';
import { vehicleApi } from './services/vehicleApi';
import { VehicleStats } from './components/VehicleStats';
import { VehicleList } from './components/VehicleList';
import { VehicleFormModal } from './components/VehicleFormModal';
import { Toast } from './components/Toast';

export function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isLocalMode, setIsLocalMode] = useState<boolean>(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const loadVehicles = useCallback(async (filter: string = activeFilter) => {
    setIsLoading(true);
    try {
      const statusParam = filter === 'ALL' ? undefined : filter;
      const onlyAvailable = filter === 'DISPONIBLE';

      const result = await vehicleApi.getVehicles(statusParam, onlyAvailable);
      setVehicles(result.data.vehiculos);
      setServerMessage(result.data.mensaje || null);
      setIsLocalMode(result.isLocal);
    } catch {
      showToast('Error al conectar con el servidor', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    let isCancelled = false;

    const fetchFleet = async () => {
      setIsLoading(true);
      try {
        const statusParam = activeFilter === 'ALL' ? undefined : activeFilter;
        const onlyAvailable = activeFilter === 'DISPONIBLE';
        const result = await vehicleApi.getVehicles(statusParam, onlyAvailable);
        if (!isCancelled) {
          setVehicles(result.data.vehiculos);
          setServerMessage(result.data.mensaje || null);
          setIsLocalMode(result.isLocal);
        }
      } catch {
        if (!isCancelled) {
          setToast({ message: 'Error al conectar con el servidor', type: 'error' });
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchFleet();

    return () => {
      isCancelled = true;
    };
  }, [activeFilter]);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleOpenCreateModal = () => {
    setEditingVehicle(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setEditingVehicle(null);
      setModalError(null);
    }
  };

  const handleSubmitVehicle = async (payload: CreateVehicleInput | UpdateVehicleInput) => {
    setIsSubmitting(true);
    setModalError(null);

    try {
      if (editingVehicle) {
        // Edición de vehículo existente
        const result = await vehicleApi.updateVehicle(editingVehicle.vehiculo_id, payload);
        setIsLocalMode(result.isLocal);
        showToast(`Vehículo ${result.data.placa} actualizado exitosamente`, 'success');
      } else {
        // Creación de nuevo vehículo (US-001)
        const result = await vehicleApi.createVehicle(payload as CreateVehicleInput);
        setIsLocalMode(result.isLocal);
        showToast(`Vehículo ${result.data.placa} registrado en la flota activa`, 'success');
      }
      setIsModalOpen(false);
      setEditingVehicle(null);
      await loadVehicles();
    } catch (err: any) {
      // Captura y despliega el mensaje exacto exigido en US-001:
      // "La placa ingresada ya se encuentra registrada en el sistema"
      setModalError(err.message || 'Error al procesar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (vehicle: Vehicle, newStatus: VehicleStatus) => {
    try {
      const result = await vehicleApi.updateVehicle(vehicle.vehiculo_id, { estado: newStatus });
      showToast(`Estado de ${vehicle.placa} actualizado a ${newStatus}`, 'info');
      setIsLocalMode(result.isLocal);
      await loadVehicles();
    } catch (err: any) {
      showToast(err.message || 'Error al cambiar estado', 'error');
    }
  };

  return (
    <div className="app-container" id="fleet-app">
      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-icon">🚛</div>
          <div className="brand-titles">
            <h1>ALPHA_PROJECT · Gestión de Flota</h1>
            <div className="brand-meta">
              <span className="tag-epic">EP-01</span>
              <span>US-001 (Registro & Edición) & US-002 (Listado y Disponibilidad)</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <div
            className={`api-status-badge ${isLocalMode ? 'api-local' : 'api-online'}`}
            title={isLocalMode ? 'Operando en modo local (inicie uvicorn para API en vivo)' : 'Conectado a FastAPI Backend'}
          >
            <span className="status-indicator-dot"></span>
            <span>{isLocalMode ? 'Modo Local / Mock' : 'API Backend Online'}</span>
          </div>

          <button
            type="button"
            className="btn-refresh"
            onClick={() => loadVehicles()}
            title="Recargar flota"
            id="btn-refresh-vehicles"
          >
            ↻
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={handleOpenCreateModal}
            id="btn-open-create-vehicle"
          >
            <span>+</span> Registrar Vehículo
          </button>
        </div>
      </header>

      {/* KPI Stats */}
      <VehicleStats vehicles={vehicles} />

      {/* Main List Section */}
      <main>
        <VehicleList
          vehicles={vehicles}
          isLoading={isLoading}
          onEdit={handleOpenEditModal}
          onQuickStatusChange={handleQuickStatusChange}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          serverMessage={serverMessage}
        />
      </main>

      {/* Form Modal for US-001 (Creation) & Edition */}
      <VehicleFormModal
        key={editingVehicle ? `edit-${editingVehicle.vehiculo_id}` : 'create-new'}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitVehicle}
        initialVehicle={editingVehicle}
        serverError={modalError}
        isSubmitting={isSubmitting}
      />

      {/* Toast Feedback */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
