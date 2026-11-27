import { supabase } from '../../lib/supabase/client';
import type { Gato, GatoHistorialCompleto, GatoInput } from './types';

export async function listGatos(): Promise<Gato[]> {
  const [gatosRes, coloniasRes] = await Promise.all([
    supabase
      .from('gatos')
      .select('*')
      .is('deleted_at', null)
      .order('codigo', { ascending: false }),
    supabase
      .from('colonias')
      .select('id, nombre')
      .is('deleted_at', null),
  ]);

  if (gatosRes.error) throw new Error(gatosRes.error.message);
  if (coloniasRes.error) throw new Error(coloniasRes.error.message);

  const coloniaMap: Record<string, string> = {};
  for (const col of coloniasRes.data ?? []) {
    coloniaMap[col.id] = col.nombre;
  }

  return ((gatosRes.data ?? []) as Gato[]).map((gato) => ({
    ...gato,
    colonia_nombre: gato.colonia_actual_id ? (coloniaMap[gato.colonia_actual_id] ?? 'Sin colonia') : 'Sin colonia',
  }));
}

export async function createGato(input: GatoInput): Promise<Gato> {
  const { motivo_cambio_colonia: _motivo, ...payload } = input;
  const { data, error } = await supabase
    .from('gatos')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as Gato;
}

export async function updateGato(
  id: string,
  coloniaAnteriorId: string | null,
  input: GatoInput
): Promise<Gato> {
  const { motivo_cambio_colonia, ...payload } = input;

  const { data, error } = await supabase
    .from('gatos')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  if (coloniaAnteriorId !== payload.colonia_actual_id) {
    const { error: histError } = await supabase.from('historial_colonias_gato').insert({
      gato_id: id,
      colonia_origen_id: coloniaAnteriorId,
      colonia_destino_id: payload.colonia_actual_id,
      fecha_cambio: new Date().toISOString().slice(0, 10),
      motivo: motivo_cambio_colonia?.trim() || 'Cambio de colonia desde ficha del censo',
    });
    if (histError) throw new Error(histError.message);
  }

  return data as Gato;
}

export async function softDeleteGato(id: string): Promise<void> {
  const { error } = await supabase
    .from('gatos')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function getGatoHistorial(gatoId: string): Promise<GatoHistorialCompleto> {
  const [coloniasRes, cerRes, vetRes] = await Promise.all([
    supabase
      .from('historial_colonias_gato')
      .select('id, colonia_origen_id, colonia_destino_id, fecha_cambio, motivo')
      .eq('gato_id', gatoId)
      .is('deleted_at', null)
      .order('fecha_cambio', { ascending: false }),
    supabase
      .from('actuaciones_cer')
      .select('id, estado, fecha_actuacion, clinica_veterinaria, observaciones')
      .eq('gato_id', gatoId)
      .is('deleted_at', null)
      .order('fecha_actuacion', { ascending: false }),
    supabase
      .from('registros_veterinarios')
      .select('id, tipo, fecha, diagnostico_o_motivo, clinica_veterinaria')
      .eq('gato_id', gatoId)
      .is('deleted_at', null)
      .order('fecha', { ascending: false }),
  ]);

  if (coloniasRes.error) throw new Error(coloniasRes.error.message);
  if (cerRes.error) throw new Error(cerRes.error.message);
  if (vetRes.error) throw new Error(vetRes.error.message);

  return {
    cambiosColonia: coloniasRes.data ?? [],
    actuacionesCer: cerRes.data ?? [],
    registrosVet: vetRes.data ?? [],
  };
}