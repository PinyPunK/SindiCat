import { supabase } from '../../lib/supabase/client';
import type { RegistroAlimentacion, RegistroAlimentacionInput } from './types';

export async function listRegistrosAlimentacion(): Promise<RegistroAlimentacion[]> {
  const [alimRes, coloniasRes] = await Promise.all([
    supabase
      .from('alimentacion_mantenimiento')
      .select('*')
      .is('deleted_at', null)
      .order('fecha', { ascending: false }),
    supabase
      .from('colonias')
      .select('id, nombre')
      .is('deleted_at', null),
  ]);

  if (alimRes.error) throw new Error(alimRes.error.message);
  if (coloniasRes.error) throw new Error(coloniasRes.error.message);

  const coloniaMap: Record<string, string> = {};
  for (const c of coloniasRes.data ?? []) {
    coloniaMap[c.id] = c.nombre;
  }

  return ((alimRes.data ?? []) as RegistroAlimentacion[]).map((item) => ({
    ...item,
    consumo_pienso_kg: item.consumo_pienso_kg != null ? Number(item.consumo_pienso_kg) : null,
    colonia_nombre: item.colonia_id ? (coloniaMap[item.colonia_id] ?? 'Sin colonia') : 'Sin colonia',
  }));
}

export async function createRegistroAlimentacion(
  input: RegistroAlimentacionInput
): Promise<RegistroAlimentacion> {
  const { data, error } = await supabase
    .from('alimentacion_mantenimiento')
    .insert(input)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as RegistroAlimentacion;
}

export async function updateRegistroAlimentacion(
  id: string,
  input: RegistroAlimentacionInput
): Promise<RegistroAlimentacion> {
  const { data, error } = await supabase
    .from('alimentacion_mantenimiento')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as RegistroAlimentacion;
}

export async function softDeleteRegistroAlimentacion(id: string): Promise<void> {
  const { error } = await supabase
    .from('alimentacion_mantenimiento')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}