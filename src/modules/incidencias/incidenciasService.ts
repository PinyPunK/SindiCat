import { supabase } from '../../lib/supabase/client';
import type { Incidencia, IncidenciaInput } from './types';

export async function listIncidencias(): Promise<Incidencia[]> {
  const [incRes, coloniasRes, gatosRes] = await Promise.all([
    supabase
      .from('incidencias')
      .select('*')
      .is('deleted_at', null)
      .order('fecha', { ascending: false }),
    supabase
      .from('colonias')
      .select('id, nombre')
      .is('deleted_at', null),
    supabase
      .from('gatos')
      .select('id, codigo, nombre')
      .is('deleted_at', null),
  ]);

  if (incRes.error) throw new Error(incRes.error.message);
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

  return ((incRes.data ?? []) as Incidencia[]).map((item) => ({
    ...item,
    colonia_nombre: item.colonia_id ? (coloniaMap[item.colonia_id] ?? 'Sin colonia') : 'Sin colonia',
    gato_codigo: item.gato_id ? (gatoMap[item.gato_id]?.codigo ?? null) : null,
    gato_nombre: item.gato_id ? (gatoMap[item.gato_id]?.nombre ?? null) : null,
  }));
}

export async function createIncidencia(input: IncidenciaInput): Promise<Incidencia> {
  const { data, error } = await supabase
    .from('incidencias')
    .insert(input)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as Incidencia;
}

export async function updateIncidencia(id: string, input: IncidenciaInput): Promise<Incidencia> {
  const { data, error } = await supabase
    .from('incidencias')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as Incidencia;
}

export async function softDeleteIncidencia(id: string): Promise<void> {
  const { error } = await supabase
    .from('incidencias')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}