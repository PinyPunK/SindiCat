import { supabase } from '../../lib/supabase/client';
import type { RegistroVeterinario, RegistroVeterinarioInput } from './types';

export async function listRegistrosVeterinarios(): Promise<RegistroVeterinario[]> {
  const [vetRes, gatosRes] = await Promise.all([
    supabase
      .from('registros_veterinarios')
      .select('*')
      .is('deleted_at', null)
      .order('fecha', { ascending: false }),
    supabase
      .from('gatos')
      .select('id, codigo, nombre')
      .is('deleted_at', null),
  ]);

  if (vetRes.error) throw new Error(vetRes.error.message);
  if (gatosRes.error) throw new Error(gatosRes.error.message);

  const gatoMap: Record<string, { codigo: string; nombre: string }> = {};
  for (const g of gatosRes.data ?? []) {
    gatoMap[g.id] = { codigo: g.codigo, nombre: g.nombre };
  }

  return ((vetRes.data ?? []) as RegistroVeterinario[]).map((item) => ({
    ...item,
    coste: item.coste != null ? Number(item.coste) : null,
    gato_codigo: gatoMap[item.gato_id]?.codigo ?? 'Sin código',
    gato_nombre: gatoMap[item.gato_id]?.nombre ?? 'Gato registrado',
  }));
}

export async function createRegistroVeterinario(
  input: RegistroVeterinarioInput
): Promise<RegistroVeterinario> {
  const { data, error } = await supabase
    .from('registros_veterinarios')
    .insert(input)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as RegistroVeterinario;
}

export async function updateRegistroVeterinario(
  id: string,
  input: RegistroVeterinarioInput
): Promise<RegistroVeterinario> {
  const { data, error } = await supabase
    .from('registros_veterinarios')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as RegistroVeterinario;
}

export async function softDeleteRegistroVeterinario(id: string): Promise<void> {
  const { error } = await supabase
    .from('registros_veterinarios')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}