import { supabase } from '../../lib/supabase/client';
import type { Captura, CapturaInput } from './types';

export async function listCapturas(): Promise<Captura[]> {
  const [capturasRes, coloniasRes, gatosRes] = await Promise.all([
    supabase
      .from('capturas')
      .select('*')
      .is('deleted_at', null)
      .order('fecha_programada', { ascending: false }),
    supabase
      .from('colonias')
      .select('id, nombre')
      .is('deleted_at', null),
    supabase
      .from('gatos')
      .select('id, codigo, nombre')
      .is('deleted_at', null),
  ]);

  if (capturasRes.error) throw new Error(capturasRes.error.message);
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

  return ((capturasRes.data ?? []) as Captura[]).map((item) => ({
    ...item,
    colonia_nombre: item.colonia_id ? (coloniaMap[item.colonia_id] ?? 'Sin colonia') : 'Sin colonia',
    gato_codigo: item.gato_id ? (gatoMap[item.gato_id]?.codigo ?? null) : null,
    gato_nombre: item.gato_id ? (gatoMap[item.gato_id]?.nombre ?? null) : null,
  }));
}

export async function createCaptura(input: CapturaInput): Promise<Captura> {
  const { data, error } = await supabase
    .from('capturas')
    .insert(input)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as Captura;
}

export async function updateCaptura(id: string, input: CapturaInput): Promise<Captura> {
  const { data, error } = await supabase
    .from('capturas')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as Captura;
}

export async function softDeleteCaptura(id: string): Promise<void> {
  const { error } = await supabase
    .from('capturas')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}