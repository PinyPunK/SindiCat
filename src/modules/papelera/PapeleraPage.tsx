import { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Trash2, Search, AlertTriangle } from 'lucide-react';
import {
  eliminarDefinitivamente,
  listPapelera,
  restaurarRegistro,
} from './papeleraService';
import { TABLA_LABELS, type ItemPapelera, type TablaPapelera } from './types';

const TABLAS = Object.keys(TABLA_LABELS) as TablaPapelera[];

export function PapeleraPage() {
  const [items, setItems] = useState<ItemPapelera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tablaFiltro, setTablaFiltro] = useState<'todas' | TablaPapelera>('todas');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPapelera();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la papelera.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (tablaFiltro !== 'todas' && item.tabla !== tablaFiltro) return false;
      if (!q) return true;
      return (
        item.titulo.toLowerCase().includes(q) ||
        item.detalle.toLowerCase().includes(q) ||
        item.entidadLabel.toLowerCase().includes(q)
      );
    });
  }, [items, search, tablaFiltro]);

  const handleRestore = async (item: ItemPapelera) => {
    try {
      setError(null);
      await restaurarRegistro(item.tabla, item.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo restaurar el registro.');
    }
  };

  const handlePermanentDelete = async (item: ItemPapelera) => {
    const respuesta = window.prompt(
      `Borrado definitivo e irreversible de "${item.titulo}" (${item.entidadLabel}).\nEscribe ELIMINAR para confirmar:`
    );
    if (respuesta !== 'ELIMINAR') return;

    try {
      setError(null);
      await eliminarDefinitivamente(item.tabla, item.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar definitivamente.');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-sindicat-ink">Papelera de reciclaje</h2>
        <p className="text-sm text-sindicat-ink/70">
          Recupera registros eliminados o ejecuta un borrado definitivo controlado.
        </p>
      </div>

      <div
        role="note"
        className="rounded-2xl bg-sindicat-warning/15 border border-sindicat-warning/40 p-4 flex items-start gap-3 text-sm text-sindicat-ink"
      >
        <AlertTriangle className="h-5 w-5 text-sindicat-warning shrink-0 mt-0.5" />
        <p>
          Los registros en papelera no se muestran en los listados activos, pero conservan sus
          relaciones históricas. El borrado definitivo es <strong>irreversible</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="h-4 w-4 text-sindicat-ink/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en la papelera..."
            className="w-full rounded-xl border border-sindicat-primary-light bg-sindicat-surface pl-10 pr-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
          />
        </div>

        <select
          aria-label="Filtrar papelera por entidad"
          value={tablaFiltro}
          onChange={(e) => setTablaFiltro(e.target.value as 'todas' | TablaPapelera)}
          className="rounded-xl border border-sindicat-primary-light bg-sindicat-surface px-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none"
        >
          <option value="todas">Todas las entidades</option>
          {TABLAS.map((key) => (
            <option key={key} value={key}>
              {TABLA_LABELS[key]}
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
          Cargando papelera...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-sindicat-surface p-8 border border-sindicat-primary-light text-center">
          <p className="text-sm font-medium text-sindicat-ink">
            {items.length === 0
              ? 'La papelera está vacía.'
              : 'No hay registros en papelera con los filtros actuales.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <article
              key={`${item.tabla}-${item.id}`}
              className="rounded-2xl bg-sindicat-surface p-4 sm:p-5 border border-sindicat-primary-light shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-sindicat-bg px-2.5 py-0.5 text-xs font-semibold text-sindicat-primary">
                    {item.entidadLabel}
                  </span>
                  <span className="text-xs text-sindicat-ink/60">
                    Eliminado el {new Date(item.deleted_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-sindicat-ink">{item.titulo}</h3>
                <p className="text-xs text-sindicat-ink/75 truncate">{item.detalle}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => void handleRestore(item)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-sindicat-primary-light px-3 py-1.5 text-xs font-semibold text-sindicat-primary hover:opacity-90 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restaurar
                </button>
                <button
                  type="button"
                  onClick={() => void handlePermanentDelete(item)}
                  aria-label={`Eliminar definitivamente ${item.titulo}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-sindicat-danger/40 px-3 py-1.5 text-xs font-semibold text-sindicat-danger hover:bg-sindicat-danger/10 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Borrar definitivamente
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}