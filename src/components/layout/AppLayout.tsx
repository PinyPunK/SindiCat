import { useEffect, useState, type ReactNode } from 'react';
import { Menu, X, LogOut, Wifi, WifiOff } from 'lucide-react';
import { NAV_ITEMS, type ModuleId } from '../../app/navigation';

interface AppLayoutProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  userEmail?: string;
  onSignOut: () => void;
  children: ReactNode;
}

export function AppLayout({
  activeModule,
  onSelectModule,
  userEmail,
  onSignOut,
  children,
}: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const currentItem = NAV_ITEMS.find((item) => item.id === activeModule) ?? NAV_ITEMS[0];

  const handleNavClick = (id: ModuleId) => {
    onSelectModule(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-sindicat-bg text-sindicat-ink flex">
      {/* Fondo oscuro en móvil al abrir menú */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Barra lateral */}
      <aside
        aria-label="Menú principal"
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-sindicat-surface border-r border-sindicat-primary-light flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-sindicat-primary-light">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sindicat-primary text-white font-bold text-sm">
              SC
            </div>
            <div>
              <span className="block text-base font-bold text-sindicat-primary leading-tight">
                SindiCat
              </span>
              <span className="block text-[11px] text-sindicat-ink/60">
                Gestión de colonias
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-sindicat-ink/70 hover:bg-sindicat-primary-light cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeModule;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-sindicat-primary text-white shadow-xs'
                    : 'text-sindicat-ink/80 hover:bg-sindicat-primary-light hover:text-sindicat-primary'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sindicat-primary-light">
          {userEmail && (
            <p className="px-2 pb-2 text-xs text-sindicat-ink/60 truncate" title={userEmail}>
              {userEmail}
            </p>
          )}
          <button
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-sindicat-danger/40 px-3 py-2 text-xs font-semibold text-sindicat-danger hover:bg-sindicat-danger/10 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 bg-sindicat-surface/95 backdrop-blur border-b border-sindicat-primary-light px-4 lg:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-sindicat-primary-light text-sindicat-primary hover:bg-sindicat-primary-light cursor-pointer"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold text-sindicat-primary truncate">
              {currentItem.label}
            </h1>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              isOnline
                ? 'bg-sindicat-primary-light text-sindicat-primary'
                : 'bg-sindicat-warning/20 text-sindicat-warning'
            }`}
          >
            {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            <span>{isOnline ? 'En línea' : 'Sin conexión'}</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}