import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Calendar, Building2, Euro, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { listGatos } from '../censo/censoService';
import type { Gato } from '../censo/types';
import {
  createRegistroVeterinario,
  listRegistrosVeterinarios,
  softDeleteRegistroVeterinario,
  updateRegistroVeterinario,
} from './veterinarioService';
import { VeterinarioFormModal } from './VeterinarioFormModal';
import {
  TIPO_VET_LABELS,
  type RegistroVeterinario,
  type RegistroVeterinarioInput,
  type TipoRegistroVeterinario,
} from './types';

const TIPOS_LISTA = Object.keys(TIPO_VET_LABELS) as TipoRegistroVeterinario[];

export function VeterinarioPage() {
  const [registros, setRegistros] = useState<RegistroVeterinario[]>([]);
  const [gatos, setGatos] = useState<Gato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | TipoRegistroVeterinario>('todos');
  const [soloSeguimiento, setSoloSeguimiento] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RegistroVeterinario | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [vetData, gatosData] = await Promise.all([
        listRegistrosVeterinarios(),
        listGatos(),
      ]);
      setRegistros(vetData);
      setGatos(gatosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el historial veterinario.');
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
      if (soloSeguimiento && !item.requiere_seguimiento) return false;
      if (!q) return true;
      return (
        (item.gato_nombre ?? '').toLowerCase().includes(q) ||
        (item.gato_codigo ?? '').toLowerCase().includes(q) ||
        item.diagnostico_o_motivo.toLowerCase().includes(q) ||
        (item.clinica_veterinaria ?? '').toLowerCase().includes(q)
      );
    });
  }, [registros, search, tipoFiltro, soloSeguimiento]);

  const handleSave = async (input: RegistroVeterinarioInput) => {
    if (editingItem) {
      await updateRegistroVeterinario(editingItem.id, input);
    } else {
      await createRegistroVeterinario(input);
    }
    await loadData();
  };

  const handleSoftDelete = async (item: RegistroVeterinario) => {
    const confirmed = window.confirm(
      `¿Enviar el registro veterinario de ${item.gato_nombre} a la papelera?`
    );
    if (!confirmed) return;

    try {
      await softDeleteRegistroVeterinario(item.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar a la papelera.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-sindicat-ink">Historial veterinario</h2>
          <p className="text-sm text-sindicat-ink/70">
            Consultas, vacunas, desparasitaciones, tratamientos y seguimiento clínico.
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
          Registra al menos un gato en <strong>Censo felino</strong> para poder añadir registros veterinarios.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        <div className="relative">
          <Search className="h-4 w-4 text-sindicat-ink/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por gato, código, clínica o motivo..."
            className="w-full rounded-xl border border-sindicat-primary-light bg-sindicat-surface pl-10 pr-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
          />
        </div>

        <select
          aria-label="Filtrar por tipo veterinario"
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value as 'todos' | TipoRegistroVeterinario)}
          className="rounded-xl border border-sindicat-primary-light bg-sindicat-surface px-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
        >
          <option value="todos">Todos los tipos</option>
          {TIPOS_LISTA.map((key) => (
            <option key={key} value={key}>
              {TIPO_VET_LABELS[key]}
            </option>
          ))}
        </select>

        <label className="inline-flex items-center gap-2 rounded-xl border border-sindicat-primary-light bg-sindicat-surface px-3.5 py-2.5 text-sm text-sindicat-ink cursor-pointer">
          <input
            type="checkbox"
            checked={soloSeguimiento}
            onChange={(e) => setSoloSeguimiento(e.target.checked)}
            className="h-4 w-4 accent-sindicat-primary"
          />
          Solo con seguimiento activo
        </label>
      </div>

      {error && (
        <div role="alert" className="rounded-xl bg-sindicat-danger/10 border border-sindicat-danger/30 px-4 py-3 text-sm text-sindicat-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-sindicat-surface p-6 border border-sindicat-primary-light text-sm text-sindicat-ink/70">
          Cargando historial veterinario...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-sindicat-surface p-8 border border-sindicat-primary-light text-center">
          <p className="text-sm font-medium text-sindicat-ink">
            {registros.length === 0
              ? 'Todavía no hay registros veterinarios guardados.'
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
                    {TIPO_VET_LABELS[item.tipo]}
                  </span>
                  <span className="text-xs font-bold text-sindicat-ink/70">
                    {item.gato_codigo}
                  </span>
                  <h3 className="text-sm font-bold text-sindicat-ink">
                    {item.gato_nombre}
                  </h3>
                  {item.requiere_seguimiento && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sindicat-warning/20 px-2.5 py-0.5 text-[11px] font-semibold text-sindicat-warning">
                      <AlertCircle className="h-3 w-3" /> En seguimiento
                    </span>
                  )}
                </div>

                <p className="text-sm font-medium text-sindicat-ink">
                  {item.diagnostico_o_motivo}
                </p>

                {item.tratamiento && (
                  <p className="text-xs text-sindicat-ink/75">
                    <strong>Tratamiento:</strong> {item.tratamiento}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sindicat-ink/70">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-sindicat-primary" />
                    {new Date(item.fecha).toLocaleDateString('es-ES')}
                  </span>
                  {item.clinica_veterinaria && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-sindicat-primary" />
                      {item.clinica_veterinaria}
                    </span>
                  )}
                  {item.coste != null && (
                    <span className="inline-flex items-center gap-1 font-semibold text-sindicat-ink">
                      <Euro className="h-3.5 w-3.5 text-sindicat-primary" />
                      {item.coste.toFixed(2)} €
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
        <VeterinarioFormModal
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