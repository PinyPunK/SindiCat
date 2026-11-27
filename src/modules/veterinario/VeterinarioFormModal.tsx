import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Gato } from '../censo/types';
import {
  TIPO_VET_LABELS,
  type RegistroVeterinario,
  type RegistroVeterinarioInput,
  type TipoRegistroVeterinario,
} from './types';

interface VeterinarioFormModalProps {
  initialData?: RegistroVeterinario | null;
  gatos: Gato[];
  onClose: () => void;
  onSubmit: (input: RegistroVeterinarioInput) => Promise<void>;
}

const TIPOS_ORDENADOS = Object.keys(TIPO_VET_LABELS) as TipoRegistroVeterinario[];

export function VeterinarioFormModal({
  initialData,
  gatos,
  onClose,
  onSubmit,
}: VeterinarioFormModalProps) {
  const [gatoId, setGatoId] = useState(initialData?.gato_id ?? (gatos[0]?.id ?? ''));
  const [tipo, setTipo] = useState<TipoRegistroVeterinario>(initialData?.tipo ?? 'revision');
  const [fecha, setFecha] = useState(
    initialData?.fecha ?? new Date().toISOString().slice(0, 10)
  );
  const [clinica, setClinica] = useState(initialData?.clinica_veterinaria ?? '');
  const [diagnostico, setDiagnostico] = useState(initialData?.diagnostico_o_motivo ?? '');
  const [tratamiento, setTratamiento] = useState(initialData?.tratamiento ?? '');
  const [evolucion, setEvolucion] = useState(initialData?.evolucion_resultado ?? '');
  const [coste, setCoste] = useState(
    initialData?.coste != null ? String(initialData.coste) : ''
  );
  const [requiereSeguimiento, setRequiereSeguimiento] = useState(
    initialData?.requiere_seguimiento ?? false
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!gatoId) {
      setError('Debes seleccionar un gato del censo.');
      return;
    }

    const parsedCoste = coste.trim() === '' ? null : Number(coste.replace(',', '.'));
    if (parsedCoste !== null && (Number.isNaN(parsedCoste) || parsedCoste < 0)) {
      setError('El coste debe ser un número válido mayor o igual que 0.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        gato_id: gatoId,
        tipo,
        fecha,
        clinica_veterinaria: clinica.trim() || null,
        diagnostico_o_motivo: diagnostico.trim(),
        tratamiento: tratamiento.trim() || null,
        evolucion_resultado: evolucion.trim() || null,
        coste: parsedCoste,
        requiere_seguimiento: requiereSeguimiento,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el registro veterinario.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-sindicat-surface border border-sindicat-primary-light shadow-lg my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-sindicat-primary-light">
          <h3 className="text-lg font-bold text-sindicat-primary">
            {initialData ? 'Editar registro veterinario' : 'Nuevo registro veterinario'}
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
              <label htmlFor="vet-gato" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Gato *
              </label>
              <select
                id="vet-gato"
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
              <label htmlFor="vet-tipo" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Tipo de registro *
              </label>
              <select
                id="vet-tipo"
                required
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoRegistroVeterinario)}
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              >
                {TIPOS_ORDENADOS.map((key) => (
                  <option key={key} value={key}>
                    {TIPO_VET_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="vet-fecha" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Fecha *
              </label>
              <input
                id="vet-fecha"
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="vet-clinica" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Clínica veterinaria
              </label>
              <input
                id="vet-clinica"
                value={clinica}
                onChange={(e) => setClinica(e.target.value)}
                placeholder="Ej. Clínica Veterinaria"
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="vet-coste" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Coste (€)
              </label>
              <input
                id="vet-coste"
                inputMode="decimal"
                value={coste}
                onChange={(e) => setCoste(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="vet-diagnostico" className="block text-xs font-semibold text-sindicat-ink mb-1">
              Diagnóstico o motivo de consulta *
            </label>
            <input
              id="vet-diagnostico"
              required
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              placeholder="Ej. Vacuna trivalente, herida en cuello, revisión anual..."
              className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="vet-tratamiento" className="block text-xs font-semibold text-sindicat-ink mb-1">
              Tratamiento / pauta
            </label>
            <textarea
              id="vet-tratamiento"
              rows={2}
              value={tratamiento}
              onChange={(e) => setTratamiento(e.target.value)}
              placeholder="Medicación, dosis, duración o curas..."
              className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="vet-evolucion" className="block text-xs font-semibold text-sindicat-ink mb-1">
              Evolución y resultado
            </label>
            <textarea
              id="vet-evolucion"
              rows={2}
              value={evolucion}
              onChange={(e) => setEvolucion(e.target.value)}
              placeholder="Respuesta al tratamiento o estado tras la visita..."
              className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
            />
          </div>

          <div className="rounded-xl bg-sindicat-bg/70 p-3.5 border border-sindicat-primary-light">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-sindicat-ink cursor-pointer">
              <input
                type="checkbox"
                checked={requiereSeguimiento}
                onChange={(e) => setRequiereSeguimiento(e.target.checked)}
                className="h-4 w-4 accent-sindicat-primary"
              />
              Requiere seguimiento veterinario activo
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
              {saving ? 'Guardando...' : initialData ? 'Guardar cambios' : 'Guardar registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}