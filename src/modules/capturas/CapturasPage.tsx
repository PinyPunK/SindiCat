import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Calendar, MapPin, User, Pencil, Trash2 } from 'lucide-react';
import { listColonias } from '../colonias/coloniasService';
import type { Colonia } from '../colonias/types';
import { listGatos } from '../censo/censoService';
import type { Gato } from '../censo/types';
import {
  createCaptura,
  listCapturas,
  softDeleteCaptura,
  updateCaptura,
} from './capturasService';
import { CapturaFormModal } from './CapturaFormModal';
import {
  RESULTADO_CAPTURA_LABELS,
  type Captura,
  type CapturaInput,
  type ResultadoCaptura,
} from './types';

const RESULTADOS_LISTA = Object.keys(RESULTADO_CAPTURA_LABELS) as ResultadoCaptura[];

const BADGE_STYLE: Record<ResultadoCaptura, string> = {
  planificada: 'bg-sindicat-warning/20 text-sindicat-warning',
  capturado: 'bg-sindicat-primary-light text-sindicat-primary',
  fallida: 'bg-sindicat-danger/15 text-sindicat-danger',
  cancelada: 'bg-sindicat-ink/10 text-sindicat-ink/70',
};

export function CapturasPage() {
  const [capturas, setCapturas] = useState<Captura[]>([]);
  const [colonias, setColonias] = useState<Colonia[]>([]);
  const [gatos, setGatos] = useState<Gato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [resultadoFiltro, setResultadoFiltro] = useState<'todos' | ResultadoCaptura>('todos');
  const [coloniaFiltro, setColoniaFiltro] = useState('todas');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Captura | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [capturasData, coloniasData, gatosData] = await Promise.all([
        listCapturas(),
        listColonias(),
        listGatos(),
      ]);
      setCapturas(capturasData);
      setColonias(coloniasData);
      setGatos(gatosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las capturas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return capturas.filter((item) => {
      if (resultadoFiltro !== 'todos' && item.resultado !== resultadoFiltro) return false;
      if (coloniaFiltro !== 'todas' && (item.colonia_id ?? '') !== coloniaFiltro) return false;
      if (!q) return true;
      return (
        (item.ubicacion_texto ?? '').toLowerCase().includes(q) ||
        (item.gato_nombre ?? '').toLowerCase().includes(q) ||
        (item.colonia_nombre ?? '').toLowerCase().includes(q) ||
        (item.responsable ?? '').toLowerCase().includes(q) ||
        (item.observaciones ?? '').toLowerCase().includes(q)
      );
    });
  }, [capturas, search, resultadoFiltro, coloniaFiltro]);

  const handleSave = async (input: CapturaInput) => {
    if (editingItem) {
      await updateCaptura(editingItem.id, input);
    } else {
      await createCaptura(input);
    }
    await loadData();
  };

  const handleSoftDelete = async (item: Captura) => {
    const confirmed = window.confirm(
      `¿Enviar la captura de "${item.ubicacion_texto || item.colonia_nombre}" a la papelera?`
    );
    if (!confirmed) return;

    try {
      await softDeleteCaptura(item.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar a la papelera.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-sindicat-ink">Capturas y rescates</h2>
          <p className="text-sm text-sindicat-ink/70">
            Planificación de operativos, puntos de captura, responsables y resultados.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingItem(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-sindicat-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nueva captura
        </button>
      </div>

      {/* Buscador y filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="h-4 w-4 text-sindicat-ink/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ubicación, gato o responsable..."
            className="w-full rounded-xl border border-sindicat-primary-light bg-sindicat-surface pl-10 pr-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
          />
        </div>

        <select
          aria-label="Filtrar por resultado"
          value={resultadoFiltro}
          onChange={(e) => setResultadoFiltro(e.target.value as 'todos' | ResultadoCaptura)}
          className="rounded-xl border border-sindicat-primary-light bg-sindicat-surface px-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
        >
          <option value="todos">Todos los estados</option>
          {RESULTADOS_LISTA.map((key) => (
            <option key={key} value={key}>
              {RESULTADO_CAPTURA_LABELS[key]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filtrar por colonia"
          value={coloniaFiltro}
          onChange={(e) => setColoniaFiltro(e.target.value)}
          className="rounded-xl border border-sindicat-primary-light bg-sindicat-surface px-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
        >
          <option value="todas">Todas las colonias</option>
          {colonias.map((col) => (
            <option key={col.id} value={col.id}>
              {col.nombre}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div role="alert" className="rounded-xl bg-sindicat-danger/10 border border-sindicat-danger/30 px-4 py-3 text-sm text-sindicat-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-sindicat-surface p-6 border border-sindicat-primary-light text-sm text-sindicat-ink/70">
          Cargando capturas y rescates...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-sindicat-surface p-8 border border-sindicat-primary-light text-center">
          <p className="text-sm font-medium text-sindicat-ink">
            {capturas.length === 0
              ? 'Todavía no hay capturas ni rescates programados.'
              : 'No se encontraron capturas con los filtros actuales.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl bg-sindicat-surface p-4 sm:p-5 border border-sindicat-primary-light shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_STYLE[item.resultado]}`}>
                    {RESULTADO_CAPTURA_LABELS[item.resultado]}
                  </span>
                  <h3 className="text-sm font-bold text-sindicat-ink">
                    {item.ubicacion_texto || item.colonia_nombre || 'Captura sin ubicación'}
                  </h3>
                  {item.gato_nombre && (
                    <span className="text-xs font-semibold text-sindicat-primary">
                      · {item.gato_codigo} {item.gato_nombre}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sindicat-ink/70">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-sindicat-primary" />
                    {new Date(item.fecha_programada).toLocaleString('es-ES', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-sindicat-primary" />
                    {item.colonia_nombre}
                  </span>
                  {item.responsable && (
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-sindicat-primary" />
                      {item.responsable}
                    </span>
                  )}
                </div>

                {item.observaciones && (
                  <p className="text-xs text-sindicat-ink/80">{item.observaciones}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(item);
                    setFormOpen(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-sindicat-ink/15 px-2.5 py-1.5 text-xs font-semibold text-sindicat-ink hover:bg-sindicat-bg cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => void handleSoftDelete(item)}
                  aria-label={`Enviar captura ${item.ubicacion_texto || item.id} a papelera`}
                  className="inline-flex items-center gap-1 rounded-lg border border-sindicat-danger/30 px-2.5 py-1.5 text-xs font-semibold text-sindicat-danger hover:bg-sindicat-danger/10 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {formOpen && (
        <CapturaFormModal
          initialData={editingItem}
          colonias={colonias}
          gatos={gatos}
          onClose={() => {
            setFormOpen(false);
            setEditingItem(null);
          }}
          onSubmit={handleSave}
        />
      )}
    </div>
  );
}