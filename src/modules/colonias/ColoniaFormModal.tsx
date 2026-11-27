import { useState, type FormEvent } from 'react';
import { X, Crosshair } from 'lucide-react';
import type { Colonia, ColoniaInput, EstadoColonia } from './types';

interface ColoniaFormModalProps {
  initialData?: Colonia | null;
  onClose: () => void;
  onSubmit: (input: ColoniaInput) => Promise<void>;
}

export function ColoniaFormModal({ initialData, onClose, onSubmit }: ColoniaFormModalProps) {
  const [codigo, setCodigo] = useState(initialData?.codigo ?? '');
  const [nombre, setNombre] = useState(initialData?.nombre ?? '');
  const [municipio, setMunicipio] = useState(initialData?.municipio ?? '');
  const [barrio, setBarrio] = useState(initialData?.barrio ?? '');
  const [direccion, setDireccion] = useState(initialData?.direccion ?? '');
  const [latitud, setLatitud] = useState(initialData?.latitud != null ? String(initialData.latitud) : '');
  const [longitud, setLongitud] = useState(initialData?.longitud != null ? String(initialData.longitud) : '');
  const [fechaRegistro, setFechaRegistro] = useState(
    initialData?.fecha_registro ?? new Date().toISOString().slice(0, 10)
  );
  const [alimentadores, setAlimentadores] = useState(initialData?.alimentadores ?? '');
  const [estado, setEstado] = useState<EstadoColonia>(initialData?.estado ?? 'activa');
  const [observaciones, setObservaciones] = useState(initialData?.observaciones ?? '');
  const [saving, setSaving] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        codigo: codigo.trim().toUpperCase(),
        nombre: nombre.trim(),
        municipio: municipio.trim(),
        barrio: barrio.trim() || null,
        direccion: direccion.trim() || null,
        latitud: parsedLat,
        longitud: parsedLng,
        fecha_registro: fechaRegistro,
        alimentadores: alimentadores.trim() || null,
        observaciones: observaciones.trim() || null,
        estado,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la colonia.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-sindicat-surface border border-sindicat-primary-light shadow-lg my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-sindicat-primary-light">
          <h3 className="text-lg font-bold text-sindicat-primary">
            {initialData ? 'Editar colonia' : 'Nueva colonia'}
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
              <label htmlFor="col-codigo" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Código *
              </label>
              <input
                id="col-codigo"
                required
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="COL-001"
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="col-nombre" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Nombre de la colonia *
              </label>
              <input
                id="col-nombre"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Parque Norte"
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="col-municipio" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Municipio *
              </label>
              <input
                id="col-municipio"
                required
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
                placeholder="Ej. Tarragona"
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="col-barrio" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Barrio
              </label>
              <input
                id="col-barrio"
                value={barrio}
                onChange={(e) => setBarrio(e.target.value)}
                placeholder="Ej. Sant Pere i Sant Pau"
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="col-direccion" className="block text-xs font-semibold text-sindicat-ink mb-1">
              Dirección o referencia
            </label>
            <input
              id="col-direccion"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Calle, parcela o punto de referencia"
              className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
            />
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
                <label htmlFor="col-lat" className="block text-xs text-sindicat-ink/75 mb-1">
                  Latitud
                </label>
                <input
                  id="col-lat"
                  value={latitud}
                  onChange={(e) => setLatitud(e.target.value)}
                  placeholder="41.118882"
                  className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="col-lng" className="block text-xs text-sindicat-ink/75 mb-1">
                  Longitud
                </label>
                <input
                  id="col-lng"
                  value={longitud}
                  onChange={(e) => setLongitud(e.target.value)}
                  placeholder="1.244491"
                  className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="col-fecha" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Fecha de registro *
              </label>
              <input
                id="col-fecha"
                type="date"
                required
                value={fechaRegistro}
                onChange={(e) => setFechaRegistro(e.target.value)}
                className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="col-estado" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Estado *
              </label>
              <select
                id="col-estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoColonia)}
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              >
                <option value="activa">Activa</option>
                <option value="inactiva">Inactiva</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="col-alimentadores" className="block text-xs font-semibold text-sindicat-ink mb-1">
              Alimentadores
            </label>
            <input
              id="col-alimentadores"
              value={alimentadores}
              onChange={(e) => setAlimentadores(e.target.value)}
              placeholder="Personas responsables de alimentación y turnos"
              className="w-full rounded-xl border border-sindicat-ink/20 px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="col-obs" className="block text-xs font-semibold text-sindicat-ink mb-1">
              Observaciones
            </label>
            <textarea
              id="col-obs"
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas sobre accesos, horarios, refugios o particularidades..."
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
              {saving ? 'Guardando...' : initialData ? 'Guardar cambios' : 'Crear colonia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}