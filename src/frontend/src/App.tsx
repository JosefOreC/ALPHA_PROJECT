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
import { HttpOrders } from './infrastructure/httpOrders';
import { DriverOrderView } from './interfaces/DriverOrderView';
import { DriverRouteView } from './interfaces/DriverRouteView';

import { createManagement } from './application/manageOrders';
import { HttpManagement } from './infrastructure/httpManagement';
import { OrderManagementView } from './interfaces/OrderManagementView';
import { FleetView } from './interfaces/FleetView';
import { RoutePlanningView } from './interfaces/RoutePlanningView';
import { SustainabilityView } from './interfaces/SustainabilityView';
import { AdminView } from './interfaces/AdminView';
import { createAdministration } from './application/administration';
import { createGetSustainabilityReport } from './application/getSustainabilityReport';
import { BrowserFileSaver } from './infrastructure/browserFileSaver';
import { createGenerateRoutes } from './application/generateRoutes';

import { DashboardPage, HttpDashboardGateway } from './features/dashboard';
import { HttpAlgorithmSettings, HttpDashboardInsights, HttpDriverRoute, HttpIntegrationCatalog, HttpMapData, HttpPlanningSource, HttpRouteOptimizer, HttpSustainabilityReport, HttpUserDirectory } from './infrastructure/httpPortal';
import { apiBaseUrl, getCsrfToken } from './infrastructure/httpClient';
import { RecordsView } from './interfaces/RecordsView';
import { DriversView } from './interfaces/DriversView';
import { RouteMap } from './interfaces/map/RouteMap';
import type { ModuleId } from './shared/ui';

const dashboardGateway = new HttpDashboardGateway({ baseUrl: apiBaseUrl });
const sessionSource = new HttpSession(apiBaseUrl);
const insightsGateway = new HttpDashboardInsights();
const driverService = createDriverOrders(new HttpOrders(apiBaseUrl));
const driverRouteService = createDriverRoute(new HttpDriverRoute());
const DEFAULT_ORDER = '';
const managementService = createManagement(new HttpManagement(apiBaseUrl, getCsrfToken));
const mapSource = new HttpMapData();
const algorithmSettings = new HttpAlgorithmSettings();
const administration = createAdministration({ settings: algorithmSettings, users: new HttpUserDirectory(), integrations: new HttpIntegrationCatalog() });
const routeService = createGenerateRoutes({ optimizer: new HttpRouteOptimizer(), planning: new HttpPlanningSource(), settings: algorithmSettings });
const sustainabilityService = createGetSustainabilityReport({ source: new HttpSustainabilityReport(), saver: new BrowserFileSaver() });

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
  return <SessionProvider source={sessionSource}><SessionApp /></SessionProvider>;
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
    driver: authorizeDriver(driverService, driverRouteService, user, false),
  }), [user]);
  const initial = getViewFromUrl();
  if (!window.location.search) initial.view = homeModule(user.role).id === 'pedido-actual' ? 'conductor' : homeModule(user.role).id as ActiveView;
  const [activeView, setActiveView] = useState<ActiveView>(initial.view);
  const [currentOrderId, setCurrentOrderId] = useState<string>(initial.orderId);

  // Sincronización con el historial del navegador (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const parsed = getViewFromUrl();
      if (!window.location.search) parsed.view = homeModule(user.role).id as ActiveView;
      setActiveView(parsed.view);
      setCurrentOrderId(parsed.orderId);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user.role]);

  const navigateTo = (view: ActiveView, orderId?: string) => {
    setActiveView(view);
    const params = new URLSearchParams();
    if (view !== 'dashboard') params.set('vista', view);
    if (view === 'conductor') { if (orderId) params.set('pedido', orderId); setCurrentOrderId(orderId ?? ''); }
    const queryString = params.toString();
    const targetUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;
    window.history.pushState({}, '', targetUrl);
  };

  // La barra superior de cada vista migrada al design system navega por módulo; lo que aún no existe recarga por URL.
  const navigateModule = (id: ModuleId, _href: string) => {
    if (id === 'dashboard' || id === 'flota' || id === 'pedidos' || id === 'rutas' || id === 'sostenibilidad' || id === 'admin' || id === 'mi-ruta') navigateTo(id);
    else if (id === 'pedido-actual') navigateTo('conductor');
    else if (id === 'auditoria' || id === 'conductores' || id === 'incidencias') {
      navigateTo(id);
    }
  };

  const moduleId: ModuleId = activeView === 'conductor' ? 'pedido-actual' : activeView;
  if (!canOpenModule(user.role, moduleId)) return <>
    <AppShell role={user.role} current={homeModule(user.role).id} user={{ name: user.name, initials: user.name[0] }} title="Acceso restringido" onNavigate={navigateModule}>
      <h1 className="eco-h1">Acceso restringido</h1><p className="eco-sub">Tu perfil no tiene acceso a esta sección.</p>
      <button className="eco-btn" type="button" onClick={() => { const home = homeModule(user.role); navigateModule(home.id, home.href) }}>Ir a mi inicio</button>
    </AppShell>
  </>;

  return (
    <>
      {activeView === 'mi-ruta' || activeView === 'conductor' ? <SessionToolbar onNavigate={navigateModule} /> : null}
      {/* Vista 0: Dashboard del Día */}
      {activeView === 'dashboard' && (
        <DashboardPage
          gateway={dashboardGateway}
          insights={insightsGateway}
          renderMap={({ selectedId, onSelect }) => <RouteMap source={mapSource} profile="dashboard" selectedId={selectedId} onSelect={onSelect} compact />}
          onNavigate={navigateModule}
        />
      )}

      {/* Vista 1: Flota (US-001 y US-002) */}
      {activeView === 'flota' && <FleetView onNavigate={navigateModule} />}

      {/* Vista 2: Gestión de Pedidos */}
      {activeView === 'pedidos' && (
        <OrderManagementView service={secured.management} mapSource={mapSource} onNavigate={navigateModule} />
      )}

      {/* Vista 3: Generar rutas del día (US-005) */}
      {activeView === 'rutas' && <RoutePlanningView service={secured.planning} renderMap={can(user.role, 'map.read') ? <RouteMap source={mapSource} profile="operations" /> : undefined} onNavigate={navigateModule} />}

      {/* Vista 4: Reporte de sostenibilidad (US-010 / US-011) */}
      {activeView === 'sostenibilidad' && <SustainabilityView service={secured.sustainability} onNavigate={navigateModule} />}

      {/* Vista 5: Administración */}
      {activeView === 'admin' && <AdminView service={secured.administration} onNavigate={navigateModule} />}

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

          onNavigate={navigateModule}
          onOpenOrder={(orderId) => navigateTo('conductor', orderId)}
        />
      )}
      {activeView === 'conductores' ? <DriversView onNavigate={navigateModule} /> : null}
      {activeView === 'auditoria' || activeView === 'incidencias' ? <RecordsView key={activeView} module={activeView} onNavigate={navigateModule} /> : null}
    </>
  );
}

export default App;
