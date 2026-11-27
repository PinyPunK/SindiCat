import { supabase } from '../../lib/supabase/client';
import type { AcogidaAdopcion, AcogidaAdopcionInput } from './types';

export async function listAcogidasAdopciones(): Promise<AcogidaAdopcion[]> {
  const [acogRes, gatosRes] = await Promise.all([
    supabase
      .from('acogidas_adopciones')
      .select('*')
      .is('deleted_at', null)
      .order('fecha_inicio', { ascending: false }),
    supabase
      .from('gatos')
      .select('id, codigo, nombre')
      .is('deleted_at', null),
  ]);

  if (acogRes.error) throw new Error(acogRes.error.message);
  if (gatosRes.error) throw new Error(gatosRes.error.message);

  const gatoMap: Record<string, { codigo: string; nombre: string }> = {};
  for (const g of gatosRes.data ?? []) {
    gatoMap[g.id] = { codigo: g.codigo, nombre: g.nombre };
  }

  return ((acogRes.data ?? []) as AcogidaAdopcion[]).map((item) => ({
    ...item,
    gato_codigo: gatoMap[item.gato_id]?.codigo ?? 'Sin código',
    gato_nombre: gatoMap[item.gato_id]?.nombre ?? 'Gato registrado',
  }));
}

async function syncGatoEstado(input: AcogidaAdopcionInput): Promise<void> {
  if (input.estado !== 'activa') return;
  const nuevoEstado = input.tipo === 'adopcion' ? 'adoptado' : 'acogida';
  const { error } = await supabase
    .from('gatos')
    .update({ estado_actual: nuevoEstado })
    .eq('id', input.gato_id);

  if (error) throw new Error(error.message);
}

export async function createAcogidaAdopcion(
  input: AcogidaAdopcionInput
): Promise<AcogidaAdopcion> {
  const { data, error } = await supabase
    .from('acogidas_adopciones')
    .insert(input)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  await syncGatoEstado(input);
  return data as AcogidaAdopcion;
}

export async function updateAcogidaAdopcion(
  id: string,
  input: AcogidaAdopcionInput
): Promise<AcogidaAdopcion> {
  const { data, error } = await supabase
    .from('acogidas_adopciones')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  await syncGatoEstado(input);
  return data as AcogidaAdopcion;
}

export async function softDeleteAcogidaAdopcion(id: string): Promise<void> {
  const { error } = await supabase
    .from('acogidas_adopciones')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}