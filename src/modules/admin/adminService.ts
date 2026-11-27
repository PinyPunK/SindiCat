import { supabase } from '../../lib/supabase/client';
import type { RegistroAuditoria } from './types';

export async function listAuditoria(limit = 50): Promise<RegistroAuditoria[]> {
  const { data, error } = await supabase
    .from('auditoria')
    .select('id, entidad, registro_id, accion, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as RegistroAuditoria[];
}