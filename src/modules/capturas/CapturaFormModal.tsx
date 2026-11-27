import { useState, type FormEvent } from 'react';
import { X, Crosshair } from 'lucide-react';
import type { Colonia } from '../colonias/types';
import type { Gato } from '../censo/types';
import {
  RESULTADO_CAPTURA_LABELS,
  type Captura,
  type CapturaInput,
  type ResultadoCaptura,
} from './types';

interface CapturaFormModalProps {
  initialData?: Captura | null;
  colonias: Colonia[];
  gatos: Gato[];
  onClose: () => void;
  onSubmit: (input: CapturaInput) => Promise<void>;
}

const RESULTADOS_ORDENADOS = Object.keys(RESULTADO_CAPTURA_LABELS) as ResultadoCaptura[];

export function CapturaFormModal({
  initialData,
  colonias,
  gatos,
  onClose,
  onSubmit,
}: CapturaFormModalProps) {
  const [coloniaId, setColoniaId] = useState(initialData?.colonia_id ?? '');
  const [gatoId, setGatoId] = useState(initialData?.gato_id ?? '');
  const [fechaProgramada, setFechaProgramada] = useState(
    initialData?.fecha_programada
      ? initialData.fecha_programada.slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [resultado, setResultado] = useState<ResultadoCaptura>(
    initialData?.resultado ?? 'planificada'
  );
  const [ubicacionTexto, setUbicacionTexto] = useState(initialData?.ubicacion_texto ?? '');
  const [latitud, setLatitud] = useState(
    initialData?.latitud != null ? String(initialData.latitud) : ''
  );
  const [longitud, setLongitud] = useState(
    initialData?.longitud != null ? String(initialData.longitud) : ''
  );
  const [responsable, setResponsable] = useState(initialData?.responsable ?? '');
  const [observaciones, setObservaciones] = useState(initialData?.observaciones ?? '');
  const [geoLoading, setGeoLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGatoChange = (nextGatoId: string) => {
    setGatoId(nextGatoId);
    const gato = gatos.find((g) => g.id === nextGatoId);
    if (gato?.colonia_actual_id && !coloniaId) {
      setColoniaId(gato.colonia_actual_id);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización.');
      return;
    }
    setGeoLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitud(pos.coords.latitude.toFixed(6));
        setLongitud(pos.coords.longitude.toFixed(6));
        setGeoLoading(false);
      },
      () => {
        setError('No se pudo obtener la ubicación. Revisa los permisos o introdúcela manualmente.');
        setGeoLoading(false);
      }
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedLat = latitud.trim() === '' ? null : Number(latitud.replace(',', '.'));
    const parsedLng = longitud.trim() === '' ? null : Number(longitud.replace(',', '.'));

    if ((parsedLat !== null && Number.isNaN(parsedLat)) || (parsedLng !== null && Number.isNaN(parsedLng))) {
      setError('Las coordenadas GPS deben ser valores numéricos válidos.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        colonia_id: coloniaId || null,
        gato_id: gatoId || null,
        fecha_programada: new Date(fechaProgramada).toISOString(),
        ubicacion_texto: ubicacionTexto.trim() || null,
        latitud: parsedLat,
        longitud: parsedLng,
        resultado,
        responsable: responsable.trim() || null,
        observaciones: observaciones.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la captura.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-sindicat-surface border border-sindicat-primary-light shadow-lg my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-sindicat-primary-light">
          <h3 className="text-lg font-bold text-sindicat-primary">
            {initialData ? 'Editar captura o rescate' : 'Nueva captura o rescate'}
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
              <label htmlFor="cap-colonia" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Colonia
              </label>
              <select
                id="cap-colonia"
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
              <label htmlFor="cap-gato" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Gato objetivo (opcional)
              </label>
              <select
                id="cap-gato"
                value={gatoId}
                onChange={(e) => handleGatoChange(e.target.value)}
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              >
                <option value="">Sin especificar / gato nuevo</option>
                {gatos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.codigo} · {g.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cap-fecha" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Fecha y hora programada *
              </label>
              <input
                id="cap-fecha"
                type="datetime-local"
                required
                value={fechaProgramada}
                onChange={(e) => setFechaProgramada(e.target.value)}
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="cap-resultado" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Estado / resultado *
              </label>
              <select
                id="cap-resultado"
                required
                value={resultado}
                onChange={(e) => setResultado(e.target.value as ResultadoCaptura)}
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              >
                {RESULTADOS_ORDENADOS.map((key) => (
                  <option key={key} value={key}>
                    {RESULTADO_CAPTURA_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cap-ubicacion" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Punto de captura / ubicación
              </label>
              <input
                id="cap-ubicacion"
                value={ubicacionTexto}
                onChange={(e) => setUbicacionTexto(e.target.value)}
                placeholder="Ej. Detrás del contenedor, zona jardín..."
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="cap-responsable" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Responsable / equipo
              </label>
              <input
                id="cap-responsable"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                placeholder="Persona o voluntarios encargados"
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl bg-sindicat-bg/70 p-3.5 space-y-3 border border-sindicat-primary-light">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-sindicat-primary">
                Coordenadas GPS (uso estrictamente privado)
              </span>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={geoLoading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sindicat-primary-light px-2.5 py-1 text-xs font-semibold text-sindicat-primary hover:opacity-90 cursor-pointer"
              >
                <Crosshair className="h-3.5 w-3.5" />
                {geoLoading ? 'Obteniendo...' : 'Usar mi ubicación'}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="cap-lat" className="block text-xs text-sindicat-ink/75 mb-1">
                  Latitud
                </label>
                <input
                  id="cap-lat"
                  value={latitud}
                  onChange={(e) => setLatitud(e.target.value)}
                  placeholder="41.118882"
                  className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="cap-lng" className="block text-xs text-sindicat-ink/75 mb-1">
                  Longitud
                </label>
                <input
                  id="cap-lng"
                  value={longitud}
                  onChange={(e) => setLongitud(e.target.value)}
                  placeholder="1.244491"
                  className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="cap-obs" className="block text-xs font-semibold text-sindicat-ink mb-1">
              Observaciones / material necesario
            </label>
            <textarea
              id="cap-obs"
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej. Jaula trampa abatible, comida húmeda, ayuno previo..."
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
              {saving ? 'Guardando...' : initialData ? 'Guardar cambios' : 'Programar captura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}