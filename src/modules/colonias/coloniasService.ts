import { supabase } from '../../lib/supabase/client';
import type { Colonia, ColoniaHistorialItem, ColoniaInput } from './types';

export async function listColonias(): Promise<Colonia[]> {
  const [coloniasRes, gatosRes] = await Promise.all([
    supabase
      .from('colonias')
      .select('*')
      .is('deleted_at', null)
      .order('nombre', { ascending: true }),
    supabase
      .from('gatos')
      .select('colonia_actual_id')
      .is('deleted_at', null),
  ]);

  if (coloniasRes.error) throw new Error(coloniasRes.error.message);
  if (gatosRes.error) throw new Error(gatosRes.error.message);

  const conteoPorColonia: Record<string, number> = {};
  for (const gato of gatosRes.data ?? []) {
    if (gato.colonia_actual_id) {
      conteoPorColonia[gato.colonia_actual_id] = (conteoPorColonia[gato.colonia_actual_id] ?? 0) + 1;
    }
  }

  return ((coloniasRes.data ?? []) as Colonia[]).map((colonia) => ({
    ...colonia,
    total_gatos: conteoPorColonia[colonia.id] ?? 0,
  }));
}

export async function createColonia(input: ColoniaInput): Promise<Colonia> {
  const { data, error } = await supabase
    .from('colonias')
    .insert(input)
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Ya existe una colonia con ese código. Usa un código único.');
    }
    throw new Error(error.message);
  }

  return data as Colonia;
}

export async function updateColonia(id: string, input: ColoniaInput): Promise<Colonia> {
  const { data, error } = await supabase
    .from('colonias')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Ya existe otra colonia con ese código.');
    }
    throw new Error(error.message);
  }

  return data as Colonia;
}

export async function softDeleteColonia(id: string): Promise<void> {
  const { error } = await supabase
    .from('colonias')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function getColoniaHistorial(coloniaId: string): Promise<ColoniaHistorialItem[]> {
  const [cerRes, incRes] = await Promise.all([
    supabase
      .from('actuaciones_cer')
      .select('id, estado, fecha_actuacion, observaciones')
      .eq('colonia_id', coloniaId)
      .is('deleted_at', null)
      .order('fecha_actuacion', { ascending: false })
      .limit(20),
    supabase
      .from('incidencias')
      .select('id, tipo, estado, fecha, descripcion')
      .eq('colonia_id', coloniaId)
      .is('deleted_at', null)
      .order('fecha', { ascending: false })
      .limit(20),
  ]);

  if (cerRes.error) throw new Error(cerRes.error.message);
  if (incRes.error) throw new Error(incRes.error.message);

  const items: ColoniaHistorialItem[] = [
    ...(cerRes.data ?? []).map((item) => ({
      id: `cer-${item.id}`,
      origen: 'CER' as const,
      fecha: item.fecha_actuacion,
      titulo: item.estado.replaceAll('_', ' '),
      detalle: item.observaciones,
    })),
    ...(incRes.data ?? []).map((item) => ({
      id: `inc-${item.id}`,
      origen: 'Incidencia' as const,
      fecha: item.fecha,
      titulo: `${item.tipo.replaceAll('_', ' ')} (${item.estado})`,
      detalle: item.descripcion,
    })),
  ];

  return items.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}