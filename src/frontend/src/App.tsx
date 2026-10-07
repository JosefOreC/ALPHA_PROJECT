import { useState, useEffect } from 'react';

import { createDriverOrders } from './application/driverOrders';
import { DemoOrders } from './infrastructure/demoOrders';
import { HttpOrders } from './infrastructure/httpOrders';
import { DriverOrderView } from './interfaces/DriverOrderView';

import { createManagement } from './application/manageOrders';
import { DemoManagement } from './infrastructure/demoManagement';
import { HttpManagement } from './infrastructure/httpManagement';
import { OrderManagementView } from './interfaces/OrderManagementView';
import { FleetView } from './interfaces/FleetView';

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

  // Las vistas migradas al design system traen su propio AppShell; las demás conservan la barra heredada.
  const showLegacyNav = activeView === 'dashboard' || activeView === 'conductor';

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
      {activeView === 'dashboard' && <DashboardPage gateway={dashboardGateway} />}

      {/* Vista 1: Flota (US-001 y US-002) */}
      {activeView === 'flota' && <FleetView onNavigate={navigateModule} />}

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
