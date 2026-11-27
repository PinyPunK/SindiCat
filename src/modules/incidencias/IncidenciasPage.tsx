import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Calendar, MapPin, Cat, Pencil, Trash2 } from 'lucide-react';
import { listColonias } from '../colonias/coloniasService';
import type { Colonia } from '../colonias/types';
import { listGatos } from '../censo/censoService';
import type { Gato } from '../censo/types';
import {
  createIncidencia,
  listIncidencias,
  softDeleteIncidencia,
  updateIncidencia,
} from './incidenciasService';
import { IncidenciaFormModal } from './IncidenciaFormModal';
import {
  ESTADO_INCIDENCIA_LABELS,
  TIPO_INCIDENCIA_LABELS,
  type EstadoIncidencia,
  type Incidencia,
  type IncidenciaInput,
  type TipoIncidencia,
} from './types';

const TIPOS_LISTA = Object.keys(TIPO_INCIDENCIA_LABELS) as TipoIncidencia[];
const ESTADOS_LISTA = Object.keys(ESTADO_INCIDENCIA_LABELS) as EstadoIncidencia[];

const ESTADO_BADGE: Record<EstadoIncidencia, string> = {
  abierta: 'bg-sindicat-danger/15 text-sindicat-danger',
  en_curso: 'bg-sindicat-warning/20 text-sindicat-warning',
  resuelta: 'bg-sindicat-primary-light text-sindicat-primary',
};

export function IncidenciasPage() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [colonias, setColonias] = useState<Colonia[]>([]);
  const [gatos, setGatos] = useState<Gato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | TipoIncidencia>('todos');
  const [estadoFiltro, setEstadoFiltro] = useState<'todos' | EstadoIncidencia>('todos');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Incidencia | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [incData, coloniasData, gatosData] = await Promise.all([
        listIncidencias(),
        listColonias(),
        listGatos(),
      ]);
      setIncidencias(incData);
      setColonias(coloniasData);
      setGatos(gatosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las incidencias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return incidencias.filter((item) => {
      if (tipoFiltro !== 'todos' && item.tipo !== tipoFiltro) return false;
      if (estadoFiltro !== 'todos' && item.estado !== estadoFiltro) return false;
      if (!q) return true;
      return (
        item.descripcion.toLowerCase().includes(q) ||
        (item.colonia_nombre ?? '').toLowerCase().includes(q) ||
        (item.gato_nombre ?? '').toLowerCase().includes(q) ||
        TIPO_INCIDENCIA_LABELS[item.tipo].toLowerCase().includes(q)
      );
    });
  }, [incidencias, search, tipoFiltro, estadoFiltro]);

  const handleSave = async (input: IncidenciaInput) => {
    if (editingItem) {
      await updateIncidencia(editingItem.id, input);
    } else {
      await createIncidencia(input);
    }
    await loadData();
  };

  const handleSoftDelete = async (item: Incidencia) => {
    const confirmed = window.confirm(
      `¿Enviar la incidencia "${TIPO_INCIDENCIA_LABELS[item.tipo]}" a la papelera?`
    );
    if (!confirmed) return;

    try {
      await softDeleteIncidencia(item.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar a la papelera.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-sindicat-ink">Incidencias</h2>
          <p className="text-sm text-sindicat-ink/70">
            Registro de alertas, camadas, desapariciones, lesiones y avisos vecinales.
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
          Nueva incidencia
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
            placeholder="Buscar por descripción, colonia o gato..."
            className="w-full rounded-xl border border-sindicat-primary-light bg-sindicat-surface pl-10 pr-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
          />
        </div>

        <select
          aria-label="Filtrar por tipo de incidencia"
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value as 'todos' | TipoIncidencia)}
          className="rounded-xl border border-sindicat-primary-light bg-sindicat-surface px-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
        >
          <option value="todos">Todos los tipos</option>
          {TIPOS_LISTA.map((key) => (
            <option key={key} value={key}>
              {TIPO_INCIDENCIA_LABELS[key]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filtrar por estado de incidencia"
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value as 'todos' | EstadoIncidencia)}
          className="rounded-xl border border-sindicat-primary-light bg-sindicat-surface px-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
        >
          <option value="todos">Todos los estados</option>
          {ESTADOS_LISTA.map((key) => (
            <option key={key} value={key}>
              {ESTADO_INCIDENCIA_LABELS[key]}
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
          Cargando incidencias...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-sindicat-surface p-8 border border-sindicat-primary-light text-center">
          <p className="text-sm font-medium text-sindicat-ink">
            {incidencias.length === 0
              ? 'Todavía no hay incidencias registradas.'
              : 'No se encontraron incidencias con los filtros actuales.'}
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
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTADO_BADGE[item.estado]}`}>
                    {ESTADO_INCIDENCIA_LABELS[item.estado]}
                  </span>
                  <h3 className="text-sm font-bold text-sindicat-ink">
                    {TIPO_INCIDENCIA_LABELS[item.tipo]}
                  </h3>
                </div>

                <p className="text-sm text-sindicat-ink/85 whitespace-pre-line">
                  {item.descripcion}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sindicat-ink/70">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-sindicat-primary" />
                    {new Date(item.fecha).toLocaleDateString('es-ES')}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-sindicat-primary" />
                    {item.colonia_nombre}
                  </span>
                  {item.gato_nombre && (
                    <span className="inline-flex items-center gap-1 font-medium text-sindicat-primary">
                      <Cat className="h-3.5 w-3.5" />
                      {item.gato_codigo} · {item.gato_nombre}
                    </span>
                  )}
                </div>
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
                  aria-label={`Enviar incidencia ${TIPO_INCIDENCIA_LABELS[item.tipo]} a papelera`}
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
        <IncidenciaFormModal
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