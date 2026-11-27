import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Colonia } from '../colonias/types';
import {
  TIPO_ALIMENTACION_LABELS,
  type RegistroAlimentacion,
  type RegistroAlimentacionInput,
  type TipoAlimentacion,
} from './types';

interface AlimentacionFormModalProps {
  initialData?: RegistroAlimentacion | null;
  colonias: Colonia[];
  onClose: () => void;
  onSubmit: (input: RegistroAlimentacionInput) => Promise<void>;
}

const TIPOS_ORDENADOS = Object.keys(TIPO_ALIMENTACION_LABELS) as TipoAlimentacion[];

export function AlimentacionFormModal({
  initialData,
  colonias,
  onClose,
  onSubmit,
}: AlimentacionFormModalProps) {
  const [coloniaId, setColoniaId] = useState(initialData?.colonia_id ?? '');
  const [tipo, setTipo] = useState<TipoAlimentacion>(initialData?.tipo ?? 'alimentacion');
  const [fecha, setFecha] = useState(
    initialData?.fecha ? initialData.fecha.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [consumoPienso, setConsumoPienso] = useState(
    initialData?.consumo_pienso_kg != null ? String(initialData.consumo_pienso_kg) : ''
  );
  const [aguaRepuesta, setAguaRepuesta] = useState(initialData?.agua_repuesta ?? true);
  const [limpiezaRealizada, setLimpiezaRealizada] = useState(
    initialData?.limpieza_realizada ?? false
  );
  const [estadoComederos, setEstadoComederos] = useState(initialData?.estado_comederos ?? '');
  const [materiales, setMateriales] = useState(initialData?.materiales_existencias ?? '');
  const [responsable, setResponsable] = useState(initialData?.responsable ?? '');
  const [observaciones, setObservaciones] = useState(initialData?.observaciones ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsedPienso =
      consumoPienso.trim() === '' ? null : Number(consumoPienso.replace(',', '.'));
    if (parsedPienso !== null && (Number.isNaN(parsedPienso) || parsedPienso < 0)) {
      setError('El consumo de pienso debe ser un número válido mayor o igual que 0.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        colonia_id: coloniaId || null,
        tipo,
        fecha,
        consumo_pienso_kg: parsedPienso,
        agua_repuesta: aguaRepuesta,
        limpieza_realizada: limpiezaRealizada,
        estado_comederos: estadoComederos.trim() || null,
        materiales_existencias: materiales.trim() || null,
        responsable: responsable.trim() || null,
        observaciones: observaciones.trim() || null,
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
          <h3 className="text-lg font-bold text-sindicat-primary">
            {initialData ? 'Editar registro de alimentación' : 'Nuevo registro de alimentación'}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="alim-colonia" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Colonia
              </label>
              <select
                id="alim-colonia"
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
              <label htmlFor="alim-tipo" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Tipo de actuación *
              </label>
              <select
                id="alim-tipo"
                required
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoAlimentacion)}
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              >
                {TIPOS_ORDENADOS.map((key) => (
                  <option key={key} value={key}>
                    {TIPO_ALIMENTACION_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="alim-fecha" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Fecha *
              </label>
              <input
                id="alim-fecha"
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="alim-pienso" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Consumo de pienso (kg)
              </label>
              <input
                id="alim-pienso"
                inputMode="decimal"
                value={consumoPienso}
                onChange={(e) => setConsumoPienso(e.target.value)}
                placeholder="Ej. 1.5"
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="alim-responsable" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Responsable / alimentador
              </label>
              <input
                id="alim-responsable"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                placeholder="Persona que realiza el turno"
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl bg-sindicat-bg/70 p-3.5 border border-sindicat-primary-light flex flex-wrap gap-6">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-sindicat-ink cursor-pointer">
              <input
                type="checkbox"
                checked={aguaRepuesta}
                onChange={(e) => setAguaRepuesta(e.target.checked)}
                className="h-4 w-4 accent-sindicat-primary"
              />
              Agua repuesta
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-sindicat-ink cursor-pointer">
              <input
                type="checkbox"
                checked={limpiezaRealizada}
                onChange={(e) => setLimpiezaRealizada(e.target.checked)}
                className="h-4 w-4 accent-sindicat-primary"
              />
              Limpieza de zona realizada
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="alim-comederos" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Estado de comederos y bebederos
              </label>
              <input
                id="alim-comederos"
                value={estadoComederos}
                onChange={(e) => setEstadoComederos(e.target.value)}
                placeholder="Ej. Buen estado, falta tolva, roto..."
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="alim-materiales" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Materiales y existencias
              </label>
              <input
                id="alim-materiales"
                value={materiales}
                onChange={(e) => setMateriales(e.target.value)}
                placeholder="Ej. Quedan 2 sacos de 10 kg, 12 latas..."
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="alim-obs" className="block text-xs font-semibold text-sindicat-ink mb-1">
              Observaciones
            </label>
            <textarea
              id="alim-obs"
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas sobre consumo inusual, higiene o necesidades..."
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