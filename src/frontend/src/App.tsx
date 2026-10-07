import { useState, useEffect } from 'react';

import { createDriverOrders } from './application/driverOrders';
import { createDriverRoute } from './application/driverRoute';
import { DemoOrders, UnavailableDriverRoute } from './infrastructure/demoOrders';
import { HttpOrders } from './infrastructure/httpOrders';
import { DriverOrderView } from './interfaces/DriverOrderView';
import { DriverRouteView } from './interfaces/DriverRouteView';

import { createManagement } from './application/manageOrders';
import { DemoManagement } from './infrastructure/demoManagement';
import { HttpManagement } from './infrastructure/httpManagement';
import { OrderManagementView } from './interfaces/OrderManagementView';
import { FleetView } from './interfaces/FleetView';
import { RoutePlanningView } from './interfaces/RoutePlanningView';
import { createGenerateRoutes } from './application/generateRoutes';
import { DemoPlanningSource, DemoRouteOptimizer, UnavailableRouteOptimizer } from './infrastructure/demoRoutePlanning';
import { createLivePlanningSource } from './infrastructure/livePlanningSource';
import { vehicleApi } from './services/vehicleApi';

import { DashboardPage, HttpDashboardGateway } from './features/dashboard';
import type { ModuleId } from './shared/ui';

import './App.css';

// Raíz de composición: se instancian los gateways / adaptadores
const dashboardGateway = new HttpDashboardGateway();

const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
const demo = apiUrl === undefined;
// En demostración, pedidos y ruta del conductor comparten estado: confirmar una entrega avanza la ruta.
const demoDriver = demo ? new DemoOrders() : null;
const driverService = createDriverOrders(demoDriver ?? new HttpOrders(apiUrl ?? ''));
const driverRouteService = createDriverRoute(demoDriver ?? new UnavailableDriverRoute());
const DEFAULT_ORDER = 'PED-0026';
const managementService = createManagement(
  demo
    ? new DemoManagement()
    : new HttpManagement(
        apiUrl,
        () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? null
      )
);

// Sin motor real (EN-01) solo el modo demostración devuelve una propuesta.
const routeService = createGenerateRoutes(
  demo
    ? { optimizer: new DemoRouteOptimizer(), planning: new DemoPlanningSource() }
    : { optimizer: new UnavailableRouteOptimizer(), planning: createLivePlanningSource(managementService, vehicleApi) }
);

type ActiveView = 'dashboard' | 'flota' | 'pedidos' | 'rutas' | 'mi-ruta' | 'conductor';

function getViewFromUrl(): { view: ActiveView; orderId: string } {
  if (typeof window === 'undefined') {
    return { view: 'dashboard', orderId: DEFAULT_ORDER };
  }
  const params = new URLSearchParams(window.location.search);
  const vista = params.get('vista');
  const pedido = params.get('pedido');

  if (vista === 'flota') {
    return { view: 'flota', orderId: pedido || DEFAULT_ORDER };
  }
  if (vista === 'pedidos') {
    return { view: 'pedidos', orderId: pedido || DEFAULT_ORDER };
  }
  if (vista === 'rutas') {
    return { view: 'rutas', orderId: pedido || DEFAULT_ORDER };
  }
  if (vista === 'mi-ruta') {
    return { view: 'mi-ruta', orderId: pedido || DEFAULT_ORDER };
  }
  if (vista === 'conductor' || pedido) {
    return { view: 'conductor', orderId: pedido || DEFAULT_ORDER };
  }
  return { view: 'dashboard', orderId: DEFAULT_ORDER };
}

export function App() {
  const initial = getViewFromUrl();
  const [activeView, setActiveView] = useState<ActiveView>(initial.view);
  const [currentOrderId, setCurrentOrderId] = useState<string>(initial.orderId);

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
    } else if (view === 'rutas') {
      params.set('vista', 'rutas');
      params.delete('pedido');
    } else if (view === 'mi-ruta') {
      params.set('vista', 'mi-ruta');
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
    if (id === 'dashboard' || id === 'flota' || id === 'pedidos' || id === 'rutas' || id === 'mi-ruta') navigateTo(id);
    else if (id === 'pedido-actual') navigateTo('conductor', currentOrderId);
    else window.location.assign(href);
  };

  // Las vistas migradas al design system traen su propio AppShell; las demás conservan la barra heredada.
  const showLegacyNav = activeView === 'dashboard';

  return (
    <>
      {showLegacyNav && (
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

            <button type="button" className="nav-tab" onClick={() => navigateTo('flota')} id="tab-nav-flota">
              🚛 Flota Vehicular
            </button>

            <button type="button" className="nav-tab" onClick={() => navigateTo('pedidos')} id="tab-nav-pedidos">
              📦 Gestión de Pedidos
            </button>

            <button type="button" className="nav-tab" onClick={() => navigateTo('mi-ruta')} id="tab-nav-conductor">
              🛵 Vista Conductor
            </button>
          </div>
        </nav>
      )}

      {/* Vista 0: Dashboard del Día */}
      {activeView === 'dashboard' && <DashboardPage gateway={dashboardGateway} />}

      {/* Vista 1: Flota (US-001 y US-002) */}
      {activeView === 'flota' && <FleetView onNavigate={navigateModule} />}

      {/* Vista 2: Gestión de Pedidos */}
      {activeView === 'pedidos' && (
        <OrderManagementView service={managementService} demo={demo} onNavigate={navigateModule} />
      )}

      {/* Vista 3: Generar rutas del día (US-005) */}
      {activeView === 'rutas' && <RoutePlanningView service={routeService} onNavigate={navigateModule} />}

      {/* Vista 4: Mi ruta del conductor */}
      {activeView === 'mi-ruta' && (
        <DriverRouteView
          service={driverRouteService}
          onNavigate={navigateModule}
          onOpenOrder={(orderId) => navigateTo('conductor', orderId)}
        />
      )}

      {/* Vista 5: Pedido actual del conductor */}
      {activeView === 'conductor' && (
        <DriverOrderView
          key={currentOrderId}
          service={driverService}
          routeService={driverRouteService}
          orderId={currentOrderId}
          demo={demo}
          onNavigate={navigateModule}
          onOpenOrder={(orderId) => navigateTo('conductor', orderId)}
        />
      )}
    </>
  );
}

export default App;
