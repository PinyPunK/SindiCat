import { useEffect, useState } from 'react';
import {
  MapPin,
  Cat,
  ShieldCheck,
  Stethoscope,
  AlertTriangle,
  Crosshair,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { getDashboardData, type DashboardData } from './dashboardService';

const ESTADO_CER_LABEL: Record<string, string> = {
  esterilizacion_pendiente: 'Esterilización pendiente',
  captura_programada: 'Captura programada',
  captura_realizada: 'Captura realizada',
  captura_fallida: 'Captura fallida',
  traslado_clinica: 'Traslado a clínica',
  intervencion_quirurgica: 'Intervención quirúrgica',
  marcaje_auricular: 'Marcaje auricular',
  recuperacion: 'Recuperación',
  retorno_colonia: 'Retorno a la colonia',
  seguimiento_posterior: 'Seguimiento posterior',
};

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDashboardData();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos del Dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  if (loading && !data) {
    return (
      <div className="rounded-2xl bg-sindicat-surface p-6 border border-sindicat-primary-light text-sm text-sindicat-ink/70">
        Cargando resumen de colonias...
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-2xl bg-sindicat-danger/10 border border-sindicat-danger/30 p-5 text-sm text-sindicat-danger flex items-center justify-between gap-4">
        <span>Error al cargar el Dashboard: {error}</span>
        <button
          type="button"
          onClick={() => void loadData()}
          className="rounded-xl bg-sindicat-danger px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;

  const porcentajeCer =
    data.totalGatos > 0 ? Math.round((data.esterilizados / data.totalGatos) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-sindicat-ink">Resumen general</h2>
          <p className="text-sm text-sindicat-ink/70">
            Estado actual de tus colonias, censo felino y control CER.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadData()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-sindicat-primary/30 bg-sindicat-surface px-3.5 py-2 text-xs font-semibold text-sindicat-primary hover:bg-sindicat-primary-light disabled:opacity-60 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Tarjetas de indicadores principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <article className="rounded-2xl bg-sindicat-surface p-4 border border-sindicat-primary-light shadow-xs">
          <div className="flex items-center justify-between text-sindicat-primary">
            <span className="text-xs font-semibold uppercase tracking-wide">Colonias</span>
            <MapPin className="h-4 w-4" />
          </div>
          <p className="mt-2 text-3xl font-bold text-sindicat-ink">{data.totalColonias}</p>
          <p className="mt-1 text-xs text-sindicat-ink/60">Activas e inactivas</p>
        </article>

        <article className="rounded-2xl bg-sindicat-surface p-4 border border-sindicat-primary-light shadow-xs">
          <div className="flex items-center justify-between text-sindicat-primary">
            <span className="text-xs font-semibold uppercase tracking-wide">Gatos censados</span>
            <Cat className="h-4 w-4" />
          </div>
          <p className="mt-2 text-3xl font-bold text-sindicat-ink">{data.totalGatos}</p>
          <p className="mt-1 text-xs text-sindicat-ink/70">
            {data.machos} machos · {data.hembras} hembras
          </p>
        </article>

        <article className="rounded-2xl bg-sindicat-surface p-4 border border-sindicat-primary-light shadow-xs">
          <div className="flex items-center justify-between text-sindicat-primary">
            <span className="text-xs font-semibold uppercase tracking-wide">Control CER</span>
            <ShieldCheck className="h-4 w-4" />
          </div>
          <p className="mt-2 text-3xl font-bold text-sindicat-primary">{porcentajeCer}%</p>
          <p className="mt-1 text-xs text-sindicat-ink/70">
            {data.esterilizados} esterilizados · {data.pendientesCer} pendientes
          </p>
        </article>

        <article className="rounded-2xl bg-sindicat-surface p-4 border border-sindicat-primary-light shadow-xs">
          <div className="flex items-center justify-between text-sindicat-warning">
            <span className="text-xs font-semibold uppercase tracking-wide">Seguimiento vet.</span>
            <Stethoscope className="h-4 w-4" />
          </div>
          <p className="mt-2 text-3xl font-bold text-sindicat-ink">{data.seguimientoVeterinario}</p>
          <p className="mt-1 text-xs text-sindicat-ink/60">Gatos en seguimiento</p>
        </article>

        <article className="rounded-2xl bg-sindicat-surface p-4 border border-sindicat-primary-light shadow-xs">
          <div className="flex items-center justify-between text-sindicat-danger">
            <span className="text-xs font-semibold uppercase tracking-wide">Incidencias</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <p className="mt-2 text-3xl font-bold text-sindicat-danger">{data.incidenciasAbiertas}</p>
          <p className="mt-1 text-xs text-sindicat-ink/60">Abiertas o en curso</p>
        </article>
      </div>

      {/* Paneles de próximas capturas y actuaciones recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-2xl bg-sindicat-surface p-5 border border-sindicat-primary-light shadow-xs">
          <div className="flex items-center gap-2 text-sindicat-primary mb-4">
            <Crosshair className="h-4 w-4" />
            <h3 className="text-base font-bold">Próximas capturas</h3>
          </div>
          {data.proximasCapturas.length === 0 ? (
            <p className="text-sm text-sindicat-ink/60">
              No hay capturas programadas por el momento.
            </p>
          ) : (
            <ul className="divide-y divide-sindicat-primary-light">
              {data.proximasCapturas.map((cap) => (
                <li key={cap.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-sindicat-ink truncate">
                    {cap.ubicacion_texto || 'Ubicación sin especificar'}
                  </span>
                  <span className="text-xs text-sindicat-ink/60 shrink-0">
                    {new Date(cap.fecha_programada).toLocaleDateString('es-ES')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl bg-sindicat-surface p-5 border border-sindicat-primary-light shadow-xs">
          <div className="flex items-center gap-2 text-sindicat-primary mb-4">
            <Activity className="h-4 w-4" />
            <h3 className="text-base font-bold">Actuaciones recientes</h3>
          </div>
          {data.actuacionesRecientes.length === 0 ? (
            <p className="text-sm text-sindicat-ink/60">
              Todavía no se han registrado actuaciones CER.
            </p>
          ) : (
            <ul className="divide-y divide-sindicat-primary-light">
              {data.actuacionesRecientes.map((act) => (
                <li key={act.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-sindicat-ink truncate">
                      {ESTADO_CER_LABEL[act.estado] ?? act.estado}
                    </p>
                    {act.observaciones && (
                      <p className="text-xs text-sindicat-ink/60 truncate">{act.observaciones}</p>
                    )}
                  </div>
                  <span className="text-xs text-sindicat-ink/60 shrink-0">
                    {new Date(act.fecha_actuacion).toLocaleDateString('es-ES')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}