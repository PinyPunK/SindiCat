import { useEffect, useState, type ChangeEvent } from 'react';
import { Upload, Star, Download, Trash2, FileText, Image as ImageIcon } from 'lucide-react';
import {
  listAdjuntos,
  setFotoPrincipal,
  softDeleteAdjunto,
  uploadAdjunto,
} from './adjuntosService';
import type { Adjunto, EntidadAdjunto } from './types';

interface AdjuntosPanelProps {
  entidad: EntidadAdjunto;
  registroId: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function AdjuntosPanel({ entidad, registroId }: AdjuntosPanelProps) {
  const [items, setItems] = useState<Adjunto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAdjuntos(entidad, registroId);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los adjuntos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [entidad, registroId]);

  const fotos = items.filter((i) => i.tipo === 'foto');
  const documentos = items.filter((i) => i.tipo === 'documento');

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const esPrimeraFoto = file.type.startsWith('image/') && fotos.length === 0;
      await uploadAdjunto({
        entidad,
        registroId,
        file,
        esPrincipal: esPrimeraFoto,
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir el archivo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrincipal = async (item: Adjunto) => {
    try {
      setError(null);
      await setFotoPrincipal(item);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar la foto principal.');
    }
  };

  const handleDelete = async (item: Adjunto) => {
    const confirmed = window.confirm(
      `¿Enviar "${item.nombre_archivo}" a la papelera?`
    );
    if (!confirmed) return;

    try {
      setError(null);
      await softDeleteAdjunto(item.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el archivo.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-sindicat-ink/70">
          Las fotos se comprimen automáticamente antes de subirse al almacenamiento privado.
        </p>
        <label className="inline-flex items-center gap-1.5 rounded-xl bg-sindicat-primary px-3.5 py-2 text-xs font-semibold text-white hover:opacity-95 cursor-pointer">
          <Upload className="h-3.5 w-3.5" />
          {uploading ? 'Subiendo...' : 'Subir foto o PDF'}
          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx,.txt"
            disabled={uploading}
            onChange={(e) => void handleFileChange(e)}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div role="alert" className="rounded-xl bg-sindicat-danger/10 border border-sindicat-danger/30 px-3 py-2 text-xs text-sindicat-danger">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-xs text-sindicat-ink/60">Cargando galería y documentos...</p>
      ) : (
        <div className="space-y-4">
          {/* Galería fotográfica */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-sindicat-primary flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              Galería de fotos ({fotos.length})
            </h4>
            {fotos.length === 0 ? (
              <p className="text-xs text-sindicat-ink/60">Sin fotografías adjuntas todavía.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fotos.map((foto) => (
                  <div
                    key={foto.id}
                    className="rounded-xl border border-sindicat-primary-light overflow-hidden bg-sindicat-bg/40"
                  >
                    {foto.signed_url ? (
                      <img
                        src={foto.signed_url}
                        alt={foto.nombre_archivo}
                        className="w-full h-36 object-cover bg-sindicat-bg"
                      />
                    ) : (
                      <div className="w-full h-36 flex items-center justify-center text-xs text-sindicat-ink/50">
                        Vista previa no disponible
                      </div>
                    )}
                    <div className="p-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-sindicat-ink truncate">
                          {foto.nombre_archivo}
                        </p>
                        <p className="text-[11px] text-sindicat-ink/60">
                          {formatBytes(foto.tamano_bytes)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {foto.es_principal ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sindicat-primary-light px-2 py-0.5 text-[10px] font-semibold text-sindicat-primary">
                            <Star className="h-3 w-3 fill-current" /> Principal
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleSetPrincipal(foto)}
                            aria-label={`Marcar ${foto.nombre_archivo} como foto principal`}
                            className="p-1.5 rounded-lg border border-sindicat-ink/15 text-sindicat-ink/70 hover:bg-sindicat-bg cursor-pointer"
                            title="Establecer como foto principal"
                          >
                            <Star className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {foto.signed_url && (
                          <a
                            href={foto.signed_url}
                            target="_blank"
                            rel="noreferrer"
                            download={foto.nombre_archivo}
                            aria-label={`Descargar ${foto.nombre_archivo}`}
                            className="p-1.5 rounded-lg border border-sindicat-ink/15 text-sindicat-ink/70 hover:bg-sindicat-bg"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => void handleDelete(foto)}
                          aria-label={`Eliminar ${foto.nombre_archivo}`}
                          className="p-1.5 rounded-lg border border-sindicat-danger/30 text-sindicat-danger hover:bg-sindicat-danger/10 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documentos PDF y otros */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-sindicat-primary flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Documentos y PDFs ({documentos.length})
            </h4>
            {documentos.length === 0 ? (
              <p className="text-xs text-sindicat-ink/60">Sin documentos adjuntos todavía.</p>
            ) : (
              <ul className="divide-y divide-sindicat-primary-light rounded-xl border border-sindicat-primary-light">
                {documentos.map((doc) => (
                  <li key={doc.id} className="p-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-sindicat-ink truncate">
                        {doc.nombre_archivo}
                      </p>
                      <p className="text-[11px] text-sindicat-ink/60">
                        {formatBytes(doc.tamano_bytes)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {doc.signed_url && (
                        <a
                          href={doc.signed_url}
                          target="_blank"
                          rel="noreferrer"
                          download={doc.nombre_archivo}
                          aria-label={`Descargar ${doc.nombre_archivo}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-sindicat-primary-light px-2.5 py-1 text-xs font-semibold text-sindicat-primary hover:opacity-90"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Abrir
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleDelete(doc)}
                        aria-label={`Eliminar ${doc.nombre_archivo}`}
                        className="p-1.5 rounded-lg border border-sindicat-danger/30 text-sindicat-danger hover:bg-sindicat-danger/10 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}