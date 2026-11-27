import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  Cat,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
} from 'lucide-react';
import { listColonias } from '../colonias/coloniasService';
import type { Colonia } from '../colonias/types';
import { listGatos } from '../censo/censoService';
import type { Gato } from '../censo/types';
import {
  createRecordatorio,
  listRecordatorios,
  softDeleteRecordatorio,
  toggleRecordatorioCompletado,
  updateRecordatorio,
} from './agendaService';
import { AgendaFormModal } from './AgendaFormModal';
import {
  PRIORIDAD_LABELS,
  TIPO_RECORDATORIO_LABELS,
  type PrioridadRecordatorio,
  type Recordatorio,
  type RecordatorioInput,
  type TipoRecordatorio,
} from './types';

const TIPOS = Object.keys(TIPO_RECORDATORIO_LABELS) as TipoRecordatorio[];

const PRIORIDAD_BADGE: Record<PrioridadRecordatorio, string> = {
  alta: 'bg-sindicat-danger/15 text-sindicat-danger',
  media: 'bg-sindicat-warning/20 text-sindicat-warning',
  baja: 'bg-sindicat-ink/10 text-sindicat-ink/70',
};

export function AgendaPage() {
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
  const [colonias, setColonias] = useState<Colonia[]>([]);
  const [gatos, setGatos] = useState<Gato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | TipoRecordatorio>('todos');
  const [estadoFiltro, setEstadoFiltro] = useState<'pendientes' | 'completados' | 'todos'>(
    'pendientes'
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Recordatorio | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [agendaData, coloniasData, gatosData] = await Promise.all([
        listRecordatorios(),
        listColonias(),
        listGatos(),
      ]);
      setRecordatorios(agendaData);
      setColonias(coloniasData);
      setGatos(gatosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la agenda.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return recordatorios.filter((item) => {
      if (estadoFiltro === 'pendientes' && item.completado) return false;
      if (estadoFiltro === 'completados' && !item.completado) return false;
      if (tipoFiltro !== 'todos' && item.tipo !== tipoFiltro) return false;
      if (!q) return true;
      return (
        item.titulo.toLowerCase().includes(q) ||
        (item.notas ?? '').toLowerCase().includes(q) ||
        (item.colonia_nombre ?? '').toLowerCase().includes(q) ||
        (item.gato_nombre ?? '').toLowerCase().includes(q)
      );
    });
  }, [recordatorios, search, tipoFiltro, estadoFiltro]);

  const handleSave = async (input: RecordatorioInput) => {
    if (editingItem) {
      await updateRecordatorio(editingItem.id, input);
    } else {
      await createRecordatorio(input);
    }
    await loadData();
  };

  const handleToggle = async (item: Recordatorio) => {
    try {
      await toggleRecordatorioCompletado(item.id, !item.completado);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el estado.');
    }
  };

  const handleSoftDelete = async (item: Recordatorio) => {
    const confirmed = window.confirm(
      `¿Enviar el recordatorio "${item.titulo}" a la papelera?`
    );
    if (!confirmed) return;

    try {
      await softDeleteRecordatorio(item.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar a la papelera.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-sindicat-ink">Agenda y recordatorios</h2>
          <p className="text-sm text-sindicat-ink/70">
            Avisos de capturas, revisiones veterinarias, medicación y actuaciones pendientes.
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
          Nuevo recordatorio
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
            placeholder="Buscar por título, gato, colonia o nota..."
            className="w-full rounded-xl border border-sindicat-primary-light bg-sindicat-surface pl-10 pr-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
          />
        </div>

        <select
          aria-label="Filtrar por tipo de recordatorio"
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value as 'todos' | TipoRecordatorio)}
          className="rounded-xl border border-sindicat-primary-light bg-sindicat-surface px-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
        >
          <option value="todos">Todos los tipos</option>
          {TIPOS.map((key) => (
            <option key={key} value={key}>
              {TIPO_RECORDATORIO_LABELS[key]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filtrar por estado de recordatorio"
          value={estadoFiltro}
          onChange={(e) =>
            setEstadoFiltro(e.target.value as 'pendientes' | 'completados' | 'todos')
          }
          className="rounded-xl border border-sindicat-primary-light bg-sindicat-surface px-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
        >
          <option value="pendientes">Solo pendientes</option>
          <option value="completados">Completados</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      {error && (
        <div role="alert" className="rounded-xl bg-sindicat-danger/10 border border-sindicat-danger/30 px-4 py-3 text-sm text-sindicat-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-sindicat-surface p-6 border border-sindicat-primary-light text-sm text-sindicat-ink/70">
          Cargando agenda...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-sindicat-surface p-8 border border-sindicat-primary-light text-center">
          <p className="text-sm font-medium text-sindicat-ink">
            {recordatorios.length === 0
              ? 'No tienes recordatorios en tu agenda.'
              : 'No se encontraron recordatorios con los filtros actuales.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const vencido =
              !item.completado && new Date(item.fecha_recordatorio).getTime() < Date.now();
            return (
              <article
                key={item.id}
                className={`rounded-2xl bg-sindicat-surface p-4 sm:p-5 border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  vencido ? 'border-sindicat-danger/40' : 'border-sindicat-primary-light'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => void handleToggle(item)}
                    aria-label={
                      item.completado
                        ? `Marcar ${item.titulo} como pendiente`
                        : `Marcar ${item.titulo} como completado`
                    }
                    className="mt-0.5 text-sindicat-primary hover:opacity-80 cursor-pointer shrink-0"
                  >
                    {item.completado ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5 text-sindicat-ink/40" />
                    )}
                  </button>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-sindicat-primary-light px-2.5 py-0.5 text-xs font-semibold text-sindicat-primary">
                        {TIPO_RECORDATORIO_LABELS[item.tipo]}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${PRIORIDAD_BADGE[item.prioridad]}`}
                      >
                        Prioridad {PRIORIDAD_LABELS[item.prioridad].toLowerCase()}
                      </span>
                      {vencido && (
                        <span className="rounded-full bg-sindicat-danger px-2 py-0.5 text-[11px] font-semibold text-white">
                          Vencido
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-sm font-bold ${
                        item.completado
                          ? 'line-through text-sindicat-ink/50'
                          : 'text-sindicat-ink'
                      }`}
                    >
                      {item.titulo}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sindicat-ink/70">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-sindicat-primary" />
                        {new Date(item.fecha_recordatorio).toLocaleString('es-ES', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                      {item.colonia_id && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-sindicat-primary" />
                          {item.colonia_nombre}
                        </span>
                      )}
                      {item.gato_nombre && (
                        <span className="inline-flex items-center gap-1 font-medium text-sindicat-primary">
                          <Cat className="h-3.5 w-3.5" />
                          {item.gato_codigo} · {item.gato_nombre}
                        </span>
                      )}
                    </div>

                    {item.notas && (
                      <p className="text-xs text-sindicat-ink/80">{item.notas}</p>
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
                    aria-label={`Enviar recordatorio ${item.titulo} a papelera`}
                    className="inline-flex items-center gap-1 rounded-lg border border-sindicat-danger/30 px-2.5 py-1.5 text-xs font-semibold text-sindicat-danger hover:bg-sindicat-danger/10 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {formOpen && (
        <AgendaFormModal
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