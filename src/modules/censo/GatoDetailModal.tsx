import { useEffect, useState } from 'react';
import { X, MapPin, ShieldCheck, Stethoscope, History, Scissors, Paperclip } from 'lucide-react';
import { getGatoHistorial } from './censoService';
import { AdjuntosPanel } from '../adjuntos/AdjuntosPanel';
import type { Colonia } from '../colonias/types';
import type { Gato, GatoHistorialCompleto } from './types';

interface GatoDetailModalProps {
  gato: Gato;
  colonias: Colonia[];
  onClose: () => void;
  onEdit: (gato: Gato) => void;
}

const ESTADO_ACTUAL_LABEL: Record<string, string> = {
  en_colonia: 'En colonia',
  acogida: 'En acogida',
  adoptado: 'Adoptado',
  fallecido: 'Fallecido',
  desaparecido: 'Desaparecido',
  trasladado: 'Trasladado',
};

const ESTADO_CER_LABEL: Record<string, string> = {
  pendiente: 'CER pendiente',
  captura_programada: 'Captura programada',
  capturado: 'Capturado',
  en_clinica: 'En clínica',
  esterilizado: 'Esterilizado',
  en_recuperacion: 'En recuperación',
  retornado: 'Retornado',
  no_aplica: 'No aplica',
};

