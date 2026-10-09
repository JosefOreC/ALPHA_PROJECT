import { useState, useEffect, useMemo } from 'react';
import { authorizeAdministration, authorizeDriver, authorizeManagement, authorizePlanning, authorizeSustainability } from './application/authorizedServices';
import { can } from './domain/accessControl';
import { HttpSession } from './infrastructure/httpSession';
import { SessionProvider } from './interfaces/session/SessionContext';
import { useSession } from './interfaces/session/SessionState';
import { SessionGate, SessionToolbar } from './interfaces/session/SessionToolbar';
import { AppShell } from './shared/ui';
import { canOpenModule, homeModule } from './shared/ui/roles';

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
import { SustainabilityView } from './interfaces/SustainabilityView';
import { AdminView } from './interfaces/AdminView';
import { createAdministration } from './application/administration';
import { DemoAlgorithmSettings, DemoIntegrationCatalog, DemoUserDirectory, UnavailableAlgorithmSettings, UnavailableIntegrationCatalog, UnavailableUserDirectory } from './infrastructure/demoAdmin';
import { createGetSustainabilityReport } from './application/getSustainabilityReport';
import { BrowserFileSaver } from './infrastructure/browserFileSaver';
import { DemoSustainabilityReport, UnavailableSustainabilityReport } from './infrastructure/demoSustainability';
import { createGenerateRoutes } from './application/generateRoutes';
import { DemoMapData, UnavailableMapData } from './infrastructure/demoMapData';
import { DemoPlanningSource, DemoRouteOptimizer, UnavailableRouteOptimizer } from './infrastructure/demoRoutePlanning';
import { createLivePlanningSource } from './infrastructure/livePlanningSource';
import { vehicleApi } from './services/vehicleApi';

import { DashboardPage, DemoDashboardInsights, HttpDashboardGateway } from './features/dashboard';
import { RouteMap } from './interfaces/map/RouteMap';
import type { ModuleId } from './shared/ui';

// Raíz de composición: se instancian los gateways / adaptadores
const dashboardGateway = new HttpDashboardGateway({ baseUrl: import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? '' });
const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
const demo = apiUrl === undefined;
const sessionSource = new HttpSession(apiUrl ?? '');
// CO₂ evitado y pedidos en riesgo aún no tienen API: solo hay ejemplo en modo demostración.
const insightsGateway = demo ? new DemoDashboardInsights() : undefined;
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

// Sin API de coordenadas el mapa avisa en lugar de dibujar datos inventados.
const mapSource = demo ? new DemoMapData() : new UnavailableMapData();

// Los parámetros del algoritmo, usuarios e integraciones aún no tienen API: solo hay ejemplo en modo demostración.
const algorithmSettings = demo ? new DemoAlgorithmSettings() : new UnavailableAlgorithmSettings();
const administration = createAdministration({
  settings: algorithmSettings,
  users: demo ? new DemoUserDirectory() : new UnavailableUserDirectory(),
  integrations: demo ? new DemoIntegrationCatalog() : new UnavailableIntegrationCatalog(),
});

// Sin motor real (EN-01) solo el modo demostración devuelve una propuesta.
const routeService = createGenerateRoutes(
  demo
    ? { optimizer: new DemoRouteOptimizer(), planning: new DemoPlanningSource(), settings: algorithmSettings }
    : { optimizer: new UnavailableRouteOptimizer(), planning: createLivePlanningSource(managementService, vehicleApi), settings: algorithmSettings }
);

// Sin API de reportes solo el modo demostración tiene cifras que mostrar.
const sustainabilityService = createGetSustainabilityReport({
  source: demo ? new DemoSustainabilityReport() : new UnavailableSustainabilityReport(),
  saver: new BrowserFileSaver(),
});

type ActiveView = Exclude<ModuleId, 'pedido-actual'> | 'conductor';

