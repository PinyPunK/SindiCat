import { useEffect, useState } from 'react';
import { X, MapPin, Cat, Calendar, Users, Activity } from 'lucide-react';
import { getColoniaHistorial } from './coloniasService';
import type { Colonia, ColoniaHistorialItem } from './types';

interface ColoniaDetailModalProps {
  colonia: Colonia;
  onClose: () => void;
  onEdit: (colonia: Colonia) => void;
}

export function ColoniaDetailModal({ colonia, onClose, onEdit }: ColoniaDetailModalProps) {
  const [historial, setHistorial] = useState<ColoniaHistorialItem[]>([]);
  const [loadingHist, setLoadingHist] = useState(true);

  useEffect(() => {
    let mounted = true;
    getColoniaHistorial(colonia.id)
      .then((items) => {
        if (mounted) setHistorial(items);
      })
      .catch(() => {
        if (mounted) setHistorial([]);
      })
      .finally(() => {
        if (mounted) setLoadingHist(false);
      });
    return () => {
      mounted = false;
    };
  }, [colonia.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-sindicat-surface border border-sindicat-primary-light shadow-lg my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-sindicat-primary-light">
          <div>
            <span className="text-xs font-semibold text-sindicat-primary uppercase">
              {colonia.codigo}
            </span>
            <h3 className="text-lg font-bold text-sindicat-ink">{colonia.nombre}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ficha"
            className="p-1.5 rounded-lg text-sindicat-ink/70 hover:bg-sindicat-primary-light cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                colonia.estado === 'activa'
                  ? 'bg-sindicat-primary-light text-sindicat-primary'
                  : 'bg-sindicat-ink/10 text-sindicat-ink/70'
              }`}
            >
              {colonia.estado === 'activa' ? 'Colonia activa' : 'Colonia inactiva'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sindicat-bg px-3 py-1 text-xs font-semibold text-sindicat-ink">
              <Cat className="h-3.5 w-3.5 text-sindicat-primary" />
              {colonia.total_gatos ?? 0} gatos censados
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sindicat-bg px-3 py-1 text-xs text-sindicat-ink/80">
              <Calendar className="h-3.5 w-3.5 text-sindicat-primary" />
              Alta: {new Date(colonia.fecha_registro).toLocaleDateString('es-ES')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-sindicat-bg/60 p-3.5">
              <p className="text-xs font-semibold text-sindicat-primary flex items-center gap-1.5 mb-1">
                <MapPin className="h-3.5 w-3.5" /> Ubicación
              </p>
              <p className="font-medium text-sindicat-ink">
                {colonia.municipio}
                {colonia.barrio ? ` · ${colonia.barrio}` : ''}
              </p>
              {colonia.direccion && (
                <p className="text-xs text-sindicat-ink/70 mt-1">{colonia.direccion}</p>
              )}
              {colonia.latitud != null && colonia.longitud != null && (
                <p className="text-xs text-sindicat-ink/60 mt-1">
                  GPS: {colonia.latitud}, {colonia.longitud}
                </p>
              )}
            </div>

            <div className="rounded-xl bg-sindicat-bg/60 p-3.5">
              <p className="text-xs font-semibold text-sindicat-primary flex items-center gap-1.5 mb-1">
                <Users className="h-3.5 w-3.5" /> Alimentadores
              </p>
              <p className="text-sindicat-ink/85">
                {colonia.alimentadores || 'Sin alimentadores asignados'}
              </p>
            </div>
          </div>

          {colonia.observaciones && (
            <div className="rounded-xl border border-sindicat-primary-light p-3.5 text-sm">
              <p className="text-xs font-semibold text-sindicat-primary mb-1">Observaciones</p>
              <p className="text-sindicat-ink/85 whitespace-pre-line">{colonia.observaciones}</p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-bold text-sindicat-primary flex items-center gap-1.5 mb-3">
              <Activity className="h-4 w-4" /> Historial de actuaciones
            </h4>
            {loadingHist ? (
              <p className="text-xs text-sindicat-ink/60">Cargando historial...</p>
            ) : historial.length === 0 ? (
              <p className="text-xs text-sindicat-ink/60">
                Todavía no hay actuaciones CER ni incidencias registradas en esta colonia.
              </p>
            ) : (
              <ul className="divide-y divide-sindicat-primary-light rounded-xl border border-sindicat-primary-light">
                {historial.map((item) => (
                  <li key={item.id} className="p-3 flex items-start justify-between gap-3 text-sm">
                    <div>
                      <span className="inline-block text-[11px] font-semibold uppercase text-sindicat-primary mr-2">
                        {item.origen}
                      </span>
                      <span className="font-medium capitalize">{item.titulo}</span>
                      {item.detalle && (
                        <p className="text-xs text-sindicat-ink/70 mt-0.5">{item.detalle}</p>
                      )}
                    </div>
                    <span className="text-xs text-sindicat-ink/60 shrink-0">
                      {new Date(item.fecha).toLocaleDateString('es-ES')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-sindicat-primary-light">
          <button
            type="button"
            onClick={() => onEdit(colonia)}
            className="rounded-xl bg-sindicat-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-95 cursor-pointer"
          >
            Editar colonia
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-sindicat-ink/20 px-4 py-2 text-sm font-medium text-sindicat-ink hover:bg-sindicat-bg cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}