export function GatoDetailModal({ gato, colonias, onClose, onEdit }: GatoDetailModalProps) {
  const [historial, setHistorial] = useState<GatoHistorialCompleto | null>(null);
  const [tab, setTab] = useState<'colonias' | 'cer' | 'vet' | 'adjuntos'>('colonias');

  const coloniaNombreById = (id: string | null) => {
    if (!id) return 'Sin colonia';
    return colonias.find((c) => c.id === id)?.nombre ?? 'Colonia registrada';
  };

  useEffect(() => {
    let mounted = true;
    getGatoHistorial(gato.id)
      .then((res) => {
        if (mounted) setHistorial(res);
      })
      .catch(() => {
        if (mounted) {
          setHistorial({ cambiosColonia: [], actuacionesCer: [], registrosVet: [] });
        }
      });
    return () => {
      mounted = false;
    };
  }, [gato.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-sindicat-surface border border-sindicat-primary-light shadow-lg my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-sindicat-primary-light">
          <div>
            <span className="text-xs font-bold text-sindicat-primary uppercase">{gato.codigo}</span>
            <h3 className="text-lg font-bold text-sindicat-ink">{gato.nombre}</h3>
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
            <span className="rounded-full bg-sindicat-primary-light px-3 py-1 text-xs font-semibold text-sindicat-primary">
              {ESTADO_ACTUAL_LABEL[gato.estado_actual] ?? gato.estado_actual}
            </span>
            <span className="rounded-full bg-sindicat-bg px-3 py-1 text-xs font-semibold text-sindicat-ink">
              {ESTADO_CER_LABEL[gato.estado_cer_actual] ?? gato.estado_cer_actual}
            </span>
            <span className="rounded-full bg-sindicat-bg px-3 py-1 text-xs capitalize text-sindicat-ink/80">
              Sexo: {gato.sexo}
            </span>
            {gato.marcaje_auricular && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sindicat-primary-light px-3 py-1 text-xs font-semibold text-sindicat-primary">
                <Scissors className="h-3 w-3" />
                Marcaje auricular
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-sindicat-bg/60 p-3.5 space-y-1">
              <p className="text-xs font-semibold text-sindicat-primary flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Ubicación e identificación
              </p>
              <p><strong>Colonia:</strong> {gato.colonia_nombre || 'Sin colonia'}</p>
              <p><strong>Microchip:</strong> {gato.microchip || 'No registrado'}</p>
              <p>
                <strong>Primera observación:</strong>{' '}
                {new Date(gato.fecha_primera_observacion).toLocaleDateString('es-ES')}
              </p>
              {gato.marcaje_detalle && (
                <p><strong>Detalle marcaje:</strong> {gato.marcaje_detalle}</p>
              )}
            </div>

            <div className="rounded-xl bg-sindicat-bg/60 p-3.5 space-y-1">
              <p className="text-xs font-semibold text-sindicat-primary">Rasgos físicos</p>
              <p><strong>Color:</strong> {gato.color || 'No especificado'}</p>
              <p><strong>Edad estimada:</strong> {gato.edad_estimada || 'No especificada'}</p>
              {gato.fecha_nacimiento_estimada && (
                <p>
                  <strong>Nacimiento est.:</strong>{' '}
                  {new Date(gato.fecha_nacimiento_estimada).toLocaleDateString('es-ES')}
                </p>
              )}
              {gato.caracteristicas_fisicas && (
                <p><strong>Señas:</strong> {gato.caracteristicas_fisicas}</p>
              )}
            </div>
          </div>

          {gato.observaciones && (
            <div className="rounded-xl border border-sindicat-primary-light p-3.5 text-sm">
              <p className="text-xs font-semibold text-sindicat-primary mb-1">Observaciones</p>
              <p className="text-sindicat-ink/85 whitespace-pre-line">{gato.observaciones}</p>
            </div>
          )}

          {/* Pestañas de historial y adjuntos */}
          <div>
            <div className="flex flex-wrap gap-2 border-b border-sindicat-primary-light pb-2 mb-3">
              <button
                type="button"
                onClick={() => setTab('colonias')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  tab === 'colonias'
                    ? 'bg-sindicat-primary text-white'
                    : 'bg-sindicat-bg text-sindicat-ink/80'
                }`}
              >
                <History className="h-3.5 w-3.5" />
                Colonias ({historial?.cambiosColonia.length ?? 0})
              </button>
              <button
                type="button"
                onClick={() => setTab('cer')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  tab === 'cer'
                    ? 'bg-sindicat-primary text-white'
                    : 'bg-sindicat-bg text-sindicat-ink/80'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Historial CER ({historial?.actuacionesCer.length ?? 0})
              </button>
              <button
                type="button"
                onClick={() => setTab('vet')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  tab === 'vet'
                    ? 'bg-sindicat-primary text-white'
                    : 'bg-sindicat-bg text-sindicat-ink/80'
                }`}
              >
                <Stethoscope className="h-3.5 w-3.5" />
                Veterinario ({historial?.registrosVet.length ?? 0})
              </button>
              <button
                type="button"
                onClick={() => setTab('adjuntos')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  tab === 'adjuntos'
                    ? 'bg-sindicat-primary text-white'
                    : 'bg-sindicat-bg text-sindicat-ink/80'
                }`}
              >
                <Paperclip className="h-3.5 w-3.5" />
                Fotos y docs
              </button>
            </div>

            {tab === 'adjuntos' ? (
              <AdjuntosPanel entidad="gato" registroId={gato.id} />
            ) : !historial ? (
              <p className="text-xs text-sindicat-ink/60">Cargando historial...</p>
            ) : tab === 'colonias' ? (
              historial.cambiosColonia.length === 0 ? (
                <p className="text-xs text-sindicat-ink/60">No hay cambios de colonia registrados.</p>
              ) : (
                <ul className="divide-y divide-sindicat-primary-light rounded-xl border border-sindicat-primary-light">
                  {historial.cambiosColonia.map((c) => (
                    <li key={c.id} className="p-3 text-sm flex justify-between gap-3">
                      <div>
                        <p className="font-medium">
                          {coloniaNombreById(c.colonia_origen_id)} → {coloniaNombreById(c.colonia_destino_id)}
                        </p>
                        {c.motivo && <p className="text-xs text-sindicat-ink/70">{c.motivo}</p>}
                      </div>
                      <span className="text-xs text-sindicat-ink/60 shrink-0">
                        {new Date(c.fecha_cambio).toLocaleDateString('es-ES')}
                      </span>
                    </li>
                  ))}
                </ul>
              )
            ) : tab === 'cer' ? (
              historial.actuacionesCer.length === 0 ? (
                <p className="text-xs text-sindicat-ink/60">Sin actuaciones CER registradas todavía.</p>
              ) : (
                <ul className="divide-y divide-sindicat-primary-light rounded-xl border border-sindicat-primary-light">
                  {historial.actuacionesCer.map((a) => (
                    <li key={a.id} className="p-3 text-sm flex justify-between gap-3">
                      <div>
                        <p className="font-medium capitalize">{a.estado.replaceAll('_', ' ')}</p>
                        {a.observaciones && <p className="text-xs text-sindicat-ink/70">{a.observaciones}</p>}
                      </div>
                      <span className="text-xs text-sindicat-ink/60 shrink-0">
                        {new Date(a.fecha_actuacion).toLocaleDateString('es-ES')}
                      </span>
                    </li>
                  ))}
                </ul>
              )
            ) : historial.registrosVet.length === 0 ? (
              <p className="text-xs text-sindicat-ink/60">Sin registros veterinarios todavía.</p>
            ) : (
              <ul className="divide-y divide-sindicat-primary-light rounded-xl border border-sindicat-primary-light">
                {historial.registrosVet.map((v) => (
                  <li key={v.id} className="p-3 text-sm flex justify-between gap-3">
                    <div>
                      <p className="font-medium capitalize">{v.tipo.replaceAll('_', ' ')}</p>
                      <p className="text-xs text-sindicat-ink/70">{v.diagnostico_o_motivo}</p>
                    </div>
                    <span className="text-xs text-sindicat-ink/60 shrink-0">
                      {new Date(v.fecha).toLocaleDateString('es-ES')}
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
            onClick={() => onEdit(gato)}
            className="rounded-xl bg-sindicat-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-95 cursor-pointer"
          >
            Editar ficha
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