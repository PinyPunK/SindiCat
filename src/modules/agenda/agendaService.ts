import { supabase } from '../../lib/supabase/client';
import type { Recordatorio, RecordatorioInput } from './types';

export async function listRecordatorios(): Promise<Recordatorio[]> {
  const [agendaRes, coloniasRes, gatosRes] = await Promise.all([
    supabase
      .from('agenda_recordatorios')
      .select('*')
      .is('deleted_at', null)
      .order('fecha_recordatorio', { ascending: true }),
    supabase
      .from('colonias')
      .select('id, nombre')
      .is('deleted_at', null),
    supabase
      .from('gatos')
      .select('id, codigo, nombre')
      .is('deleted_at', null),
  ]);

  if (agendaRes.error) throw new Error(agendaRes.error.message);
  if (coloniasRes.error) throw new Error(coloniasRes.error.message);
  if (gatosRes.error) throw new Error(gatosRes.error.message);

  const coloniaMap: Record<string, string> = {};
  for (const c of coloniasRes.data ?? []) {
    coloniaMap[c.id] = c.nombre;
  }

  const gatoMap: Record<string, { codigo: string; nombre: string }> = {};
  for (const g of gatosRes.data ?? []) {
    gatoMap[g.id] = { codigo: g.codigo, nombre: g.nombre };
  }

  return ((agendaRes.data ?? []) as Recordatorio[]).map((item) => ({
    ...item,
    colonia_nombre: item.colonia_id ? (coloniaMap[item.colonia_id] ?? 'Sin colonia') : 'Sin colonia',
    gato_codigo: item.gato_id ? (gatoMap[item.gato_id]?.codigo ?? null) : null,
    gato_nombre: item.gato_id ? (gatoMap[item.gato_id]?.nombre ?? null) : null,
  }));
}

export async function createRecordatorio(input: RecordatorioInput): Promise<Recordatorio> {
  const { data, error } = await supabase
    .from('agenda_recordatorios')
    .insert(input)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as Recordatorio;
}

export async function updateRecordatorio(
  id: string,
  input: RecordatorioInput
): Promise<Recordatorio> {
  const { data, error } = await supabase
    .from('agenda_recordatorios')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as Recordatorio;
}

export async function toggleRecordatorioCompletado(
  id: string,
  completado: boolean
): Promise<void> {
  const { error } = await supabase
    .from('agenda_recordatorios')
    .update({ completado })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function softDeleteRecordatorio(id: string): Promise<void> {
  const { error } = await supabase
    .from('agenda_recordatorios')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}