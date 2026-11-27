import { useEffect, useState } from 'react';
import { FileText, FileSpreadsheet, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { listColonias } from '../colonias/coloniasService';
import type { Colonia } from '../colonias/types';
import { listGatos } from '../censo/censoService';
import type { Gato } from '../censo/types';
import { getInformesConteos } from './informesService';
import { exportarInformeCsv, generarInformePdf } from './exportService';
import {
  PLANTILLAS_INFORME,
  type InformesConteos,
  type OrientacionPagina,
  type TipoInforme,
} from './types';

export function InformesPage() {
  const [conteos, setConteos] = useState<InformesConteos | null>(null);
  const [colonias, setColonias] = useState<Colonia[]>([]);
  const [gatos, setGatos] = useState<Gato[]>([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoInforme>('censo_general');
  const [coloniaId, setColoniaId] = useState('');
  const [gatoId, setGatoId] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [incluirFotos, setIncluirFotos] = useState(true);
  const [orientacion, setOrientacion] = useState<OrientacionPagina>('vertical');
  const [avisoAccion, setAvisoAccion] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([getInformesConteos(), listColonias(), listGatos()])
      .then(([conteosData, coloniasData, gatosData]) => {
        if (!mounted) return;
        setConteos(conteosData);
        setColonias(coloniasData);
        setGatos(gatosData);
        if (gatosData.length > 0) setGatoId(gatosData[0].id);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar el centro de informes.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const plantillaActual =
    PLANTILLAS_INFORME.find((p) => p.id === tipoSeleccionado) ?? PLANTILLAS_INFORME[0];

  const getConteoPlantilla = (id: TipoInforme): number => {
    if (!conteos) return 0;
    if (id === 'ficha_gato' || id === 'censo_general' || id === 'censo_colonia') return conteos.gatos;
    if (id === 'informe_cer') return conteos.actuacionesCer;
    if (id === 'historial_veterinario') return conteos.registrosVet;
    return conteos.incidencias;
  };

  const handleExportar = async (formato: 'pdf' | 'csv') => {
    if (plantillaActual.requiereGato && !gatoId) {
      setAvisoAccion('Selecciona primero un gato del censo para generar su ficha individual.');
      return;
    }

    setGenerando(true);
    setError(null);
    setAvisoAccion(null);

    try {
      const config = {
        tipo: tipoSeleccionado,
        coloniaId: coloniaId || undefined,
        gatoId: gatoId || undefined,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
        incluirFotos,
        orientacion,
      };

      const filename =
        formato === 'pdf'
          ? await generarInformePdf(config)
          : await exportarInformeCsv(config);

      setAvisoAccion(`Archivo descargado correctamente: ${filename}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar el informe.');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-sindicat-ink">Centro de informes</h2>
        <p className="text-sm text-sindicat-ink/70">
          Genera informes PDF con pdfmake y exportaciones CSV compatibles con Excel.
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-xl bg-sindicat-danger/10 border border-sindicat-danger/30 px-4 py-3 text-sm text-sindicat-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-sindicat-surface p-6 border border-sindicat-primary-light text-sm text-sindicat-ink/70">
          Cargando datos del centro de informes...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <section className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PLANTILLAS_INFORME.map((plantilla) => {
              const activa = plantilla.id === tipoSeleccionado;
              return (
                <button
                  key={plantilla.id}
                  type="button"
                  onClick={() => {
                    setTipoSeleccionado(plantilla.id);
                    setAvisoAccion(null);
                  }}
                  className={`text-left rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between gap-3 ${
                    activa
                      ? 'bg-sindicat-primary-light/50 border-sindicat-primary shadow-xs'
                      : 'bg-sindicat-surface border-sindicat-primary-light hover:bg-sindicat-bg/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <FileText className="h-4 w-4 text-sindicat-primary shrink-0" />
                      <span className="rounded-full bg-sindicat-bg px-2.5 py-0.5 text-[11px] font-semibold text-sindicat-ink">
                        {getConteoPlantilla(plantilla.id)} registros
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-sindicat-ink">{plantilla.titulo}</h3>
                    <p className="mt-1 text-xs text-sindicat-ink/70">{plantilla.descripcion}</p>
                  </div>
                </button>
              );
            })}
          </section>

          <section className="rounded-2xl bg-sindicat-surface p-5 border border-sindicat-primary-light space-y-4 h-fit">
            <div className="flex items-center gap-2 text-sindicat-primary">
              <SlidersHorizontal className="h-4 w-4" />
              <h3 className="text-sm font-bold">Opciones del informe</h3>
            </div>

            <p className="text-xs font-semibold text-sindicat-ink bg-sindicat-bg/70 rounded-xl px-3 py-2">
              Plantilla: {plantillaActual.titulo}
            </p>

            {plantillaActual.requiereGato && (
              <div>
                <label htmlFor="inf-gato" className="block text-xs font-semibold text-sindicat-ink mb-1">
                  Gato *
                </label>
                <select
                  id="inf-gato"
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
            )}

            {plantillaActual.permiteColonia && (
              <div>
                <label htmlFor="inf-colonia" className="block text-xs font-semibold text-sindicat-ink mb-1">
                  Filtrar por colonia
                </label>
                <select
                  id="inf-colonia"
                  value={coloniaId}
                  onChange={(e) => setColoniaId(e.target.value)}
                  className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
                >
                  <option value="">Todas las colonias</option>
                  {colonias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.codigo} · {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {plantillaActual.permiteFechas && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="inf-desde" className="block text-xs font-semibold text-sindicat-ink mb-1">
                    Desde
                  </label>
                  <input
                    id="inf-desde"
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="w-full rounded-xl border border-sindicat-ink/20 px-2.5 py-2 text-xs focus:border-sindicat-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="inf-hasta" className="block text-xs font-semibold text-sindicat-ink mb-1">
                    Hasta
                  </label>
                  <input
                    id="inf-hasta"
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="w-full rounded-xl border border-sindicat-ink/20 px-2.5 py-2 text-xs focus:border-sindicat-primary focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="inf-orientacion" className="block text-xs font-semibold text-sindicat-ink mb-1">
                Orientación de página
              </label>
              <select
                id="inf-orientacion"
                value={orientacion}
                onChange={(e) => setOrientacion(e.target.value as OrientacionPagina)}
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3 py-2 text-sm focus:border-sindicat-primary focus:outline-none"
              >
                <option value="vertical">Vertical (A4)</option>
                <option value="horizontal">Horizontal (A4 apaisado)</option>
              </select>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-sindicat-ink cursor-pointer">
              <input
                type="checkbox"
                checked={incluirFotos}
                onChange={(e) => setIncluirFotos(e.target.checked)}
                className="h-4 w-4 accent-sindicat-primary"
              />
              Incluir fotografías en el PDF
            </label>

            {avisoAccion && (
              <div
                role="status"
                className="rounded-xl bg-sindicat-primary-light/70 border border-sindicat-primary/25 p-3 text-xs text-sindicat-primary flex items-start gap-2"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{avisoAccion}</span>
              </div>
            )}

            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={generando}
                onClick={() => void handleExportar('pdf')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sindicat-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60 cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                {generando ? 'Generando...' : 'Generar PDF'}
              </button>
              <button
                type="button"
                disabled={generando}
                onClick={() => void handleExportar('csv')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-sindicat-primary/35 px-4 py-2 text-sm font-semibold text-sindicat-primary hover:bg-sindicat-primary-light disabled:opacity-60 cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Exportar Excel / CSV
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}