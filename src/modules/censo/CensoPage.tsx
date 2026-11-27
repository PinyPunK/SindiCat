import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, MapPin, ShieldCheck, Eye, Pencil, Trash2 } from 'lucide-react';
import { listColonias } from '../colonias/coloniasService';
import type { Colonia } from '../colonias/types';
import { createGato, listGatos, softDeleteGato, updateGato } from './censoService';
import { GatoFormModal } from './GatoFormModal';
import { GatoDetailModal } from './GatoDetailModal';
import type { EstadoActualGato, Gato, GatoInput } from './types';

const ESTADO_ACTUAL_LABEL: Record<string, string> = {
  en_colonia: 'En colonia',
  acogida: 'Acogida',
  adoptado: 'Adoptado',
  fallecido: 'Fallecido',
  desaparecido: 'Desaparecido',
  trasladado: 'Trasladado',
};

export function CensoPage() {
  const [gatos, setGatos] = useState<Gato[]>([]);
  const [colonias, setColonias] = useState<Colonia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [coloniaFiltro, setColoniaFiltro] = useState('todas');
  const [estadoFiltro, setEstadoFiltro] = useState<'todos' | EstadoActualGato>('todos');

  const [formOpen, setFormOpen] = useState(false);
  const [editingGato, setEditingGato] = useState<Gato | null>(null);
  const [detailGato, setDetailGato] = useState<Gato | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [gatosData, coloniasData] = await Promise.all([listGatos(), listColonias()]);
      setGatos(gatosData);
      setColonias(coloniasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el censo felino.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return gatos.filter((g) => {
      if (coloniaFiltro !== 'todas' && (g.colonia_actual_id ?? '') !== coloniaFiltro) return false;
      if (estadoFiltro !== 'todos' && g.estado_actual !== estadoFiltro) return false;
      if (!q) return true;
      return (
        g.nombre.toLowerCase().includes(q) ||
        g.codigo.toLowerCase().includes(q) ||
        (g.color ?? '').toLowerCase().includes(q) ||
        (g.microchip ?? '').toLowerCase().includes(q)
      );
    });
  }, [gatos, search, coloniaFiltro, estadoFiltro]);

  const handleSave = async (input: GatoInput) => {
    if (editingGato) {
      await updateGato(editingGato.id, editingGato.colonia_actual_id, input);
    } else {
      await createGato(input);
    }
    await loadData();
  };

  const handleSoftDelete = async (gato: Gato) => {
    const confirmed = window.confirm(
      `¿Enviar a "${gato.nombre}" (${gato.codigo}) a la papelera? Su historial CER y veterinario se conservará intacto.`
    );
    if (!confirmed) return;

    try {
      await softDeleteGato(gato.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar a la papelera.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-sindicat-ink">Censo felino</h2>
          <p className="text-sm text-sindicat-ink/70">
            Fichas individuales con código inmutable, historial de colonias y estado CER.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingGato(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-sindicat-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nuevo gato
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
            placeholder="Buscar por nombre, código, color o chip..."
            className="w-full rounded-xl border border-sindicat-primary-light bg-sindicat-surface pl-10 pr-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
          />
        </div>

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

        <select
          aria-label="Filtrar por estado actual"
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value as 'todos' | EstadoActualGato)}
          className="rounded-xl border border-sindicat-primary-light bg-sindicat-surface px-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
        >
          <option value="todos">Todos los estados</option>
          <option value="en_colonia">En colonia</option>
          <option value="acogida">En acogida</option>
          <option value="adoptado">Adoptado</option>
          <option value="trasladado">Trasladado</option>
          <option value="desaparecido">Desaparecido</option>
          <option value="fallecido">Fallecido</option>
        </select>
      </div>

      {error && (
        <div role="alert" className="rounded-xl bg-sindicat-danger/10 border border-sindicat-danger/30 px-4 py-3 text-sm text-sindicat-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-sindicat-surface p-6 border border-sindicat-primary-light text-sm text-sindicat-ink/70">
          Cargando censo felino...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-sindicat-surface p-8 border border-sindicat-primary-light text-center">
          <p className="text-sm font-medium text-sindicat-ink">
            {gatos.length === 0
              ? 'Todavía no hay gatos registrados en el censo.'
              : 'No se encontraron gatos con los filtros actuales.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((gato) => (
            <article
              key={gato.id}
              className="rounded-2xl bg-sindicat-surface p-5 border border-sindicat-primary-light shadow-xs flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-sindicat-primary uppercase">
                      {gato.codigo}
                    </span>
                    <h3 className="text-base font-bold text-sindicat-ink mt-0.5">
                      {gato.nombre}
                    </h3>
                  </div>
                  <span className="rounded-full bg-sindicat-primary-light px-2.5 py-0.5 text-xs font-semibold text-sindicat-primary">
                    {ESTADO_ACTUAL_LABEL[gato.estado_actual] ?? gato.estado_actual}
                  </span>
                </div>

                <p className="mt-2.5 text-sm text-sindicat-ink/75 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-sindicat-primary shrink-0" />
                  <span className="truncate">{gato.colonia_nombre || 'Sin colonia'}</span>
                </p>

                <p className="mt-1.5 text-xs text-sindicat-ink/70 flex items-center gap-1.5 capitalize">
                  <ShieldCheck className="h-4 w-4 text-sindicat-primary shrink-0" />
                  <span>
                    {gato.sexo} · CER: {gato.estado_cer_actual.replaceAll('_', ' ')}
                  </span>
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-sindicat-primary-light">
                <button
                  type="button"
                  onClick={() => setDetailGato(gato)}
                  className="inline-flex items-center gap-1 rounded-lg bg-sindicat-primary-light px-2.5 py-1.5 text-xs font-semibold text-sindicat-primary hover:opacity-90 cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Ficha
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingGato(gato);
                    setFormOpen(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-sindicat-ink/15 px-2.5 py-1.5 text-xs font-semibold text-sindicat-ink hover:bg-sindicat-bg cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => void handleSoftDelete(gato)}
                  aria-label={`Enviar ${gato.nombre} a papelera`}
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
        <GatoFormModal
          initialData={editingGato}
          colonias={colonias}
          onClose={() => {
            setFormOpen(false);
            setEditingGato(null);
          }}
          onSubmit={handleSave}
        />
      )}

      {detailGato && (
        <GatoDetailModal
          gato={detailGato}
          colonias={colonias}
          onClose={() => setDetailGato(null)}
          onEdit={(g) => {
            setDetailGato(null);
            setEditingGato(g);
            setFormOpen(true);
          }}
        />
      )}
    </div>
  );
}