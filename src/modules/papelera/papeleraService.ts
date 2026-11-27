import { supabase } from '../../lib/supabase/client';
import { TABLA_LABELS, type ItemPapelera, type TablaPapelera } from './types';

export async function listPapelera(): Promise<ItemPapelera[]> {
  const [
    coloniasRes,
    gatosRes,
    cerRes,
    vetRes,
    capturasRes,
    incRes,
    alimRes,
    acogRes,
    agendaRes,
  ] = await Promise.all([
    supabase.from('colonias').select('id, codigo, nombre, municipio, deleted_at').not('deleted_at', 'is', null),
    supabase.from('gatos').select('id, codigo, nombre, estado_actual, deleted_at').not('deleted_at', 'is', null),
    supabase.from('actuaciones_cer').select('id, estado, fecha_actuacion, deleted_at').not('deleted_at', 'is', null),
    supabase.from('registros_veterinarios').select('id, tipo, diagnostico_o_motivo, deleted_at').not('deleted_at', 'is', null),
    supabase.from('capturas').select('id, ubicacion_texto, resultado, deleted_at').not('deleted_at', 'is', null),
    supabase.from('incidencias').select('id, tipo, descripcion, deleted_at').not('deleted_at', 'is', null),
    supabase.from('alimentacion_mantenimiento').select('id, tipo, fecha, deleted_at').not('deleted_at', 'is', null),
    supabase.from('acogidas_adopciones').select('id, tipo, persona_destino, deleted_at').not('deleted_at', 'is', null),
    supabase.from('agenda_recordatorios').select('id, titulo, tipo, deleted_at').not('deleted_at', 'is', null),
  ]);

  const firstError =
    coloniasRes.error ||
    gatosRes.error ||
    cerRes.error ||
    vetRes.error ||
    capturasRes.error ||
    incRes.error ||
    alimRes.error ||
    acogRes.error ||
    agendaRes.error;

  if (firstError) throw new Error(firstError.message);

  const items: ItemPapelera[] = [];

  for (const r of coloniasRes.data ?? []) {
    items.push({
      id: r.id,
      tabla: 'colonias',
      entidadLabel: TABLA_LABELS.colonias,
      titulo: `${r.codigo} · ${r.nombre}`,
      detalle: r.municipio,
      deleted_at: r.deleted_at,
    });
  }

  for (const r of gatosRes.data ?? []) {
    items.push({
      id: r.id,
      tabla: 'gatos',
      entidadLabel: TABLA_LABELS.gatos,
      titulo: `${r.codigo} · ${r.nombre}`,
      detalle: `Estado: ${r.estado_actual}`,
      deleted_at: r.deleted_at,
    });
  }

  for (const r of cerRes.data ?? []) {
    items.push({
      id: r.id,
      tabla: 'actuaciones_cer',
      entidadLabel: TABLA_LABELS.actuaciones_cer,
      titulo: String(r.estado).replaceAll('_', ' '),
      detalle: new Date(r.fecha_actuacion).toLocaleDateString('es-ES'),
      deleted_at: r.deleted_at,
    });
  }

  for (const r of vetRes.data ?? []) {
    items.push({
      id: r.id,
      tabla: 'registros_veterinarios',
      entidadLabel: TABLA_LABELS.registros_veterinarios,
      titulo: r.diagnostico_o_motivo,
      detalle: String(r.tipo).replaceAll('_', ' '),
      deleted_at: r.deleted_at,
    });
  }

  for (const r of capturasRes.data ?? []) {
    items.push({
      id: r.id,
      tabla: 'capturas',
      entidadLabel: TABLA_LABELS.capturas,
      titulo: r.ubicacion_texto || 'Captura sin ubicación',
      detalle: `Resultado: ${r.resultado}`,
      deleted_at: r.deleted_at,
    });
  }

  for (const r of incRes.data ?? []) {
    items.push({
      id: r.id,
      tabla: 'incidencias',
      entidadLabel: TABLA_LABELS.incidencias,
      titulo: String(r.tipo).replaceAll('_', ' '),
      detalle: r.descripcion,
      deleted_at: r.deleted_at,
    });
  }

  for (const r of alimRes.data ?? []) {
    items.push({
      id: r.id,
      tabla: 'alimentacion_mantenimiento',
      entidadLabel: TABLA_LABELS.alimentacion_mantenimiento,
      titulo: String(r.tipo).replaceAll('_', ' '),
      detalle: new Date(r.fecha).toLocaleDateString('es-ES'),
      deleted_at: r.deleted_at,
    });
  }

  for (const r of acogRes.data ?? []) {
    items.push({
      id: r.id,
      tabla: 'acogidas_adopciones',
      entidadLabel: TABLA_LABELS.acogidas_adopciones,
      titulo: r.persona_destino,
      detalle: String(r.tipo),
      deleted_at: r.deleted_at,
    });
  }

  for (const r of agendaRes.data ?? []) {
    items.push({
      id: r.id,
      tabla: 'agenda_recordatorios',
      entidadLabel: TABLA_LABELS.agenda_recordatorios,
      titulo: r.titulo,
      detalle: String(r.tipo).replaceAll('_', ' '),
      deleted_at: r.deleted_at,
    });
  }

  return items.sort(
    (a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime()
  );
}

export async function restaurarRegistro(tabla: TablaPapelera, id: string): Promise<void> {
  const { error } = await supabase.from(tabla).update({ deleted_at: null }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function eliminarDefinitivamente(tabla: TablaPapelera, id: string): Promise<void> {
  const { error } = await supabase.from(tabla).delete().eq('id', id);
  if (error) {
    throw new Error(
      `No se pudo eliminar definitivamente (puede tener registros históricos vinculados): ${error.message}`
    );
  }
}