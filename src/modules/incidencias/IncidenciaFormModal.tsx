import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Colonia } from '../colonias/types';
import type { Gato } from '../censo/types';
import {
  ESTADO_INCIDENCIA_LABELS,
  TIPO_INCIDENCIA_LABELS,
  type EstadoIncidencia,
  type Incidencia,
  type IncidenciaInput,
  type TipoIncidencia,
} from './types';

interface IncidenciaFormModalProps {
  initialData?: Incidencia | null;
  colonias: Colonia[];
  gatos: Gato[];
  onClose: () => void;
  onSubmit: (input: IncidenciaInput) => Promise<void>;
}

const TIPOS_ORDENADOS = Object.keys(TIPO_INCIDENCIA_LABELS) as TipoIncidencia[];
const ESTADOS_ORDENADOS = Object.keys(ESTADO_INCIDENCIA_LABELS) as EstadoIncidencia[];

export function IncidenciaFormModal({
  initialData,
  colonias,
  gatos,
  onClose,
  onSubmit,
}: IncidenciaFormModalProps) {
  const [coloniaId, setColoniaId] = useState(initialData?.colonia_id ?? '');
  const [gatoId, setGatoId] = useState(initialData?.gato_id ?? '');
  const [tipo, setTipo] = useState<TipoIncidencia>(initialData?.tipo ?? 'gatos_nuevos');
  const [estado, setEstado] = useState<EstadoIncidencia>(initialData?.estado ?? 'abierta');
  const [fecha, setFecha] = useState(
    initialData?.fecha ? initialData.fecha.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [descripcion, setDescripcion] = useState(initialData?.descripcion ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGatoChange = (nextGatoId: string) => {
    setGatoId(nextGatoId);
    const gato = gatos.find((g) => g.id === nextGatoId);
    if (gato?.colonia_actual_id && !coloniaId) {
      setColoniaId(gato.colonia_actual_id);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) {
      setError('Debes añadir una descripción de la incidencia.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        colonia_id: coloniaId || null,
        gato_id: gatoId || null,
        tipo,
        estado,
        fecha,
        descripcion: descripcion.trim(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la incidencia.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-sindicat-surface border border-sindicat-primary-light shadow-lg my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-sindicat-primary-light">
          <h3 className="text-lg font-bold text-sindicat-primary">
            {initialData ? 'Editar incidencia' : 'Nueva incidencia'}
          </h3>
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
              <label htmlFor="inc-tipo" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Tipo de incidencia *
              </label>
              <select
                id="inc-tipo"
                required
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoIncidencia)}
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              >
                {TIPOS_ORDENADOS.map((key) => (
                  <option key={key} value={key}>
                    {TIPO_INCIDENCIA_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="inc-estado" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Estado *
              </label>
              <select
                id="inc-estado"
                required
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoIncidencia)}
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              >
                {ESTADOS_ORDENADOS.map((key) => (
                  <option key={key} value={key}>
                    {ESTADO_INCIDENCIA_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="inc-fecha" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Fecha *
              </label>
              <input
                id="inc-fecha"
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="inc-colonia" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Colonia
              </label>
              <select
                id="inc-colonia"
                value={coloniaId}
                onChange={(e) => setColoniaId(e.target.value)}
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              >
                <option value="">Sin colonia asignada</option>
                {colonias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.codigo} · {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="inc-gato" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Gato (opcional)
              </label>
              <select
                id="inc-gato"
                value={gatoId}
                onChange={(e) => handleGatoChange(e.target.value)}
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              >
                <option value="">Ninguno en concreto</option>
                {gatos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.codigo} · {g.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="inc-descripcion" className="block text-xs font-semibold text-sindicat-ink mb-1">
              Descripción detallada *
            </label>
            <textarea
              id="inc-descripcion"
              rows={4}
              required
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe qué ha ocurrido, ubicación exacta, personas implicadas o acciones tomadas..."
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
              {saving ? 'Guardando...' : initialData ? 'Guardar cambios' : 'Registrar incidencia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}