import { supabase } from '../../lib/supabase/client';
import {
  MAPA_ESTADO_CER_A_GATO,
  type ActuacionCer,
  type ActuacionCerInput,
} from './types';

export async function listActuacionesCer(): Promise<ActuacionCer[]> {
  const [cerRes, gatosRes, coloniasRes] = await Promise.all([
    supabase
      .from('actuaciones_cer')
      .select('*')
      .is('deleted_at', null)
      .order('fecha_actuacion', { ascending: false }),
    supabase
      .from('gatos')
      .select('id, codigo, nombre')
      .is('deleted_at', null),
    supabase
      .from('colonias')
      .select('id, nombre')
      .is('deleted_at', null),
  ]);

  if (cerRes.error) throw new Error(cerRes.error.message);
  if (gatosRes.error) throw new Error(gatosRes.error.message);
  if (coloniasRes.error) throw new Error(coloniasRes.error.message);

  const gatoMap: Record<string, { codigo: string; nombre: string }> = {};
  for (const g of gatosRes.data ?? []) {
    gatoMap[g.id] = { codigo: g.codigo, nombre: g.nombre };
  }

  const coloniaMap: Record<string, string> = {};
  for (const c of coloniasRes.data ?? []) {
    coloniaMap[c.id] = c.nombre;
  }

  return ((cerRes.data ?? []) as ActuacionCer[]).map((item) => ({
    ...item,
    gato_codigo: gatoMap[item.gato_id]?.codigo ?? 'Sin código',
    gato_nombre: gatoMap[item.gato_id]?.nombre ?? 'Gato registrado',
    colonia_nombre: item.colonia_id ? (coloniaMap[item.colonia_id] ?? 'Sin colonia') : 'Sin colonia',
  }));
}

async function syncGatoCerStatus(input: ActuacionCerInput): Promise<void> {
  const nuevoEstadoGato = MAPA_ESTADO_CER_A_GATO[input.estado];
  const updatePayload: Record<string, unknown> = {
    estado_cer_actual: nuevoEstadoGato,
  };

  if (input.marcaje_realizado || input.estado === 'marcaje_auricular') {
    updatePayload.marcaje_auricular = true;
  }

  const { error } = await supabase
    .from('gatos')
    .update(updatePayload)
    .eq('id', input.gato_id);

  if (error) throw new Error(error.message);
}

export async function createActuacionCer(input: ActuacionCerInput): Promise<ActuacionCer> {
  const { data, error } = await supabase
    .from('actuaciones_cer')
    .insert(input)
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  await syncGatoCerStatus(input);
  return data as ActuacionCer;
}

export async function updateActuacionCer(
  id: string,
  input: ActuacionCerInput
): Promise<ActuacionCer> {
  const { data, error } = await supabase
    .from('actuaciones_cer')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  await syncGatoCerStatus(input);
  return data as ActuacionCer;
}

export async function softDeleteActuacionCer(id: string): Promise<void> {
  const { error } = await supabase
    .from('actuaciones_cer')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}