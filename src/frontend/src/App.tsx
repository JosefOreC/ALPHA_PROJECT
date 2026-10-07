import { useState, useEffect, useCallback } from 'react';
import type { CreateVehicleInput, UpdateVehicleInput, Vehicle, VehicleStatus } from './types/vehicle';
import { vehicleApi } from './services/vehicleApi';
import { VehicleStats } from './components/VehicleStats';
import { VehicleList } from './components/VehicleList';
import { VehicleFormModal } from './components/VehicleFormModal';
import { Toast } from './components/Toast';

import { createDriverOrders } from './application/driverOrders';
import { DemoOrders } from './infrastructure/demoOrders';
import { HttpOrders } from './infrastructure/httpOrders';
import { DriverOrderView } from './interfaces/DriverOrderView';

import { createManagement } from './application/manageOrders';
import { DemoManagement } from './infrastructure/demoManagement';
import { HttpManagement } from './infrastructure/httpManagement';
import { OrderManagementView } from './interfaces/OrderManagementView';

import { DashboardPage, HttpDashboardGateway } from './features/dashboard';
import type { ModuleId } from './shared/ui';

import './App.css';

// Raíz de composición: se instancian los gateways / adaptadores
const dashboardGateway = new HttpDashboardGateway();

const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
const demo = apiUrl === undefined;
const driverService = createDriverOrders(demo ? new DemoOrders() : new HttpOrders(apiUrl));
const managementService = createManagement(
  demo
    ? new DemoManagement()
    : new HttpManagement(
        apiUrl,
        () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? null
      )
);

type ActiveView = 'dashboard' | 'flota' | 'pedidos' | 'conductor';

function getViewFromUrl(): { view: ActiveView; orderId: string } {
  if (typeof window === 'undefined') {
    return { view: 'dashboard', orderId: 'PED-0024' };
  }
  const params = new URLSearchParams(window.location.search);
  const vista = params.get('vista');
  const pedido = params.get('pedido');

  if (vista === 'flota') {
    return { view: 'flota', orderId: pedido || 'PED-0024' };
  }
  if (vista === 'pedidos') {
    return { view: 'pedidos', orderId: pedido || 'PED-0024' };
  }
  if (vista === 'conductor' || pedido) {
    return { view: 'conductor', orderId: pedido || 'PED-0024' };
  }
  return { view: 'dashboard', orderId: 'PED-0024' };
}

export function App() {
  const initial = getViewFromUrl();
  const [activeView, setActiveView] = useState<ActiveView>(initial.view);
  const [currentOrderId, setCurrentOrderId] = useState<string>(initial.orderId);

  // Estados del módulo de Gestión de Flota (Vehículos - US-001 & US-002)
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isLocalMode, setIsLocalMode] = useState<boolean>(false);

  // Estados de Modal para Vehículos
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  // Sincronización con el historial del navegador (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const parsed = getViewFromUrl();
      setActiveView(parsed.view);
      setCurrentOrderId(parsed.orderId);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (view: ActiveView, orderId?: string) => {
    setActiveView(view);
    const params = new URLSearchParams(window.location.search);
    if (view === 'dashboard') {
      params.delete('vista');
      params.delete('pedido');
    } else if (view === 'flota') {
      params.set('vista', 'flota');
      params.delete('pedido');
    } else if (view === 'pedidos') {
      params.set('vista', 'pedidos');
      params.delete('pedido');
    } else if (view === 'conductor') {
      params.set('vista', 'conductor');
      if (orderId) {
        params.set('pedido', orderId);
        setCurrentOrderId(orderId);
      }
    }
    const queryString = params.toString();
    const targetUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;
    window.history.pushState({}, '', targetUrl);
  };

  // La barra superior de cada vista migrada al design system navega por módulo; lo que aún no existe recarga por URL.
  const navigateModule = (id: ModuleId, href: string) => {
    if (id === 'dashboard' || id === 'flota' || id === 'pedidos') navigateTo(id);
    else window.location.assign(href);
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

    if (activeView === 'flota') {
      void fetchFleet();
    }

    return () => {
      isCancelled = true;
    };
  }, [activeFilter, activeView]);

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
      // Mensaje de validación de US-001
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
    <>
      {/* Barra de navegación superior heredada; las vistas migradas al design system traen su AppShell */}
      {activeView !== 'pedidos' && (
      <nav className="app-nav" aria-label="Navegación principal del sistema">
        <a
          href="/"
          className="app-nav-brand"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('dashboard');
          }}
        >
          <div className="brand-logo-icon">🚛</div>
          <div>ALPHA_PROJECT <span>· EcoLogística</span></div>
        </a>

        <div className="app-nav-tabs">
          <button
            type="button"
            className={`nav-tab ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => navigateTo('dashboard')}
            id="tab-nav-dashboard"
          >
            📊 Dashboard del Día
          </button>

          <button
            type="button"
            className={`nav-tab ${activeView === 'flota' ? 'active' : ''}`}
            onClick={() => navigateTo('flota')}
            id="tab-nav-flota"
          >
            🚛 Flota Vehicular
          </button>

          <button
            type="button"
            className="nav-tab"
            onClick={() => navigateTo('pedidos')}
            id="tab-nav-pedidos"
          >
            📦 Gestión de Pedidos
          </button>

          <button
            type="button"
            className={`nav-tab ${activeView === 'conductor' ? 'active' : ''}`}
            onClick={() => navigateTo('conductor')}
            id="tab-nav-conductor"
          >
            🛵 Vista Conductor
          </button>
        </div>
      </nav>
      )}

      {/* Vista 0: Dashboard del Día */}
      {activeView === 'dashboard' && (
        <DashboardPage gateway={dashboardGateway} />
      )}

      {/* Vista 1: Flota Vehicular (US-001 & US-002) */}
      {activeView === 'flota' && (
        <div className="app-container" id="fleet-app">
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

          <VehicleStats vehicles={vehicles} />

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

          <VehicleFormModal
            key={editingVehicle ? `edit-${editingVehicle.vehiculo_id}` : 'create-new'}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmitVehicle}
            initialVehicle={editingVehicle}
            serverError={modalError}
            isSubmitting={isSubmitting}
          />

          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </div>
      )}

      {/* Vista 2: Gestión de Pedidos */}
      {activeView === 'pedidos' && (
        <OrderManagementView service={managementService} demo={demo} onNavigate={navigateModule} />
      )}

      {/* Vista 3: Portal Conductor */}
      {activeView === 'conductor' && (
        <div className="driver-order-view-wrapper">
          <a
            className="management-switch"
            href="/?vista=pedidos"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('pedidos');
            }}
          >
            Ir a gestión de pedidos
          </a>
          <DriverOrderView
            key={currentOrderId}
            service={driverService}
            orderId={currentOrderId}
            demo={demo}
          />
        </div>
      )}
    </>
  );
}

export default App;
