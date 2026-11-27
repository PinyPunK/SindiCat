export interface RegistroAuditoria {
  id: string;
  entidad: string;
  registro_id: string | null;
  accion: string;
  created_at: string;
}