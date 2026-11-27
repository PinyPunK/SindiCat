import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  User,
  Droplets,
  Sparkles,
  Scale,
  Pencil,
  Trash2,
} from 'lucide-react';
import { listColonias } from '../colonias/coloniasService';
import type { Colonia } from '../colonias/types';
import {
  createRegistroAlimentacion,
  listRegistrosAlimentacion,
  softDeleteRegistroAlimentacion,
  updateRegistroAlimentacion,
} from './alimentacionService';
import { AlimentacionFormModal } from './AlimentacionFormModal';
import {
  TIPO_ALIMENTACION_LABELS,
  type RegistroAlimentacion,
  type RegistroAlimentacionInput,
  type TipoAlimentacion,
} from './types';

const TIPOS_LISTA = Object.keys(TIPO_ALIMENTACION_LABELS) as TipoAlimentacion[];

export function AlimentacionPage() {
  const [registros, setRegistros] = useState<RegistroAlimentacion[]>([]);
  const [colonias, setColonias] = useState<Colonia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | TipoAlimentacion>('todos');
  const [coloniaFiltro, setColoniaFiltro] = useState('todas');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RegistroAlimentacion | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [alimData, coloniasData] = await Promise.all([
        listRegistrosAlimentacion(),
        listColonias(),
      ]);
      setRegistros(alimData);
      setColonias(coloniasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los registros de alimentación.');
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
      if (coloniaFiltro !== 'todas' && (item.colonia_id ?? '') !== coloniaFiltro) return false;
      if (!q) return true;
      return (
        (item.colonia_nombre ?? '').toLowerCase().includes(q) ||
        (item.responsable ?? '').toLowerCase().includes(q) ||
        (item.estado_comederos ?? '').toLowerCase().includes(q) ||
        (item.materiales_existencias ?? '').toLowerCase().includes(q) ||
        (item.observaciones ?? '').toLowerCase().includes(q)
      );
    });
  }, [registros, search, tipoFiltro, coloniaFiltro]);

  const handleSave = async (input: RegistroAlimentacionInput) => {
    if (editingItem) {
      await updateRegistroAlimentacion(editingItem.id, input);
    } else {
      await createRegistroAlimentacion(input);
    }
    await loadData();
  };

  const handleSoftDelete = async (item: RegistroAlimentacion) => {
    const confirmed = window.confirm(
      `¿Enviar el registro de "${TIPO_ALIMENTACION_LABELS[item.tipo]}" (${item.colonia_nombre}) a la papelera?`
    );
    if (!confirmed) return;

    try {
      await softDeleteRegistroAlimentacion(item.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar a la papelera.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-sindicat-ink">Alimentación y mantenimiento</h2>
          <p className="text-sm text-sindicat-ink/70">
            Control de pienso, reposición de agua, limpieza, comederos y existencias.
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
          Nuevo registro
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
            placeholder="Buscar por colonia, responsable o material..."
            className="w-full rounded-xl border border-sindicat-primary-light bg-sindicat-surface pl-10 pr-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
          />
        </div>

        <select
          aria-label="Filtrar por tipo de alimentación"
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value as 'todos' | TipoAlimentacion)}
          className="rounded-xl border border-sindicat-primary-light bg-sindicat-surface px-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
        >
          <option value="todos">Todos los tipos</option>
          {TIPOS_LISTA.map((key) => (
            <option key={key} value={key}>
              {TIPO_ALIMENTACION_LABELS[key]}
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
          Cargando registros de alimentación y mantenimiento...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-sindicat-surface p-8 border border-sindicat-primary-light text-center">
          <p className="text-sm font-medium text-sindicat-ink">
            {registros.length === 0
              ? 'Todavía no hay registros de alimentación o mantenimiento.'
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
                    {TIPO_ALIMENTACION_LABELS[item.tipo]}
                  </span>
                  <h3 className="text-sm font-bold text-sindicat-ink">
                    {item.colonia_nombre}
                  </h3>
                  {item.agua_repuesta && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sindicat-bg px-2 py-0.5 text-[11px] font-medium text-sindicat-ink">
                      <Droplets className="h-3 w-3 text-sindicat-primary" /> Agua
                    </span>
                  )}
                  {item.limpieza_realizada && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sindicat-bg px-2 py-0.5 text-[11px] font-medium text-sindicat-ink">
                      <Sparkles className="h-3 w-3 text-sindicat-primary" /> Limpieza
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sindicat-ink/70">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-sindicat-primary" />
                    {new Date(item.fecha).toLocaleDateString('es-ES')}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-sindicat-primary" />
                    {item.colonia_nombre}
                  </span>
                  {item.consumo_pienso_kg != null && (
                    <span className="inline-flex items-center gap-1 font-semibold text-sindicat-ink">
                      <Scale className="h-3.5 w-3.5 text-sindicat-primary" />
                      {item.consumo_pienso_kg} kg pienso
                    </span>
                  )}
                  {item.responsable && (
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-sindicat-primary" />
                      {item.responsable}
                    </span>
                  )}
                </div>

                {item.estado_comederos && (
                  <p className="text-xs text-sindicat-ink/80">
                    <strong>Comederos:</strong> {item.estado_comederos}
                  </p>
                )}
                {item.materiales_existencias && (
                  <p className="text-xs text-sindicat-ink/80">
                    <strong>Materiales / stock:</strong> {item.materiales_existencias}
                  </p>
                )}
                {item.observaciones && (
                  <p className="text-xs text-sindicat-ink/75">{item.observaciones}</p>
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
                  aria-label={`Enviar registro de ${TIPO_ALIMENTACION_LABELS[item.tipo]} a papelera`}
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
        <AlimentacionFormModal
          initialData={editingItem}
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