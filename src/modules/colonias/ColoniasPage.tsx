import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, MapPin, Cat, Eye, Pencil, Trash2 } from 'lucide-react';
import {
  createColonia,
  listColonias,
  softDeleteColonia,
  updateColonia,
} from './coloniasService';
import { ColoniaFormModal } from './ColoniaFormModal';
import { ColoniaDetailModal } from './ColoniaDetailModal';
import type { Colonia, ColoniaInput, EstadoColonia } from './types';

export function ColoniasPage() {
  const [colonias, setColonias] = useState<Colonia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<'todas' | EstadoColonia>('todas');

  const [formOpen, setFormOpen] = useState(false);
  const [editingColonia, setEditingColonia] = useState<Colonia | null>(null);
  const [detailColonia, setDetailColonia] = useState<Colonia | null>(null);

  const loadColonias = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listColonias();
      setColonias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las colonias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadColonias();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return colonias.filter((c) => {
      if (estadoFiltro !== 'todas' && c.estado !== estadoFiltro) return false;
      if (!q) return true;
      return (
        c.nombre.toLowerCase().includes(q) ||
        c.codigo.toLowerCase().includes(q) ||
        c.municipio.toLowerCase().includes(q) ||
        (c.barrio ?? '').toLowerCase().includes(q)
      );
    });
  }, [colonias, search, estadoFiltro]);

  const handleSave = async (input: ColoniaInput) => {
    if (editingColonia) {
      await updateColonia(editingColonia.id, input);
    } else {
      await createColonia(input);
    }
    await loadColonias();
  };

  const handleSoftDelete = async (colonia: Colonia) => {
    const confirmed = window.confirm(
      `¿Enviar la colonia "${colonia.nombre}" a la papelera? Podrás recuperarla más adelante.`
    );
    if (!confirmed) return;

    try {
      await softDeleteColonia(colonia.id);
      await loadColonias();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar a la papelera.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-sindicat-ink">Colonias felinas</h2>
          <p className="text-sm text-sindicat-ink/70">
            Control de ubicaciones, alimentadores, estado y censo por colonia.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingColonia(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-sindicat-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nueva colonia
        </button>
      </div>

      {/* Buscador y filtro */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-sindicat-ink/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, código, municipio o barrio..."
            className="w-full rounded-xl border border-sindicat-primary-light bg-sindicat-surface pl-10 pr-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
          />
        </div>
        <select
          aria-label="Filtrar por estado"
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value as 'todas' | EstadoColonia)}
          className="rounded-xl border border-sindicat-primary-light bg-sindicat-surface px-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
        >
          <option value="todas">Todos los estados</option>
          <option value="activa">Activas</option>
          <option value="inactiva">Inactivas</option>
        </select>
      </div>

      {error && (
        <div role="alert" className="rounded-xl bg-sindicat-danger/10 border border-sindicat-danger/30 px-4 py-3 text-sm text-sindicat-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-sindicat-surface p-6 border border-sindicat-primary-light text-sm text-sindicat-ink/70">
          Cargando colonias...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-sindicat-surface p-8 border border-sindicat-primary-light text-center">
          <p className="text-sm font-medium text-sindicat-ink">
            {colonias.length === 0
              ? 'Todavía no tienes ninguna colonia registrada.'
              : 'No se encontraron colonias con los filtros actuales.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((colonia) => (
            <article
              key={colonia.id}
              className="rounded-2xl bg-sindicat-surface p-5 border border-sindicat-primary-light shadow-xs flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-sindicat-primary uppercase">
                      {colonia.codigo}
                    </span>
                    <h3 className="text-base font-bold text-sindicat-ink mt-0.5">
                      {colonia.nombre}
                    </h3>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      colonia.estado === 'activa'
                        ? 'bg-sindicat-primary-light text-sindicat-primary'
                        : 'bg-sindicat-ink/10 text-sindicat-ink/70'
                    }`}
                  >
                    {colonia.estado === 'activa' ? 'Activa' : 'Inactiva'}
                  </span>
                </div>

                <p className="mt-2.5 text-sm text-sindicat-ink/75 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-sindicat-primary shrink-0" />
                  <span className="truncate">
                    {colonia.municipio}
                    {colonia.barrio ? ` · ${colonia.barrio}` : ''}
                  </span>
                </p>

                <p className="mt-1.5 text-sm text-sindicat-ink/80 flex items-center gap-1.5">
                  <Cat className="h-4 w-4 text-sindicat-primary shrink-0" />
                  <span>{colonia.total_gatos ?? 0} gatos registrados</span>
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-sindicat-primary-light">
                <button
                  type="button"
                  onClick={() => setDetailColonia(colonia)}
                  className="inline-flex items-center gap-1 rounded-lg bg-sindicat-primary-light px-2.5 py-1.5 text-xs font-semibold text-sindicat-primary hover:opacity-90 cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Ficha
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingColonia(colonia);
                    setFormOpen(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-sindicat-ink/15 px-2.5 py-1.5 text-xs font-semibold text-sindicat-ink hover:bg-sindicat-bg cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => void handleSoftDelete(colonia)}
                  aria-label={`Enviar ${colonia.nombre} a papelera`}
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
        <ColoniaFormModal
          initialData={editingColonia}
          onClose={() => {
            setFormOpen(false);
            setEditingColonia(null);
          }}
          onSubmit={handleSave}
        />
      )}

      {detailColonia && (
        <ColoniaDetailModal
          colonia={detailColonia}
          onClose={() => setDetailColonia(null)}
          onEdit={(col) => {
            setDetailColonia(null);
            setEditingColonia(col);
            setFormOpen(true);
          }}
        />
      )}
    </div>
  );
}