import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  ShieldCheck,
  History,
  Search,
  Database,
  Download,
  Upload,
  Wifi,
  WifiOff,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { listAuditoria } from './adminService';
import {
  exportarBackupCompleto,
  getUltimoSnapshotLocal,
  restaurarBackupDesdeArchivo,
  type SnapshotInfo,
} from './backupService';
import type { RegistroAuditoria } from './types';

export function AdminPage() {
  const { user } = useAuth();
  const [registros, setRegistros] = useState<RegistroAuditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [accionFiltro, setAccionFiltro] = useState('todas');

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [snapshotInfo, setSnapshotInfo] = useState<SnapshotInfo | null>(null);
  const [backupBusy, setBackupBusy] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

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

  useEffect(() => {
    let mounted = true;
    Promise.all([listAuditoria(100), getUltimoSnapshotLocal()])
      .then(([audData, snapData]) => {
        if (!mounted) return;
        setRegistros(audData);
        setSnapshotInfo(snapData);
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar la auditoría.');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return registros.filter((r) => {
      if (accionFiltro !== 'todas' && r.accion !== accionFiltro) return false;
      if (!q) return true;
      return (
        r.entidad.toLowerCase().includes(q) ||
        r.accion.toLowerCase().includes(q) ||
        (r.registro_id ?? '').toLowerCase().includes(q)
      );
    });
  }, [registros, search, accionFiltro]);

  const handleExportBackup = async () => {
    setBackupBusy(true);
    setError(null);
    setBackupStatus(null);
    try {
      const { filename, totalRegistros } = await exportarBackupCompleto();
      const updatedSnap = await getUltimoSnapshotLocal();
      setSnapshotInfo(updatedSnap);
      setBackupStatus(
        `Copia descargada (${filename}) con ${totalRegistros} registros y guardada en caché offline.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar la copia de seguridad.');
    } finally {
      setBackupBusy(false);
    }
  };

  const handleRestoreFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const confirmed = window.confirm(
      `¿Restaurar registros desde "${file.name}"? Los registros existentes con el mismo ID se actualizarán.`
    );
    if (!confirmed) return;

    setBackupBusy(true);
    setError(null);
    setBackupStatus(null);
    try {
      const { totalRestaurados } = await restaurarBackupDesdeArchivo(file);
      setBackupStatus(`Restauración completada: ${totalRestaurados} registros procesados.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo restaurar la copia de seguridad.');
    } finally {
      setBackupBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-sindicat-ink">Administración privada y auditoría</h2>
          <p className="text-sm text-sindicat-ink/70">
            Cuenta privada, copias de seguridad JSON, caché offline y trazabilidad de cambios.
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            isOnline
              ? 'bg-sindicat-primary-light text-sindicat-primary'
              : 'bg-sindicat-warning/20 text-sindicat-warning'
          }`}
        >
          {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {isOnline ? 'En línea' : 'Modo sin conexión'}
        </span>
      </div>

      {/* Tarjetas de estado y copias de seguridad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="rounded-2xl bg-sindicat-surface p-5 border border-sindicat-primary-light space-y-2">
          <div className="flex items-center gap-2 text-sindicat-primary">
            <ShieldCheck className="h-5 w-5" />
            <h3 className="text-sm font-bold">Cuenta administradora</h3>
          </div>
          <p className="text-sm text-sindicat-ink">
            <strong>Sesión activa:</strong> {user?.email ?? 'Administradora'}
          </p>
          <p className="text-xs text-sindicat-ink/70">
            Acceso protegido por Supabase Auth, políticas RLS privadas y soporte PWA instalable.
          </p>
        </section>

        <section className="rounded-2xl bg-sindicat-surface p-5 border border-sindicat-primary-light space-y-3">
          <div className="flex items-center gap-2 text-sindicat-primary">
            <Database className="h-5 w-5" />
            <h3 className="text-sm font-bold">Copias de seguridad y caché offline</h3>
          </div>

          <p className="text-xs text-sindicat-ink/75">
            {snapshotInfo
              ? `Última copia local (IndexedDB): ${new Date(snapshotInfo.created_at).toLocaleString('es-ES', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })} · ${snapshotInfo.total_registros} registros.`
              : 'Todavía no hay una copia local guardada en este navegador.'}
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={backupBusy || !isOnline}
              onClick={() => void handleExportBackup()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-sindicat-primary px-3.5 py-2 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              {backupBusy ? 'Procesando...' : 'Descargar copia (JSON)'}
            </button>

            <label className="inline-flex items-center gap-1.5 rounded-xl border border-sindicat-primary/35 px-3.5 py-2 text-xs font-semibold text-sindicat-primary hover:bg-sindicat-primary-light cursor-pointer">
              <Upload className="h-3.5 w-3.5" />
              Restaurar JSON
              <input
                type="file"
                accept=".json,application/json"
                disabled={backupBusy || !isOnline}
                onChange={(e) => void handleRestoreFile(e)}
                className="hidden"
              />
            </label>
          </div>

          {backupStatus && (
            <div
              role="status"
              className="rounded-xl bg-sindicat-primary-light/70 border border-sindicat-primary/25 p-2.5 text-xs text-sindicat-primary flex items-start gap-2"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{backupStatus}</span>
            </div>
          )}
        </section>
      </div>

      {/* Registro de auditoría */}
      <section className="rounded-2xl bg-sindicat-surface p-5 border border-sindicat-primary-light space-y-4">
        <div className="flex items-center gap-2 text-sindicat-primary">
          <History className="h-5 w-5" />
          <h3 className="text-base font-bold">Registro de auditoría</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="h-4 w-4 text-sindicat-ink/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por entidad o identificador..."
              className="w-full rounded-xl border border-sindicat-primary-light bg-sindicat-bg/40 pl-10 pr-3.5 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
            />
          </div>

          <select
            aria-label="Filtrar auditoría por acción"
            value={accionFiltro}
            onChange={(e) => setAccionFiltro(e.target.value)}
            className="rounded-xl border border-sindicat-primary-light bg-sindicat-bg/40 px-3.5 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
          >
            <option value="todas">Todas las acciones</option>
            <option value="INSERT">Altas (INSERT)</option>
            <option value="UPDATE">Ediciones (UPDATE)</option>
            <option value="DELETE">Borrados físicos (DELETE)</option>
          </select>
        </div>

        {error && (
          <div role="alert" className="rounded-xl bg-sindicat-danger/10 border border-sindicat-danger/30 px-4 py-3 text-sm text-sindicat-danger">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-sindicat-ink/70">Cargando registro de auditoría...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-sindicat-ink/65">
            No hay movimientos de auditoría registrados con los filtros actuales.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-sindicat-primary-light text-sindicat-ink/70">
                  <th className="py-2 pr-3 font-semibold">Fecha</th>
                  <th className="py-2 pr-3 font-semibold">Entidad</th>
                  <th className="py-2 pr-3 font-semibold">Acción</th>
                  <th className="py-2 font-semibold">ID registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sindicat-primary-light">
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 pr-3 whitespace-nowrap text-sindicat-ink/75">
                      {new Date(item.created_at).toLocaleString('es-ES', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-2.5 pr-3 font-medium text-sindicat-ink">{item.entidad}</td>
                    <td className="py-2.5 pr-3">
                      <span className="rounded-full bg-sindicat-primary-light px-2.5 py-0.5 text-[11px] font-semibold text-sindicat-primary">
                        {item.accion}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-xs text-sindicat-ink/65">
                      {item.registro_id ? `${item.registro_id.slice(0, 8)}…` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}