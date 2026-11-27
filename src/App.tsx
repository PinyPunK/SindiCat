import { useState } from 'react';
import { AuthProvider, useAuth } from './modules/auth/AuthContext';
import { LoginPage } from './modules/auth/LoginPage';
import { AppLayout } from './components/layout/AppLayout';
import type { ModuleId } from './app/navigation';
import { DashboardPage } from './modules/dashboard/DashboardPage';
import { ColoniasPage } from './modules/colonias/ColoniasPage';
import { CensoPage } from './modules/censo/CensoPage';
import { CerPage } from './modules/cer/CerPage';
import { VeterinarioPage } from './modules/veterinario/VeterinarioPage';
import { CapturasPage } from './modules/capturas/CapturasPage';
import { IncidenciasPage } from './modules/incidencias/IncidenciasPage';
import { AlimentacionPage } from './modules/alimentacion/AlimentacionPage';
import { AcogidasPage } from './modules/acogidas/AcogidasPage';
import { AgendaPage } from './modules/agenda/AgendaPage';
import { MapaPage } from './modules/mapa/MapaPage';
import { InformesPage } from './modules/informes/InformesPage';
import { PapeleraPage } from './modules/papelera/PapeleraPage';
import { AdminPage } from './modules/admin/AdminPage';

function AppContent() {
  const { session, user, loading, signOut } = useAuth();
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');

  if (loading) {
    return (
      <main className="min-h-screen bg-sindicat-bg flex items-center justify-center p-4">
        <p className="text-sm font-medium text-sindicat-primary">Cargando SindiCat...</p>
      </main>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  const renderModule = () => {
    if (activeModule === 'dashboard') return <DashboardPage />;
    if (activeModule === 'colonias') return <ColoniasPage />;
    if (activeModule === 'censo') return <CensoPage />;
    if (activeModule === 'cer') return <CerPage />;
    if (activeModule === 'veterinario') return <VeterinarioPage />;
    if (activeModule === 'capturas') return <CapturasPage />;
    if (activeModule === 'incidencias') return <IncidenciasPage />;
    if (activeModule === 'alimentacion') return <AlimentacionPage />;
    if (activeModule === 'acogidas') return <AcogidasPage />;
    if (activeModule === 'agenda') return <AgendaPage />;
    if (activeModule === 'mapa') return <MapaPage />;
    if (activeModule === 'informes') return <InformesPage />;
    if (activeModule === 'papelera') return <PapeleraPage />;
    return <AdminPage />;
  };

  return (
    <AppLayout
      activeModule={activeModule}
      onSelectModule={setActiveModule}
      userEmail={user?.email}
      onSignOut={() => void signOut()}
    >
      {renderModule()}
    </AppLayout>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;