import { supabase } from '../../lib/supabase/client';
import { offlineDb } from '../../lib/offline/db';

export const TABLAS_BACKUP = [
  'colonias',
  'gatos',
  'actuaciones_cer',
  'registros_veterinarios',
  'capturas',
  'incidencias',
  'alimentacion_mantenimiento',
  'acogidas_adopciones',
  'agenda_recordatorios',
  'adjuntos',
] as const;

export type TablaBackup = (typeof TABLAS_BACKUP)[number];

export interface BackupPayload {
  version: number;
  app: 'SindiCat';
  exported_at: string;
  tables: Record<TablaBackup, Record<string, unknown>[]>;
}

export interface SnapshotInfo {
  created_at: string;
  total_registros: number;
}

export async function getUltimoSnapshotLocal(): Promise<SnapshotInfo | null> {
  try {
    const snap = await offlineDb.snapshots.get('latest');
    if (!snap) return null;
    return {
      created_at: snap.created_at,
      total_registros: snap.total_registros,
    };
  } catch {
    return null;
  }
}

export async function exportarBackupCompleto(): Promise<{
  filename: string;
  totalRegistros: number;
}> {
  const results = await Promise.all(
    TABLAS_BACKUP.map(async (tabla) => {
      const { data, error } = await supabase.from(tabla).select('*');
      if (error) throw new Error(`Error exportando ${tabla}: ${error.message}`);
      return [tabla, (data ?? []) as Record<string, unknown>[]] as const;
    })
  );

  const tables = Object.fromEntries(results) as Record<TablaBackup, Record<string, unknown>[]>;
  const totalRegistros = Object.values(tables).reduce((acc, rows) => acc + rows.length, 0);
  const nowIso = new Date().toISOString();

  const payload: BackupPayload = {
    version: 1,
    app: 'SindiCat',
    exported_at: nowIso,
    tables,
  };

  const jsonString = JSON.stringify(payload, null, 2);

  try {
    await offlineDb.snapshots.put({
      id: 'latest',
      created_at: nowIso,
      total_registros: totalRegistros,
      payload_json: jsonString,
    });
  } catch {
    // Si IndexedDB no está disponible en el navegador actual, continuamos con la descarga
  }

  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const filename = `SindiCat_Backup_${nowIso.slice(0, 10)}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { filename, totalRegistros };
}

export async function restaurarBackupDesdeArchivo(file: File): Promise<{
  totalRestaurados: number;
}> {
  const text = await file.text();
  let parsed: BackupPayload;

  try {
    parsed = JSON.parse(text) as BackupPayload;
  } catch {
    throw new Error('El archivo seleccionado no es un JSON válido.');
  }

  if (parsed.app !== 'SindiCat' || !parsed.tables) {
    throw new Error('El archivo no corresponde a una copia de seguridad válida de SindiCat.');
  }

  let totalRestaurados = 0;

  for (const tabla of TABLAS_BACKUP) {
    const rows = parsed.tables[tabla];
    if (!Array.isArray(rows) || rows.length === 0) continue;

    const { error } = await supabase.from(tabla).upsert(rows, { onConflict: 'id' });
    if (error) {
      throw new Error(`Error restaurando ${tabla}: ${error.message}`);
    }
    totalRestaurados += rows.length;
  }

  return { totalRestaurados };
}