function getViewFromUrl(): { view: ActiveView; orderId: string } {
  if (typeof window === 'undefined') {
    return { view: 'dashboard', orderId: DEFAULT_ORDER };
  }
  const params = new URLSearchParams(window.location.search);
  const vista = params.get('vista');
  const pedido = params.get('pedido');
  if (vista === 'conductores' || vista === 'auditoria' || vista === 'incidencias') return { view: vista, orderId: pedido || DEFAULT_ORDER };

  if (vista === 'flota') {
    return { view: 'flota', orderId: pedido || DEFAULT_ORDER };
  }
  if (vista === 'pedidos') {
    return { view: 'pedidos', orderId: pedido || DEFAULT_ORDER };
  }
  if (vista === 'rutas') {
    return { view: 'rutas', orderId: pedido || DEFAULT_ORDER };
  }
  if (vista === 'admin') {
    return { view: 'admin', orderId: pedido || DEFAULT_ORDER };
  }
  if (vista === 'sostenibilidad') {
    return { view: 'sostenibilidad', orderId: pedido || DEFAULT_ORDER };
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
  return <SessionProvider source={sessionSource} demo={demo}><SessionApp /></SessionProvider>;
}

function SessionApp() {
  const session = useSession()!;
  if (!session.user || session.loading) return <SessionGate />;
  return <AuthorizedApp key={session.user.subjectId} />;
}

function AuthorizedApp() {
  const user = useSession()!.user!;
  const secured = useMemo(() => ({
    management: authorizeManagement(managementService, user.role),
    administration: authorizeAdministration(administration, user.role),
    planning: authorizePlanning(routeService, user.role),
    sustainability: authorizeSustainability(sustainabilityService, user.role),
    driver: authorizeDriver(driverService, driverRouteService, user, demo),
  }), [user]);
  const initial = getViewFromUrl();
  if (!window.location.search) initial.view = homeModule(user.role).id === 'pedido-actual' ? 'conductor' : homeModule(user.role).id as ActiveView;
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
    } else if (view === 'admin') {
      params.set('vista', 'admin');
      params.delete('pedido');
    } else if (view === 'sostenibilidad') {
      params.set('vista', 'sostenibilidad');
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
    if (id === 'dashboard' || id === 'flota' || id === 'pedidos' || id === 'rutas' || id === 'sostenibilidad' || id === 'admin' || id === 'mi-ruta') navigateTo(id);
    else if (id === 'pedido-actual') navigateTo('conductor', currentOrderId);
    else if (id === 'auditoria' || id === 'conductores' || id === 'incidencias') {
      window.history.pushState({}, '', href); setActiveView(id);
    }
  };

  const moduleId: ModuleId = activeView === 'conductor' ? 'pedido-actual' : activeView;
  if (!canOpenModule(user.role, moduleId)) return <>
    <SessionToolbar onNavigate={navigateModule} />
    <AppShell role={user.role} current={homeModule(user.role).id} user={{ name: user.name, initials: user.name[0] }} title="Acceso restringido" onNavigate={navigateModule}>
      <h1 className="eco-h1">Acceso restringido</h1><p className="eco-sub">Tu perfil no tiene acceso a esta sección.</p>
      <button className="eco-btn" type="button" onClick={() => { const home = homeModule(user.role); navigateModule(home.id, home.href) }}>Ir a mi inicio</button>
    </AppShell>
  </>;

  return (
    <>
      <SessionToolbar onNavigate={navigateModule} />
      {/* Vista 0: Dashboard del Día */}
      {activeView === 'dashboard' && (
        <DashboardPage
          gateway={dashboardGateway}
          insights={insightsGateway}
          demoNote={demo ? 'Modo demo · CO₂ evitado y pedidos en riesgo de ejemplo' : undefined}
          renderMap={({ selectedId, onSelect }) => <RouteMap source={mapSource} profile="dashboard" selectedId={selectedId} onSelect={onSelect} compact />}
          onNavigate={navigateModule}
        />
      )}

      {/* Vista 1: Flota (US-001 y US-002) */}
      {activeView === 'flota' && <FleetView onNavigate={navigateModule} />}

      {/* Vista 2: Gestión de Pedidos */}
      {activeView === 'pedidos' && (
        <OrderManagementView service={secured.management} demo={demo} mapSource={mapSource} onNavigate={navigateModule} />
      )}

      {/* Vista 3: Generar rutas del día (US-005) */}
      {activeView === 'rutas' && <RoutePlanningView service={secured.planning} renderMap={can(user.role, 'map.read') ? <RouteMap source={mapSource} profile="operations" /> : undefined} onNavigate={navigateModule} />}

      {/* Vista 4: Reporte de sostenibilidad (US-010 / US-011) */}
      {activeView === 'sostenibilidad' && <SustainabilityView service={secured.sustainability} onNavigate={navigateModule} />}

      {/* Vista 5: Administración */}
      {activeView === 'admin' && <AdminView service={secured.administration} demo={demo} onNavigate={navigateModule} />}

      {/* Vista 6: Mi ruta del conductor */}
      {activeView === 'mi-ruta' && (
        <DriverRouteView
          service={secured.driver.route}
          mapSource={mapSource}
          onNavigate={navigateModule}
          onOpenOrder={(orderId) => navigateTo('conductor', orderId)}
        />
      )}

      {/* Vista 7: Pedido actual del conductor */}
      {activeView === 'conductor' && (
        <DriverOrderView
          key={currentOrderId}
          service={secured.driver.orders}
          routeService={secured.driver.route}
          orderId={currentOrderId}
          demo={demo}
          onNavigate={navigateModule}
          onOpenOrder={(orderId) => navigateTo('conductor', orderId)}
        />
      )}
      {['auditoria', 'conductores', 'incidencias'].includes(activeView) ? <AppShell role={user.role} current={moduleId} user={{ name: user.name, initials: user.name[0] }} title={activeView === 'auditoria' ? 'Auditoría' : activeView === 'conductores' ? 'Conductores' : 'Incidencias'} onNavigate={navigateModule}>
        <h1 className="eco-h1">{activeView === 'auditoria' ? 'Auditoría' : activeView === 'conductores' ? 'Conductores' : 'Incidencias'}</h1>
        <p className="eco-sub">Tu perfil tiene acceso a esta sección. Su interfaz operativa está pendiente de implementación.</p>
      </AppShell> : null}
    </>
  );
}

export default App;
