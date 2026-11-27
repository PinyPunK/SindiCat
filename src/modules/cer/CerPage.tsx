import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Calendar, MapPin, Building2, Scissors, Pencil, Trash2 } from 'lucide-react';
import { listColonias } from '../colonias/coloniasService';
import type { Colonia } from '../colonias/types';
import { listGatos } from '../censo/censoService';
import type { Gato } from '../censo/types';
import {
  createActuacionCer,
  listActuacionesCer,
  softDeleteActuacionCer,
  updateActuacionCer,
} from './cerService';
import { CerFormModal } from './CerFormModal';
import {
  ESTADO_CER_LABELS,
  type ActuacionCer,
  type ActuacionCerInput,
  type EstadoActuacionCer,
} from './types';

const ESTADOS_LISTA = Object.keys(ESTADO_CER_LABELS) as EstadoActuacionCer[];

export function CerPage() {
  const [actuaciones, setActuaciones] = useState<ActuacionCer[]>([]);
  const [gatos, setGatos] = useState<Gato[]>([]);
  const [colonias, setColonias] = useState<Colonia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<'todos' | EstadoActuacionCer>('todos');
  const [coloniaFiltro, setColoniaFiltro] = useState('todas');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ActuacionCer | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cerData, gatosData, coloniasData] = await Promise.all([
        listActuacionesCer(),
        listGatos(),
        listColonias(),
      ]);
      setActuaciones(cerData);
      setGatos(gatosData);
      setColonias(coloniasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el control CER.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return actuaciones.filter((item) => {
      if (estadoFiltro !== 'todos' && item.estado !== estadoFiltro) return false;
      if (coloniaFiltro !== 'todas' && (item.colonia_id ?? '') !== coloniaFiltro) return false;
      if (!q) return true;
      return (
        (item.gato_nombre ?? '').toLowerCase().includes(q) ||
        (item.gato_codigo ?? '').toLowerCase().includes(q) ||
        (item.clinica_veterinaria ?? '').toLowerCase().includes(q) ||
        (item.observaciones ?? '').toLowerCase().includes(q)
      );
    });
  }, [actuaciones, search, estadoFiltro, coloniaFiltro]);

  const handleSave = async (input: ActuacionCerInput) => {
    if (editingItem) {
      await updateActuacionCer(editingItem.id, input);
    } else {
      await createActuacionCer(input);
    }
    await loadData();
  };

  const handleSoftDelete = async (item: ActuacionCer) => {
    const confirmed = window.confirm(
      `¿Enviar la actuación "${ESTADO_CER_LABELS[item.estado]}" de ${item.gato_nombre} a la papelera?`
    );
    if (!confirmed) return;

    try {
      await softDeleteActuacionCer(item.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar a la papelera.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-sindicat-ink">Control CER avanzado</h2>
          <p className="text-sm text-sindicat-ink/70">
            Registro cronológico de capturas, traslados, esterilizaciones, marcaje y retornos.
          </p>
        </div>
        <button
          type="button"
          disabled={gatos.length === 0}
          onClick={() => {
            setEditingItem(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-sindicat-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nueva actuación CER
        </button>
      </div>

      {gatos.length === 0 && !loading && (
        <div className="rounded-xl bg-sindicat-warning/15 border border-sindicat-warning/40 px-4 py-3 text-sm text-sindicat-ink">
          Registra al menos un gato en <strong>Censo felino</strong> para poder añadir actuaciones CER.
        </div>
      )}

      {/* Buscador y filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="h-4 w-4 text-sindicat-ink/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por gato, código o clínica..."
            className="w-full rounded-xl border border-sindicat-primary-light bg-sindicat-surface pl-10 pr-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
          />
        </div>

        <select
          aria-label="Filtrar por fase CER"
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value as 'todos' | EstadoActuacionCer)}
          className="rounded-xl border border-sindicat-primary-light bg-sindicat-surface px-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
        >
          <option value="todos">Todas las fases CER</option>
          {ESTADOS_LISTA.map((key) => (
            <option key={key} value={key}>
              {ESTADO_CER_LABELS[key]}
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
          Cargando actuaciones CER...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-sindicat-surface p-8 border border-sindicat-primary-light text-center">
          <p className="text-sm font-medium text-sindicat-ink">
            {actuaciones.length === 0
              ? 'Todavía no hay actuaciones CER registradas.'
              : 'No se encontraron actuaciones con los filtros actuales.'}
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
                  <span className="rounded-full bg-sindicat-primary-light px-2.5 py-0.5 text-xs font-semibold text-sindicat-primary">
                    {ESTADO_CER_LABELS[item.estado]}
                  </span>
                  <span className="text-xs font-bold text-sindicat-ink/70">
                    {item.gato_codigo}
                  </span>
                  <h3 className="text-sm font-bold text-sindicat-ink">
                    {item.gato_nombre}
                  </h3>
                  {item.marcaje_realizado && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sindicat-bg px-2 py-0.5 text-[11px] font-semibold text-sindicat-primary">
                      <Scissors className="h-3 w-3" /> Marcaje
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sindicat-ink/70">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-sindicat-primary" />
                    {new Date(item.fecha_actuacion).toLocaleDateString('es-ES')}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-sindicat-primary" />
                    {item.colonia_nombre}
                  </span>
                  {item.clinica_veterinaria && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-sindicat-primary" />
                      {item.clinica_veterinaria}
                    </span>
                  )}
                </div>

                {(item.resultado_intervencion || item.observaciones) && (
                  <p className="text-xs text-sindicat-ink/80">
                    {item.resultado_intervencion || item.observaciones}
                  </p>
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
                  aria-label={`Enviar actuación de ${item.gato_nombre} a papelera`}
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
        <CerFormModal
          initialData={editingItem}
          gatos={gatos}
          colonias={colonias}
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