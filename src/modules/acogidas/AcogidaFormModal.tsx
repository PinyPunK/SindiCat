import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Gato } from '../censo/types';
import {
  ESTADO_ACOGIDA_LABELS,
  TIPO_ACOGIDA_LABELS,
  type AcogidaAdopcion,
  type AcogidaAdopcionInput,
  type EstadoAcogidaAdopcion,
  type TipoAcogidaAdopcion,
} from './types';

interface AcogidaFormModalProps {
  initialData?: AcogidaAdopcion | null;
  gatos: Gato[];
  onClose: () => void;
  onSubmit: (input: AcogidaAdopcionInput) => Promise<void>;
}

const TIPOS = Object.keys(TIPO_ACOGIDA_LABELS) as TipoAcogidaAdopcion[];
const ESTADOS = Object.keys(ESTADO_ACOGIDA_LABELS) as EstadoAcogidaAdopcion[];

export function AcogidaFormModal({
  initialData,
  gatos,
  onClose,
  onSubmit,
}: AcogidaFormModalProps) {
  const [gatoId, setGatoId] = useState(initialData?.gato_id ?? (gatos[0]?.id ?? ''));
  const [tipo, setTipo] = useState<TipoAcogidaAdopcion>(initialData?.tipo ?? 'acogida');
  const [estado, setEstado] = useState<EstadoAcogidaAdopcion>(initialData?.estado ?? 'activa');
  const [fechaInicio, setFechaInicio] = useState(
    initialData?.fecha_inicio
      ? initialData.fecha_inicio.slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [fechaFin, setFechaFin] = useState(
    initialData?.fecha_fin ? initialData.fecha_fin.slice(0, 10) : ''
  );
  const [personaDestino, setPersonaDestino] = useState(initialData?.persona_destino ?? '');
  const [telefono, setTelefono] = useState(initialData?.telefono_contacto ?? '');
  const [seguimiento, setSeguimiento] = useState(initialData?.seguimiento ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!gatoId) {
      setError('Debes seleccionar un gato del censo.');
      return;
    }
    if (!personaDestino.trim()) {
      setError('Indica los datos de la persona o familia de destino.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        gato_id: gatoId,
        tipo,
        estado,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin || null,
        persona_destino: personaDestino.trim(),
        telefono_contacto: telefono.trim() || null,
        seguimiento: seguimiento.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el registro.');
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
              {initialData ? 'Editar acogida / adopción' : 'Nueva acogida o adopción'}
            </h3>
            <p className="text-xs text-sindicat-ink/60">
              Si el estado es activo, se actualizará automáticamente el estado del gato en el censo.
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="acog-gato" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Gato *
              </label>
              <select
                id="acog-gato"
                required
                value={gatoId}
                onChange={(e) => setGatoId(e.target.value)}
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
              <label htmlFor="acog-tipo" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Tipo *
              </label>
              <select
                id="acog-tipo"
                required
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoAcogidaAdopcion)}
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              >
                {TIPOS.map((key) => (
                  <option key={key} value={key}>
                    {TIPO_ACOGIDA_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="acog-estado" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Estado *
              </label>
              <select
                id="acog-estado"
                required
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoAcogidaAdopcion)}
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              >
                {ESTADOS.map((key) => (
                  <option key={key} value={key}>
                    {ESTADO_ACOGIDA_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="acog-inicio" className="block text-xs font-semibold text-sindicat-ink mb-1">
                {tipo === 'adopcion' ? 'Fecha de adopción *' : 'Fecha de entrada *'}
              </label>
              <input
                id="acog-inicio"
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="acog-fin" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Fecha de salida (opcional)
              </label>
              <input
                id="acog-fin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="acog-persona" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Persona o familia de destino *
              </label>
              <input
                id="acog-persona"
                required
                value={personaDestino}
                onChange={(e) => setPersonaDestino(e.target.value)}
                placeholder="Nombre completo o casa de acogida"
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="acog-tel" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Teléfono / contacto
              </label>
              <input
                id="acog-tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Teléfono o correo de contacto"
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="acog-seguimiento" className="block text-xs font-semibold text-sindicat-ink mb-1">
              Seguimiento posterior y notas
            </label>
            <textarea
              id="acog-seguimiento"
              rows={3}
              value={seguimiento}
              onChange={(e) => setSeguimiento(e.target.value)}
              placeholder="Adaptación, contrato firmado, revisiones, fotos recibidas..."
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
              {saving ? 'Guardando...' : initialData ? 'Guardar cambios' : 'Guardar registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}