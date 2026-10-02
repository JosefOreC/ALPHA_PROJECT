import './App.css';
import { useState, useEffect, useCallback } from 'react';

import type {
  CreateVehicleInput,
  UpdateVehicleInput,
  Vehicle,
  VehicleStatus,
} from './types/vehicle';

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

const dashboardGateway = new HttpDashboardGateway();

const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
const demo = apiUrl === undefined;

const driverService = createDriverOrders(
  demo ? new DemoOrders() : new HttpOrders(apiUrl),
);

const managementService = createManagement(
  demo
    ? new DemoManagement()
    : new HttpManagement(
        apiUrl,
        () =>
          document.querySelector<HTMLMetaElement>(
            'meta[name="csrf-token"]',
          )?.content ?? null,
      ),
);

// ============================================================
// Gestión de Conductores - RF-007
// ============================================================

interface Driver {
  conductor_id: string;
  nombre_completo: string;
  dni: string;
  licencia: string;
  vehiculo_id: string;
  estado: 'ACTIVO' | 'INACTIVO';
  creado_en: string;
}

interface DriverListResponse {
  items: Driver[];
  total: number;
}

interface DriverForm {
  nombre_completo: string;
  dni: string;
  licencia: string;
  vehiculo_id: string;
}

const emptyDriverForm: DriverForm = {
  nombre_completo: '',
  dni: '',
  licencia: '',
  vehiculo_id: '',
};

const DRIVER_API_URL = 'http://127.0.0.1:8000/api/v1';

type ActiveView =
  | 'dashboard'
  | 'flota'
  | 'pedidos'
  | 'conductor'
  | 'conductores';

function getViewFromUrl(): {
  view: ActiveView;
  orderId: string;
} {
  if (typeof window === 'undefined') {
    return {
      view: 'dashboard',
      orderId: 'PED-0024',
    };
  }

  const params = new URLSearchParams(window.location.search);
  const vista = params.get('vista');
  const pedido = params.get('pedido');

  if (vista === 'flota') {
    return {
      view: 'flota',
      orderId: pedido || 'PED-0024',
    };
  }

  if (vista === 'pedidos') {
    return {
      view: 'pedidos',
      orderId: pedido || 'PED-0024',
    };
  }

  if (vista === 'conductores') {
    return {
      view: 'conductores',
      orderId: pedido || 'PED-0024',
    };
  }

  if (vista === 'conductor' || pedido) {
    return {
      view: 'conductor',
      orderId: pedido || 'PED-0024',
    };
  }

  return {
    view: 'dashboard',
    orderId: 'PED-0024',
  };
}

