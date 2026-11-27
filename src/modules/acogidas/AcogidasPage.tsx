import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Calendar, User, Phone, Pencil, Trash2 } from 'lucide-react';
import { listGatos } from '../censo/censoService';
import type { Gato } from '../censo/types';
import {
  createAcogidaAdopcion,
  listAcogidasAdopciones,
  softDeleteAcogidaAdopcion,
  updateAcogidaAdopcion,
} from './acogidasService';
import { AcogidaFormModal } from './AcogidaFormModal';
import {
  ESTADO_ACOGIDA_LABELS,
  TIPO_ACOGIDA_LABELS,
  type AcogidaAdopcion,
  type AcogidaAdopcionInput,
  type EstadoAcogidaAdopcion,
  type TipoAcogidaAdopcion,
} from './types';

const TIPOS = Object.keys(TIPO_ACOGIDA_LABELS) as TipoAcogidaAdopcion[];
const ESTADOS = Object.keys(ESTADO_ACOGIDA_LABELS) as EstadoAcogidaAdopcion[];

export function AcogidasPage() {
  const [registros, setRegistros] = useState<AcogidaAdopcion[]>([]);
  const [gatos, setGatos] = useState<Gato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | TipoAcogidaAdopcion>('todos');
  const [estadoFiltro, setEstadoFiltro] = useState<'todos' | EstadoAcogidaAdopcion>('todos');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AcogidaAdopcion | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [acogData, gatosData] = await Promise.all([
        listAcogidasAdopciones(),
        listGatos(),
      ]);
      setRegistros(acogData);
      setGatos(gatosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las acogidas y adopciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return registros.filter((item) => {
      if (tipoFiltro !== 'todos' && item.tipo !== tipoFiltro) return false;
      if (estadoFiltro !== 'todos' && item.estado !== estadoFiltro) return false;
      if (!q) return true;
      return (
        (item.gato_nombre ?? '').toLowerCase().includes(q) ||
        (item.gato_codigo ?? '').toLowerCase().includes(q) ||
        item.persona_destino.toLowerCase().includes(q) ||
        (item.seguimiento ?? '').toLowerCase().includes(q)
      );
    });
  }, [registros, search, tipoFiltro, estadoFiltro]);

  const handleSave = async (input: AcogidaAdopcionInput) => {
    if (editingItem) {
      await updateAcogidaAdopcion(editingItem.id, input);
    } else {
      await createAcogidaAdopcion(input);
    }
    await loadData();
  };

  const handleSoftDelete = async (item: AcogidaAdopcion) => {
    const confirmed = window.confirm(
      `¿Enviar el registro de ${TIPO_ACOGIDA_LABELS[item.tipo].toLowerCase()} de ${item.gato_nombre} a la papelera?`
    );
    if (!confirmed) return;

    try {
      await softDeleteAcogidaAdopcion(item.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar a la papelera.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-sindicat-ink">Acogidas y adopciones</h2>
          <p className="text-sm text-sindicat-ink/70">
            Control de casas de acogida, adopciones definitivas y seguimiento posterior.
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
          Nuevo registro
        </button>
      </div>

      {gatos.length === 0 && !loading && (
        <div className="rounded-xl bg-sindicat-warning/15 border border-sindicat-warning/40 px-4 py-3 text-sm text-sindicat-ink">
          Registra al menos un gato en <strong>Censo felino</strong> para poder añadir acogidas o adopciones.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="h-4 w-4 text-sindicat-ink/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por gato, código o familia..."
            className="w-full rounded-xl border border-sindicat-primary-light bg-sindicat-surface pl-10 pr-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
          />
        </div>

        <select
          aria-label="Filtrar por tipo de acogida"
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value as 'todos' | TipoAcogidaAdopcion)}
          className="rounded-xl border border-sindicat-primary-light bg-sindicat-surface px-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
        >
          <option value="todos">Todos los tipos</option>
          {TIPOS.map((key) => (
            <option key={key} value={key}>
              {TIPO_ACOGIDA_LABELS[key]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filtrar por estado de acogida"
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value as 'todos' | EstadoAcogidaAdopcion)}
          className="rounded-xl border border-sindicat-primary-light bg-sindicat-surface px-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
        >
          <option value="todos">Todos los estados</option>
          {ESTADOS.map((key) => (
            <option key={key} value={key}>
              {ESTADO_ACOGIDA_LABELS[key]}
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
          Cargando acogidas y adopciones...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-sindicat-surface p-8 border border-sindicat-primary-light text-center">
          <p className="text-sm font-medium text-sindicat-ink">
            {registros.length === 0
              ? 'Todavía no hay acogidas ni adopciones registradas.'
              : 'No se encontraron registros con los filtros actuales.'}
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
                    {TIPO_ACOGIDA_LABELS[item.tipo]}
                  </span>
                  <span className="rounded-full bg-sindicat-bg px-2.5 py-0.5 text-xs font-medium text-sindicat-ink">
                    {ESTADO_ACOGIDA_LABELS[item.estado]}
                  </span>
                  <span className="text-xs font-bold text-sindicat-ink/70">
                    {item.gato_codigo}
                  </span>
                  <h3 className="text-sm font-bold text-sindicat-ink">
                    {item.gato_nombre}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sindicat-ink/70">
                  <span className="inline-flex items-center gap-1 font-medium text-sindicat-ink">
                    <User className="h-3.5 w-3.5 text-sindicat-primary" />
                    {item.persona_destino}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-sindicat-primary" />
                    {new Date(item.fecha_inicio).toLocaleDateString('es-ES')}
                    {item.fecha_fin
                      ? ` → ${new Date(item.fecha_fin).toLocaleDateString('es-ES')}`
                      : ''}
                  </span>
                  {item.telefono_contacto && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-sindicat-primary" />
                      {item.telefono_contacto}
                    </span>
                  )}
                </div>

                {item.seguimiento && (
                  <p className="text-xs text-sindicat-ink/80">{item.seguimiento}</p>
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
                  aria-label={`Enviar registro de ${item.gato_nombre} a papelera`}
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
        <AcogidaFormModal
          initialData={editingItem}
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