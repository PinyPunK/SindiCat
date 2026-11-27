import { useEffect, useMemo, useState } from 'react';
import { ShieldAlert, MapPin, Crosshair, Search, Cat, Calendar } from 'lucide-react';
import { getMapaResumen } from './mapaService';
import type { MapaResumen, PuntoMapa, TipoPuntoMapa } from './types';

const TIPO_LABEL: Record<TipoPuntoMapa, string> = {
  colonia_activa: 'Colonia activa',
  colonia_inactiva: 'Colonia inactiva',
  captura: 'Captura',
};

const TIPO_BADGE: Record<TipoPuntoMapa, string> = {
  colonia_activa: 'bg-sindicat-primary-light text-sindicat-primary',
  colonia_inactiva: 'bg-sindicat-ink/10 text-sindicat-ink/70',
  captura: 'bg-sindicat-warning/20 text-sindicat-warning',
};

export function MapaPage() {
  const [resumen, setResumen] = useState<MapaResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [mostrarActivas, setMostrarActivas] = useState(true);
  const [mostrarInactivas, setMostrarInactivas] = useState(true);
  const [mostrarCapturas, setMostrarCapturas] = useState(true);
  const [selectedPunto, setSelectedPunto] = useState<PuntoMapa | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMapaResumen();
      setResumen(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las ubicaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filtered = useMemo(() => {
    const puntos = resumen?.puntos ?? [];
    const q = search.trim().toLowerCase();
    return puntos.filter((p) => {
      if (p.tipo === 'colonia_activa' && !mostrarActivas) return false;
      if (p.tipo === 'colonia_inactiva' && !mostrarInactivas) return false;
      if (p.tipo === 'captura' && !mostrarCapturas) return false;
      if (!q) return true;
      return (
        p.titulo.toLowerCase().includes(q) ||
        p.subtitulo.toLowerCase().includes(q)
      );
    });
  }, [resumen, search, mostrarActivas, mostrarInactivas, mostrarCapturas]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-sindicat-ink">Mapa privado de colonias</h2>
        <p className="text-sm text-sindicat-ink/70">
          Estructura base de geolocalización de colonias y puntos de captura (visor Leaflet en Fase 6).
        </p>
      </div>

      {/* Aviso de privacidad obligatorio */}
      <div
        role="note"
        className="rounded-2xl bg-sindicat-warning/15 border border-sindicat-warning/40 p-4 flex items-start gap-3 text-sm text-sindicat-ink"
      >
        <ShieldAlert className="h-5 w-5 text-sindicat-warning shrink-0 mt-0.5" />
        <p>
          <strong>Uso estrictamente privado:</strong> las coordenadas exactas de colonias, puntos de
          alimentación y capturas son confidenciales para proteger a los gatos. No compartas capturas
          ni ubicaciones públicamente.
        </p>
      </div>

      {/* Filtros de capas */}
      <div className="rounded-2xl bg-sindicat-surface p-4 border border-sindicat-primary-light space-y-3">
        <div className="relative">
          <Search className="h-4 w-4 text-sindicat-ink/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ubicación por colonia, municipio o punto de captura..."
            className="w-full rounded-xl border border-sindicat-primary-light bg-sindicat-bg/40 pl-10 pr-3.5 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={mostrarActivas}
              onChange={(e) => setMostrarActivas(e.target.checked)}
              className="h-4 w-4 accent-sindicat-primary"
            />
            Colonias activas
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={mostrarInactivas}
              onChange={(e) => setMostrarInactivas(e.target.checked)}
              className="h-4 w-4 accent-sindicat-primary"
            />
            Colonias inactivas
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={mostrarCapturas}
              onChange={(e) => setMostrarCapturas(e.target.checked)}
              className="h-4 w-4 accent-sindicat-primary"
            />
            Ubicaciones de capturas
          </label>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl bg-sindicat-danger/10 border border-sindicat-danger/30 px-4 py-3 text-sm text-sindicat-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-sindicat-surface p-6 border border-sindicat-primary-light text-sm text-sindicat-ink/70">
          Cargando ubicaciones geolocalizadas...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Contenedor base del visor */}
          <section className="lg:col-span-2 rounded-2xl bg-sindicat-surface p-6 border border-sindicat-primary-light flex flex-col justify-between min-h-[280px]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sindicat-primary">
                <h3 className="text-base font-bold">Visor cartográfico (Fase 6 · Leaflet)</h3>
              </div>
              <span className="rounded-full bg-sindicat-primary-light px-3 py-1 text-xs font-semibold text-sindicat-primary">
                {filtered.length} puntos visibles
              </span>
            </div>

            <div className="my-6 rounded-xl border border-dashed border-sindicat-primary/35 bg-sindicat-bg/60 p-6 text-center space-y-2">
              {selectedPunto ? (
                <>
                  <p className="text-xs font-semibold uppercase text-sindicat-primary">
                    {TIPO_LABEL[selectedPunto.tipo]} seleccionada
                  </p>
                  <p className="text-base font-bold text-sindicat-ink">{selectedPunto.titulo}</p>
                  <p className="text-sm text-sindicat-ink/75">{selectedPunto.subtitulo}</p>
                  <p className="text-xs font-mono text-sindicat-ink/70">
                    GPS: {selectedPunto.latitud.toFixed(6)}, {selectedPunto.longitud.toFixed(6)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-sindicat-ink">
                    Base de datos geolocalizada conectada y lista para Leaflet + OpenStreetMap.
                  </p>
                  <p className="text-xs text-sindicat-ink/65">
                    Selecciona cualquier punto de la lista derecha para inspeccionar sus coordenadas.
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-sindicat-ink/65">
              <span>Colonias sin GPS: {resumen?.coloniasSinGps ?? 0}</span>
              <span>Capturas sin GPS: {resumen?.capturasSinGps ?? 0}</span>
            </div>
          </section>

          {/* Listado lateral de puntos */}
          <section className="rounded-2xl bg-sindicat-surface p-4 border border-sindicat-primary-light space-y-3 max-h-[420px] overflow-y-auto">
            <h3 className="text-sm font-bold text-sindicat-primary">Puntos geolocalizados</h3>
            {filtered.length === 0 ? (
              <p className="text-xs text-sindicat-ink/60">
                No hay puntos con coordenadas GPS que coincidan con los filtros actuales.
              </p>
            ) : (
              <ul className="space-y-2">
                {filtered.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedPunto(p)}
                      className={`w-full text-left rounded-xl p-3 border transition cursor-pointer ${
                        selectedPunto?.id === p.id
                          ? 'border-sindicat-primary bg-sindicat-primary-light/40'
                          : 'border-sindicat-primary-light hover:bg-sindicat-bg/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${TIPO_BADGE[p.tipo]}`}>
                          {TIPO_LABEL[p.tipo]}
                        </span>
                        {p.tipo === 'captura' ? (
                          <Crosshair className="h-3.5 w-3.5 text-sindicat-warning shrink-0" />
                        ) : (
                          <MapPin className="h-3.5 w-3.5 text-sindicat-primary shrink-0" />
                        )}
                      </div>
                      <p className="mt-1.5 text-sm font-bold text-sindicat-ink truncate">
                        {p.titulo}
                      </p>
                      <p className="text-xs text-sindicat-ink/70 truncate">{p.subtitulo}</p>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-sindicat-ink/60">
                        {p.totalGatos != null ? (
                          <span className="inline-flex items-center gap-1">
                            <Cat className="h-3 w-3 text-sindicat-primary" /> {p.totalGatos} gatos
                          </span>
                        ) : p.fecha ? (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-sindicat-primary" />{' '}
                            {new Date(p.fecha).toLocaleDateString('es-ES')}
                          </span>
                        ) : (
                          <span />
                        )}
                        <span className="font-mono">
                          {p.latitud.toFixed(4)}, {p.longitud.toFixed(4)}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}