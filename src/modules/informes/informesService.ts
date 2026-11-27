import { supabase } from '../../lib/supabase/client';
import type { InformesConteos } from './types';

export async function getInformesConteos(): Promise<InformesConteos> {
  const [coloniasRes, gatosRes, cerRes, vetRes, incRes] = await Promise.all([
    supabase.from('colonias').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('gatos').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('actuaciones_cer').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('registros_veterinarios').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('incidencias').select('id', { count: 'exact', head: true }).is('deleted_at', null),
  ]);

  const firstError =
    coloniasRes.error || gatosRes.error || cerRes.error || vetRes.error || incRes.error;
  if (firstError) throw new Error(firstError.message);

  return {
    colonias: coloniasRes.count ?? 0,
    gatos: gatosRes.count ?? 0,
    actuacionesCer: cerRes.count ?? 0,
    registrosVet: vetRes.count ?? 0,
    incidencias: incRes.count ?? 0,
  };
}