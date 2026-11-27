import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Colonia } from '../colonias/types';
import type { Gato } from '../censo/types';
import {
  PRIORIDAD_LABELS,
  TIPO_RECORDATORIO_LABELS,
  type PrioridadRecordatorio,
  type Recordatorio,
  type RecordatorioInput,
  type TipoRecordatorio,
} from './types';

interface AgendaFormModalProps {
  initialData?: Recordatorio | null;
  colonias: Colonia[];
  gatos: Gato[];
  onClose: () => void;
  onSubmit: (input: RecordatorioInput) => Promise<void>;
}

const TIPOS = Object.keys(TIPO_RECORDATORIO_LABELS) as TipoRecordatorio[];
const PRIORIDADES = Object.keys(PRIORIDAD_LABELS) as PrioridadRecordatorio[];

export function AgendaFormModal({
  initialData,
  colonias,
  gatos,
  onClose,
  onSubmit,
}: AgendaFormModalProps) {
  const [titulo, setTitulo] = useState(initialData?.titulo ?? '');
  const [tipo, setTipo] = useState<TipoRecordatorio>(initialData?.tipo ?? 'revision_veterinaria');
  const [prioridad, setPrioridad] = useState<PrioridadRecordatorio>(
    initialData?.prioridad ?? 'media'
  );
  const [fechaRecordatorio, setFechaRecordatorio] = useState(
    initialData?.fecha_recordatorio
      ? initialData.fecha_recordatorio.slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [coloniaId, setColoniaId] = useState(initialData?.colonia_id ?? '');
  const [gatoId, setGatoId] = useState(initialData?.gato_id ?? '');
  const [completado, setCompletado] = useState(initialData?.completado ?? false);
  const [notas, setNotas] = useState(initialData?.notas ?? '');
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
    if (!titulo.trim()) {
      setError('Indica un título para el recordatorio.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        colonia_id: coloniaId || null,
        gato_id: gatoId || null,
        titulo: titulo.trim(),
        tipo,
        fecha_recordatorio: new Date(fechaRecordatorio).toISOString(),
        prioridad,
        completado,
        notas: notas.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el recordatorio.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-sindicat-surface border border-sindicat-primary-light shadow-lg my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-sindicat-primary-light">
          <h3 className="text-lg font-bold text-sindicat-primary">
            {initialData ? 'Editar recordatorio' : 'Nuevo recordatorio'}
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
          <div>
            <label htmlFor="ag-titulo" className="block text-xs font-semibold text-sindicat-ink mb-1">
              Título del recordatorio *
            </label>
            <input
              id="ag-titulo"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Revisión postoperatoria, refuerzo vacuna, poner jaula..."
              className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="ag-tipo" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Tipo *
              </label>
              <select
                id="ag-tipo"
                required
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoRecordatorio)}
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              >
                {TIPOS.map((key) => (
                  <option key={key} value={key}>
                    {TIPO_RECORDATORIO_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ag-prioridad" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Prioridad *
              </label>
              <select
                id="ag-prioridad"
                required
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value as PrioridadRecordatorio)}
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              >
                {PRIORIDADES.map((key) => (
                  <option key={key} value={key}>
                    {PRIORIDAD_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ag-fecha" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Fecha y hora *
              </label>
              <input
                id="ag-fecha"
                type="datetime-local"
                required
                value={fechaRecordatorio}
                onChange={(e) => setFechaRecordatorio(e.target.value)}
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ag-colonia" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Colonia (opcional)
              </label>
              <select
                id="ag-colonia"
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
              <label htmlFor="ag-gato" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Gato (opcional)
              </label>
              <select
                id="ag-gato"
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
            <label htmlFor="ag-notas" className="block text-xs font-semibold text-sindicat-ink mb-1">
              Notas
            </label>
            <textarea
              id="ag-notas"
              rows={3}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Detalles, clínica, material o indicaciones..."
              className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
            />
          </div>

          <div className="rounded-xl bg-sindicat-bg/70 p-3.5 border border-sindicat-primary-light">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-sindicat-ink cursor-pointer">
              <input
                type="checkbox"
                checked={completado}
                onChange={(e) => setCompletado(e.target.checked)}
                className="h-4 w-4 accent-sindicat-primary"
              />
              Marcar como completado
            </label>
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
              {saving ? 'Guardando...' : initialData ? 'Guardar cambios' : 'Crear recordatorio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}