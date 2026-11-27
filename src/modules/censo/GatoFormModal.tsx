import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Colonia } from '../colonias/types';
import type {
  EstadoActualGato,
  EstadoCerActual,
  Gato,
  GatoInput,
  SexoGato,
} from './types';

interface GatoFormModalProps {
  initialData?: Gato | null;
  colonias: Colonia[];
  onClose: () => void;
  onSubmit: (input: GatoInput) => Promise<void>;
}

export function GatoFormModal({
  initialData,
  colonias,
  onClose,
  onSubmit,
}: GatoFormModalProps) {
  const [nombre, setNombre] = useState(initialData?.nombre ?? '');
  const [sexo, setSexo] = useState<SexoGato>(initialData?.sexo ?? 'desconocido');
  const [edadEstimada, setEdadEstimada] = useState(initialData?.edad_estimada ?? '');
  const [fechaNacimiento, setFechaNacimiento] = useState(initialData?.fecha_nacimiento_estimada ?? '');
  const [color, setColor] = useState(initialData?.color ?? '');
  const [caracteristicas, setCaracteristicas] = useState(initialData?.caracteristicas_fisicas ?? '');
  const [coloniaId, setColoniaId] = useState(initialData?.colonia_actual_id ?? '');
  const [motivoCambio, setMotivoCambio] = useState('');
  const [fechaPrimeraObs, setFechaPrimeraObs] = useState(
    initialData?.fecha_primera_observacion ?? new Date().toISOString().slice(0, 10)
  );
  const [microchip, setMicrochip] = useState(initialData?.microchip ?? '');
  const [marcajeAuricular, setMarcajeAuricular] = useState(initialData?.marcaje_auricular ?? false);
  const [marcajeDetalle, setMarcajeDetalle] = useState(initialData?.marcaje_detalle ?? '');
  const [estadoCer, setEstadoCer] = useState<EstadoCerActual>(initialData?.estado_cer_actual ?? 'pendiente');
  const [estadoActual, setEstadoActual] = useState<EstadoActualGato>(initialData?.estado_actual ?? 'en_colonia');
  const [observaciones, setObservaciones] = useState(initialData?.observaciones ?? '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coloniaCambio = Boolean(initialData && (initialData.colonia_actual_id ?? '') !== coloniaId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        nombre: nombre.trim(),
        sexo,
        edad_estimada: edadEstimada.trim() || null,
        fecha_nacimiento_estimada: fechaNacimiento || null,
        color: color.trim() || null,
        caracteristicas_fisicas: caracteristicas.trim() || null,
        colonia_actual_id: coloniaId || null,
        fecha_primera_observacion: fechaPrimeraObs,
        microchip: microchip.trim() || null,
        marcaje_auricular: marcajeAuricular,
        marcaje_detalle: marcajeAuricular ? (marcajeDetalle.trim() || null) : null,
        estado_cer_actual: estadoCer,
        estado_actual: estadoActual,
        observaciones: observaciones.trim() || null,
        motivo_cambio_colonia: coloniaCambio ? motivoCambio.trim() || null : null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el gato.');
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
              {initialData ? `Editar gato (${initialData.codigo})` : 'Registrar nuevo gato'}
            </h3>
            {!initialData && (
              <p className="text-xs text-sindicat-ink/60">
                El código identificativo (SC-00001…) se asigna automáticamente y es inmutable.
              </p>
            )}
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
              <label htmlFor="gato-nombre" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Nombre o apodo *
              </label>
              <input
                id="gato-nombre"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Bigotes"
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="gato-sexo" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Sexo *
              </label>
              <select
                id="gato-sexo"
                value={sexo}
                onChange={(e) => setSexo(e.target.value as SexoGato)}
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              >
                <option value="desconocido">Desconocido</option>
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="gato-colonia" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Colonia actual
              </label>
              <select
                id="gato-colonia"
                value={coloniaId}
                onChange={(e) => setColoniaId(e.target.value)}
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              >
                <option value="">Sin colonia asignada</option>
                {colonias.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.codigo} · {col.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="gato-estado-actual" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Estado actual *
              </label>
              <select
                id="gato-estado-actual"
                value={estadoActual}
                onChange={(e) => setEstadoActual(e.target.value as EstadoActualGato)}
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              >
                <option value="en_colonia">En colonia</option>
                <option value="acogida">En acogida</option>
                <option value="adoptado">Adoptado</option>
                <option value="trasladado">Trasladado</option>
                <option value="desaparecido">Desaparecido</option>
                <option value="fallecido">Fallecido</option>
              </select>
            </div>

            <div>
              <label htmlFor="gato-estado-cer" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Estado CER actual *
              </label>
              <select
                id="gato-estado-cer"
                value={estadoCer}
                onChange={(e) => setEstadoCer(e.target.value as EstadoCerActual)}
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              >
                <option value="pendiente">Pendiente</option>
                <option value="captura_programada">Captura programada</option>
                <option value="capturado">Capturado</option>
                <option value="en_clinica">En clínica</option>
                <option value="esterilizado">Esterilizado</option>
                <option value="en_recuperacion">En recuperación</option>
                <option value="retornado">Retornado</option>
                <option value="no_aplica">No aplica</option>
              </select>
            </div>
          </div>

          {coloniaCambio && (
            <div className="rounded-xl bg-sindicat-primary-light/70 p-3.5 border border-sindicat-primary/25">
              <label htmlFor="gato-motivo-colonia" className="block text-xs font-semibold text-sindicat-primary mb-1">
                Motivo del cambio de colonia (se guardará en el historial)
              </label>
              <input
                id="gato-motivo-colonia"
                value={motivoCambio}
                onChange={(e) => setMotivoCambio(e.target.value)}
                placeholder="Ej. Traslado por obras o reubicación autorizada"
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="gato-edad" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Edad estimada
              </label>
              <input
                id="gato-edad"
                value={edadEstimada}
                onChange={(e) => setEdadEstimada(e.target.value)}
                placeholder="Ej. 2 años / cachorro"
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="gato-nacimiento" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Fecha nac. estimada
              </label>
              <input
                id="gato-nacimiento"
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="gato-primera-obs" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Primera observación *
              </label>
              <input
                id="gato-primera-obs"
                type="date"
                required
                value={fechaPrimeraObs}
                onChange={(e) => setFechaPrimeraObs(e.target.value)}
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="gato-color" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Color / manto
              </label>
              <input
                id="gato-color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Ej. Atigrado pardo y blanco"
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="gato-microchip" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Microchip
              </label>
              <input
                id="gato-microchip"
                value={microchip}
                onChange={(e) => setMicrochip(e.target.value)}
                placeholder="Número de microchip si tiene"
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl bg-sindicat-bg/70 p-3.5 border border-sindicat-primary-light space-y-2.5">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-sindicat-ink cursor-pointer">
              <input
                type="checkbox"
                checked={marcajeAuricular}
                onChange={(e) => setMarcajeAuricular(e.target.checked)}
                className="h-4 w-4 accent-sindicat-primary"
              />
              Tiene marcaje auricular (muesca en oreja)
            </label>
            {marcajeAuricular && (
              <input
                value={marcajeDetalle}
                onChange={(e) => setMarcajeDetalle(e.target.value)}
                placeholder="Ej. Oreja izquierda, corte recto"
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            )}
          </div>

          <div>
            <label htmlFor="gato-caracteristicas" className="block text-xs font-semibold text-sindicat-ink mb-1">
              Características físicas distintivas
            </label>
            <input
              id="gato-caracteristicas"
              value={caracteristicas}
              onChange={(e) => setCaracteristicas(e.target.value)}
              placeholder="Ej. Mancha blanca en hocico, cola corta..."
              className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="gato-obs" className="block text-xs font-semibold text-sindicat-ink mb-1">
              Observaciones
            </label>
            <textarea
              id="gato-obs"
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Carácter, rutinas, relación con otros gatos..."
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
              {saving ? 'Guardando...' : initialData ? 'Guardar cambios' : 'Registrar gato'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}