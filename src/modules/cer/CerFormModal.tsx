import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Colonia } from '../colonias/types';
import type { Gato } from '../censo/types';
import {
  ESTADO_CER_LABELS,
  type ActuacionCer,
  type ActuacionCerInput,
  type EstadoActuacionCer,
} from './types';

interface CerFormModalProps {
  initialData?: ActuacionCer | null;
  gatos: Gato[];
  colonias: Colonia[];
  onClose: () => void;
  onSubmit: (input: ActuacionCerInput) => Promise<void>;
}

const ESTADOS_ORDENADOS = Object.keys(ESTADO_CER_LABELS) as EstadoActuacionCer[];

export function CerFormModal({
  initialData,
  gatos,
  colonias,
  onClose,
  onSubmit,
}: CerFormModalProps) {
  const [gatoId, setGatoId] = useState(initialData?.gato_id ?? (gatos[0]?.id ?? ''));
  const [coloniaId, setColoniaId] = useState(
    initialData?.colonia_id ?? (gatos[0]?.colonia_actual_id ?? '')
  );
  const [estado, setEstado] = useState<EstadoActuacionCer>(
    initialData?.estado ?? 'captura_programada'
  );
  const [fechaActuacion, setFechaActuacion] = useState(
    initialData?.fecha_actuacion
      ? initialData.fecha_actuacion.slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [clinica, setClinica] = useState(initialData?.clinica_veterinaria ?? '');
  const [resultado, setResultado] = useState(initialData?.resultado_intervencion ?? '');
  const [marcajeRealizado, setMarcajeRealizado] = useState(
    initialData?.marcaje_realizado ?? false
  );
  const [observaciones, setObservaciones] = useState(initialData?.observaciones ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGatoChange = (nextGatoId: string) => {
    setGatoId(nextGatoId);
    const gato = gatos.find((g) => g.id === nextGatoId);
    if (gato?.colonia_actual_id) {
      setColoniaId(gato.colonia_actual_id);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!gatoId) {
      setError('Debes seleccionar un gato del censo.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        gato_id: gatoId,
        colonia_id: coloniaId || null,
        estado,
        fecha_actuacion: new Date(fechaActuacion).toISOString(),
        clinica_veterinaria: clinica.trim() || null,
        resultado_intervencion: resultado.trim() || null,
        marcaje_realizado: marcajeRealizado,
        observaciones: observaciones.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la actuación CER.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-sindicat-surface border border-sindicat-primary-light shadow-lg my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-sindicat-primary-light">
          <div>
            <h3 className="text-lg font-bold text-sindicat-primary">
              {initialData ? 'Editar actuación CER' : 'Nueva actuación CER'}
            </h3>
            <p className="text-xs text-sindicat-ink/60">
              Al guardar, se actualizará el estado CER actual en la ficha del gato.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario"
            className="p-1.5 rounded-lg text-sindicat-ink/70 hover:bg-sindicat-primary-light cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cer-gato" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Gato *
              </label>
              <select
                id="cer-gato"
                required
                value={gatoId}
                onChange={(e) => handleGatoChange(e.target.value)}
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              >
                <option value="">Selecciona un gato</option>
                {gatos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.codigo} · {g.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cer-colonia" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Colonia asociada
              </label>
              <select
                id="cer-colonia"
                value={coloniaId}
                onChange={(e) => setColoniaId(e.target.value)}
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              >
                <option value="">Sin colonia</option>
                {colonias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.codigo} · {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cer-estado" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Fase / estado CER *
              </label>
              <select
                id="cer-estado"
                required
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoActuacionCer)}
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              >
                {ESTADOS_ORDENADOS.map((key) => (
                  <option key={key} value={key}>
                    {ESTADO_CER_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cer-fecha" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Fecha y hora *
              </label>
              <input
                id="cer-fecha"
                type="datetime-local"
                required
                value={fechaActuacion}
                onChange={(e) => setFechaActuacion(e.target.value)}
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cer-clinica" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Clínica veterinaria
              </label>
              <input
                id="cer-clinica"
                value={clinica}
                onChange={(e) => setClinica(e.target.value)}
                placeholder="Nombre de la clínica colaboradora"
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="cer-resultado" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Resultado de la intervención
              </label>
              <input
                id="cer-resultado"
                value={resultado}
                onChange={(e) => setResultado(e.target.value)}
                placeholder="Ej. Esterilización sin complicaciones"
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl bg-sindicat-bg/70 p-3.5 border border-sindicat-primary-light">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-sindicat-ink cursor-pointer">
              <input
                type="checkbox"
                checked={marcajeRealizado}
                onChange={(e) => setMarcajeRealizado(e.target.checked)}
                className="h-4 w-4 accent-sindicat-primary"
              />
              Marcaje auricular realizado en esta actuación
            </label>
          </div>

          <div>
            <label htmlFor="cer-obs" className="block text-xs font-semibold text-sindicat-ink mb-1">
              Observaciones
            </label>
            <textarea
              id="cer-obs"
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas sobre captura, postoperatorio, medicación o retorno..."
              className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
            />
          </div>

          {error && (
            <div role="alert" className="rounded-xl bg-sindicat-danger/10 border border-sindicat-danger/30 px-3.5 py-2.5 text-sm text-sindicat-danger">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-sindicat-ink/20 px-4 py-2 text-sm font-medium text-sindicat-ink hover:bg-sindicat-bg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-sindicat-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Guardando...' : initialData ? 'Guardar cambios' : 'Registrar actuación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}