export function App() {
  const initial = getViewFromUrl();

  const [activeView, setActiveView] = useState<ActiveView>(
    initial.view,
  );

  const [currentOrderId, setCurrentOrderId] = useState<string>(
    initial.orderId,
  );

  // ==========================================================
  // Gestión de Flota
  // ==========================================================

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [serverMessage, setServerMessage] = useState<string | null>(
    null,
  );
  const [isLocalMode, setIsLocalMode] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingVehicle, setEditingVehicle] =
    useState<Vehicle | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] =
    useState<boolean>(false);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
  ) => {
    setToast({
      message,
      type,
    });
  };

  // ==========================================================
  // Gestión de Conductores - RF-007
  // ==========================================================

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driverLoading, setDriverLoading] =
    useState<boolean>(true);
  const [driverError, setDriverError] = useState<string>('');
  const [driverSuccess, setDriverSuccess] =
    useState<string>('');

  const [showDriverForm, setShowDriverForm] =
    useState<boolean>(false);
  const [editingDriverId, setEditingDriverId] =
    useState<string | null>(null);
  const [driverForm, setDriverForm] =
    useState<DriverForm>(emptyDriverForm);
  const [driverSaving, setDriverSaving] =
    useState<boolean>(false);

  // ==========================================================
  // Navegación
  // ==========================================================

  useEffect(() => {
    const handlePopState = () => {
      const parsed = getViewFromUrl();

      setActiveView(parsed.view);
      setCurrentOrderId(parsed.orderId);
    };

    window.addEventListener('popstate', handlePopState);

    return () =>
      window.removeEventListener(
        'popstate',
        handlePopState,
      );
  }, []);

  const navigateTo = (
    view: ActiveView,
    orderId?: string,
  ) => {
    setActiveView(view);

    const params = new URLSearchParams(
      window.location.search,
    );

    if (view === 'dashboard') {
      params.delete('vista');
      params.delete('pedido');
    } else if (view === 'flota') {
      params.set('vista', 'flota');
      params.delete('pedido');
    } else if (view === 'pedidos') {
      params.set('vista', 'pedidos');
      params.delete('pedido');
    } else if (view === 'conductores') {
      params.set('vista', 'conductores');
      params.delete('pedido');
    } else if (view === 'conductor') {
      params.set('vista', 'conductor');

      if (orderId) {
        params.set('pedido', orderId);
        setCurrentOrderId(orderId);
      }
    }

    const queryString = params.toString();

    const targetUrl = `${
      window.location.pathname
    }${queryString ? `?${queryString}` : ''}`;

    window.history.pushState({}, '', targetUrl);
  };

  // ==========================================================
  // Vehículos
  // ==========================================================

  const loadVehicles = useCallback(
    async (filter: string = activeFilter) => {
      setIsLoading(true);

      try {
        const statusParam =
          filter === 'ALL' ? undefined : filter;

        const onlyAvailable =
          filter === 'DISPONIBLE';

        const result =
          await vehicleApi.getVehicles(
            statusParam,
            onlyAvailable,
          );

        setVehicles(result.data.vehiculos);
        setServerMessage(
          result.data.mensaje || null,
        );
        setIsLocalMode(result.isLocal);
      } catch {
        showToast(
          'Error al conectar con el servidor',
          'error',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeFilter],
  );

  useEffect(() => {
    let isCancelled = false;

    const fetchFleet = async () => {
      setIsLoading(true);

      try {
        const statusParam =
          activeFilter === 'ALL'
            ? undefined
            : activeFilter;

        const onlyAvailable =
          activeFilter === 'DISPONIBLE';

        const result =
          await vehicleApi.getVehicles(
            statusParam,
            onlyAvailable,
          );

        if (!isCancelled) {
          setVehicles(
            result.data.vehiculos,
          );

          setServerMessage(
            result.data.mensaje || null,
          );

          setIsLocalMode(result.isLocal);
        }
      } catch {
        if (!isCancelled) {
          setToast({
            message:
              'Error al conectar con el servidor',
            type: 'error',
          });
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

  const handleFilterChange = (
    filter: string,
  ) => {
    setActiveFilter(filter);
  };

  const handleOpenCreateModal = () => {
    setEditingVehicle(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (
    vehicle: Vehicle,
  ) => {
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

  const handleSubmitVehicle = async (
    payload:
      | CreateVehicleInput
      | UpdateVehicleInput,
  ) => {
    setIsSubmitting(true);
    setModalError(null);

    try {
      if (editingVehicle) {
        const result =
          await vehicleApi.updateVehicle(
            editingVehicle.vehiculo_id,
            payload,
          );

        setIsLocalMode(result.isLocal);

        showToast(
          `Vehículo ${result.data.placa} actualizado exitosamente`,
          'success',
        );
      } else {
        const result =
          await vehicleApi.createVehicle(
            payload as CreateVehicleInput,
          );

        setIsLocalMode(result.isLocal);

        showToast(
          `Vehículo ${result.data.placa} registrado en la flota activa`,
          'success',
        );
      }

      setIsModalOpen(false);
      setEditingVehicle(null);

      await loadVehicles();
    } catch (err: any) {
      setModalError(
        err.message ||
          'Error al procesar la solicitud',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (
    vehicle: Vehicle,
    newStatus: VehicleStatus,
  ) => {
    try {
      const result =
        await vehicleApi.updateVehicle(
          vehicle.vehiculo_id,
          {
            estado: newStatus,
          },
        );

      showToast(
        `Estado de ${vehicle.placa} actualizado a ${newStatus}`,
        'info',
      );

      setIsLocalMode(result.isLocal);

      await loadVehicles();
    } catch (err: any) {
      showToast(
        err.message ||
          'Error al cambiar estado',
        'error',
      );
    }
  };

  // ==========================================================
  // Conductores
  // ==========================================================

  const loadDrivers = async () => {
    try {
      setDriverLoading(true);
      setDriverError('');

      const response = await fetch(
        `${DRIVER_API_URL}/drivers`,
      );

      if (!response.ok) {
        throw new Error(
          'No se pudieron obtener los conductores',
        );
      }

      const data: DriverListResponse =
        await response.json();

      setDrivers(data.items);
    } catch (err) {
      setDriverError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al cargar los conductores',
      );
    } finally {
      setDriverLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === 'conductores') {
      void loadDrivers();
    }
  }, [activeView]);

  const openCreateDriverForm = () => {
    setEditingDriverId(null);
    setDriverForm(emptyDriverForm);
    setDriverError('');
    setDriverSuccess('');
    setShowDriverForm(true);
  };

  const openEditDriverForm = (
    driver: Driver,
  ) => {
    setEditingDriverId(
      driver.conductor_id,
    );

    setDriverForm({
      nombre_completo:
        driver.nombre_completo,
      dni: driver.dni,
      licencia: driver.licencia,
      vehiculo_id:
        driver.vehiculo_id,
    });

    setDriverError('');
    setDriverSuccess('');
    setShowDriverForm(true);
  };

  const closeDriverForm = () => {
    if (driverSaving) {
      return;
    }

    setShowDriverForm(false);
    setEditingDriverId(null);
    setDriverForm(emptyDriverForm);
    setDriverError('');
  };

  const handleDriverInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setDriverForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleDriverSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      setDriverSaving(true);
      setDriverError('');
      setDriverSuccess('');

      const url = editingDriverId
        ? `${DRIVER_API_URL}/drivers/${editingDriverId}`
        : `${DRIVER_API_URL}/drivers`;

      const method = editingDriverId
        ? 'PUT'
        : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(
          driverForm,
        ),
      });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            'No se pudo guardar el conductor',
        );
      }

      const successMessage =
        editingDriverId
          ? 'Conductor actualizado correctamente'
          : 'Conductor registrado correctamente';

      setShowDriverForm(false);
      setEditingDriverId(null);
      setDriverForm(emptyDriverForm);

      await loadDrivers();

      setDriverSuccess(
        successMessage,
      );
    } catch (err) {
      setDriverError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al guardar el conductor',
      );
    } finally {
      setDriverSaving(false);
    }
  };

  const changeDriverStatus = async (
    driver: Driver,
    action:
      | 'activate'
      | 'deactivate',
  ) => {
    try {
      setDriverError('');
      setDriverSuccess('');

      const response = await fetch(
        `${DRIVER_API_URL}/drivers/${driver.conductor_id}/${action}`,
        {
          method: 'PATCH',
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            'No se pudo actualizar el estado',
        );
      }

      setDriverSuccess(
        action === 'activate'
          ? 'Conductor activado correctamente'
          : 'Conductor desactivado correctamente',
      );

      await loadDrivers();
    } catch (err) {
      setDriverError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al actualizar el estado',
      );
    }
  };

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <>
      <nav
        className="app-nav"
        aria-label="Navegación principal del sistema"
      >
        <a
          href="/"
          className="app-nav-brand"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('dashboard');
          }}
        >
          <div className="brand-logo-icon">
            🚛
          </div>

          <div>
            ALPHA_PROJECT{' '}
            <span>· EcoLogística</span>
          </div>
        </a>

        <div className="app-nav-tabs">
          <button
            type="button"
            className={`nav-tab ${
              activeView === 'dashboard'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              navigateTo('dashboard')
            }
            id="tab-nav-dashboard"
          >
            📊 Dashboard del Día
          </button>

          <button
            type="button"
            className={`nav-tab ${
              activeView === 'flota'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              navigateTo('flota')
            }
            id="tab-nav-flota"
          >
            🚛 Flota Vehicular
          </button>

          <button
            type="button"
            className={`nav-tab ${
              activeView === 'pedidos'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              navigateTo('pedidos')
            }
            id="tab-nav-pedidos"
          >
            📦 Gestión de Pedidos
          </button>

          <button
            type="button"
            className={`nav-tab ${
              activeView === 'conductores'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              navigateTo('conductores')
            }
            id="tab-nav-conductores"
          >
            👤 Gestión de Conductores
          </button>

          <button
            type="button"
            className={`nav-tab ${
              activeView === 'conductor'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              navigateTo('conductor')
            }
            id="tab-nav-conductor"
          >
            🛵 Vista Conductor
          </button>
        </div>
      </nav>

      {/* =====================================================
          Dashboard
      ===================================================== */}

      {activeView === 'dashboard' && (
        <DashboardPage
          gateway={dashboardGateway}
        />
      )}

      {/* =====================================================
          Flota Vehicular
      ===================================================== */}

      {activeView === 'flota' && (
        <div
          className="app-container"
          id="fleet-app"
        >
          <header className="app-header">
            <div className="brand-section">
              <div className="brand-icon">
                🚛
              </div>

              <div className="brand-titles">
                <h1>
                  ALPHA_PROJECT · Gestión de Flota
                </h1>

                <div className="brand-meta">
                  <span className="tag-epic">
                    EP-01
                  </span>

                  <span>
                    US-001 (Registro & Edición)
                    {' & '}
                    US-002 (Listado y
                    Disponibilidad)
                  </span>
                </div>
              </div>
            </div>

            <div className="header-actions">
              <div
                className={`api-status-badge ${
                  isLocalMode
                    ? 'api-local'
                    : 'api-online'
                }`}
                title={
                  isLocalMode
                    ? 'Operando en modo local (inicie uvicorn para API en vivo)'
                    : 'Conectado a FastAPI Backend'
                }
              >
                <span className="status-indicator-dot"></span>

                <span>
                  {isLocalMode
                    ? 'Modo Local / Mock'
                    : 'API Backend Online'}
                </span>
              </div>

              <button
                type="button"
                className="btn-refresh"
                onClick={() =>
                  loadVehicles()
                }
                title="Recargar flota"
                id="btn-refresh-vehicles"
              >
                ↻
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={
                  handleOpenCreateModal
                }
                id="btn-open-create-vehicle"
              >
                <span>+</span>{' '}
                Registrar Vehículo
              </button>
            </div>
          </header>

          <VehicleStats
            vehicles={vehicles}
          />

          <main>
            <VehicleList
              vehicles={vehicles}
              isLoading={isLoading}
              onEdit={
                handleOpenEditModal
              }
              onQuickStatusChange={
                handleQuickStatusChange
              }
              activeFilter={
                activeFilter
              }
              onFilterChange={
                handleFilterChange
              }
              serverMessage={
                serverMessage
              }
            />
          </main>

          <VehicleFormModal
            key={
              editingVehicle
                ? `edit-${editingVehicle.vehiculo_id}`
                : 'create-new'
            }
            isOpen={isModalOpen}
            onClose={
              handleCloseModal
            }
            onSubmit={
              handleSubmitVehicle
            }
            initialVehicle={
              editingVehicle
            }
            serverError={
              modalError
            }
            isSubmitting={
              isSubmitting
            }
          />

          {toast && (
            <Toast
              message={
                toast.message
              }
              type={toast.type}
              onClose={() =>
                setToast(null)
              }
            />
          )}
        </div>
      )}

      {/* =====================================================
          Gestión de Conductores
      ===================================================== */}

      {activeView === 'conductores' && (
        <div className="driver-management">
          <header className="driver-page-header">
            <div>
              <p className="driver-eyebrow">
                ALPHA PROJECT
              </p>

              <h1>
                Gestión de Conductores
              </h1>

              <p className="driver-subtitle">
                Administra los conductores
                disponibles para la operación
                de rutas.
              </p>
            </div>

            <button
              className="driver-primary-button"
              onClick={
                openCreateDriverForm
              }
            >
              + Nuevo conductor
            </button>
          </header>

          {driverSuccess && (
            <div className="driver-alert driver-success-alert">
              {driverSuccess}
            </div>
          )}

          {driverError &&
            !showDriverForm && (
              <div className="driver-alert driver-error-alert">
                {driverError}
              </div>
            )}

          <section className="driver-content-card">
            <div className="driver-card-header">
              <div>
                <h2>
                  Conductores registrados
                </h2>

                <p>
                  {drivers.length}{' '}
                  conductor
                  {drivers.length !== 1
                    ? 'es'
                    : ''}{' '}
                  registrado
                  {drivers.length !== 1
                    ? 's'
                    : ''}
                </p>
              </div>

              <button
                className="driver-secondary-button"
                onClick={
                  loadDrivers
                }
                disabled={
                  driverLoading
                }
              >
                {driverLoading
                  ? 'Actualizando...'
                  : 'Actualizar'}
              </button>
            </div>

            {driverLoading ? (
              <div className="driver-empty-state">
                <p>
                  Cargando
                  conductores...
                </p>
              </div>
            ) : drivers.length ===
              0 ? (
              <div className="driver-empty-state">
                <p>
                  No hay conductores
                  registrados.
                </p>

                <button
                  className="driver-primary-button"
                  onClick={
                    openCreateDriverForm
                  }
                >
                  Registrar primer
                  conductor
                </button>
              </div>
            ) : (
              <div className="driver-table-container">
                <table className="driver-table">
                  <thead>
                    <tr>
                      <th>
                        Conductor
                      </th>
                      <th>DNI</th>
                      <th>
                        Licencia
                      </th>
                      <th>
                        Vehículo
                      </th>
                      <th>Estado</th>
                      <th>
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {drivers.map(
                      (driver) => (
                        <tr
                          key={
                            driver.conductor_id
                          }
                        >
                          <td>
                            <strong>
                              {
                                driver.nombre_completo
                              }
                            </strong>
                          </td>

                          <td>
                            {driver.dni}
                          </td>

                          <td>
                            {
                              driver.licencia
                            }
                          </td>

                          <td>
                            {
                              driver.vehiculo_id
                            }
                          </td>

                          <td>
                            <span
                              className={
                                driver.estado ===
                                'ACTIVO'
                                  ? 'driver-status driver-status-active'
                                  : 'driver-status driver-status-inactive'
                              }
                            >
                              {
                                driver.estado
                              }
                            </span>
                          </td>

                          <td>
                            <div className="driver-actions">
                              <button
                                className="driver-action-button driver-edit-button"
                                onClick={() =>
                                  openEditDriverForm(
                                    driver,
                                  )
                                }
                              >
                                Editar
                              </button>

                              {driver.estado ===
                              'ACTIVO' ? (
                                <button
                                  className="driver-action-button driver-deactivate-button"
                                  onClick={() =>
                                    changeDriverStatus(
                                      driver,
                                      'deactivate',
                                    )
                                  }
                                >
                                  Desactivar
                                </button>
                              ) : (
                                <button
                                  className="driver-action-button driver-activate-button"
                                  onClick={() =>
                                    changeDriverStatus(
                                      driver,
                                      'activate',
                                    )
                                  }
                                >
                                  Activar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {showDriverForm && (
            <div
              className="driver-modal-overlay"
              onClick={
                closeDriverForm
              }
            >
              <div
                className="driver-modal"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                <div className="driver-modal-header">
                  <div>
                    <h2>
                      {editingDriverId
                        ? 'Editar conductor'
                        : 'Nuevo conductor'}
                    </h2>

                    <p>
                      Completa la
                      información del
                      conductor.
                    </p>
                  </div>

                  <button
                    className="driver-close-button"
                    onClick={
                      closeDriverForm
                    }
                    disabled={
                      driverSaving
                    }
                    aria-label="Cerrar"
                  >
                    ×
                  </button>
                </div>

                <form
                  className="driver-form"
                  onSubmit={
                    handleDriverSubmit
                  }
                >
                  {driverError && (
                    <div className="driver-alert driver-error-alert">
                      {driverError}
                    </div>
                  )}

                  <div className="driver-form-group">
                    <label htmlFor="driver-nombre_completo">
                      Nombre completo
                    </label>

                    <input
                      id="driver-nombre_completo"
                      name="nombre_completo"
                      type="text"
                      value={
                        driverForm.nombre_completo
                      }
                      onChange={
                        handleDriverInputChange
                      }
                      placeholder="Ej. Juan Perez"
                      required
                    />
                  </div>

                  <div className="driver-form-group">
                    <label htmlFor="driver-dni">
                      DNI
                    </label>

                    <input
                      id="driver-dni"
                      name="dni"
                      type="text"
                      value={
                        driverForm.dni
                      }
                      onChange={
                        handleDriverInputChange
                      }
                      placeholder="8 dígitos"
                      maxLength={8}
                      required
                    />
                  </div>

                  <div className="driver-form-group">
                    <label htmlFor="driver-licencia">
                      Licencia de conducir
                    </label>

                    <input
                      id="driver-licencia"
                      name="licencia"
                      type="text"
                      value={
                        driverForm.licencia
                      }
                      onChange={
                        handleDriverInputChange
                      }
                      placeholder="Ej. A12345678"
                      required
                    />
                  </div>

                  <div className="driver-form-group">
                    <label htmlFor="driver-vehiculo_id">
                      Vehículo asignado
                    </label>

                    <input
                      id="driver-vehiculo_id"
                      name="vehiculo_id"
                      type="text"
                      value={
                        driverForm.vehiculo_id
                      }
                      onChange={
                        handleDriverInputChange
                      }
                      placeholder="Ej. vehiculo-001"
                      required
                    />
                  </div>

                  <div className="driver-modal-actions">
                    <button
                      type="button"
                      className="driver-secondary-button"
                      onClick={
                        closeDriverForm
                      }
                      disabled={
                        driverSaving
                      }
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="driver-primary-button"
                      disabled={
                        driverSaving
                      }
                    >
                      {driverSaving
                        ? 'Guardando...'
                        : editingDriverId
                          ? 'Guardar cambios'
                          : 'Registrar conductor'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          Gestión de Pedidos
      ===================================================== */}

      {activeView === 'pedidos' && (
        <OrderManagementView
          service={managementService}
          demo={demo}
        />
      )}

      {/* =====================================================
          Portal Conductor
      ===================================================== */}

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