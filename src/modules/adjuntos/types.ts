import type { BaseEntity } from '../../types/base';

export type EntidadAdjunto =
  | 'gato'
  | 'colonia'
  | 'actuacion_cer'
  | 'registro_veterinario'
  | 'incidencia'
  | 'acogida_adopcion';

export type TipoAdjunto = 'foto' | 'documento';

export interface Adjunto extends BaseEntity {
  owner_id: string;
  entidad: EntidadAdjunto;
  registro_id: string;
  tipo: TipoAdjunto;
  nombre_archivo: string;
  mime_type: string;
  tamano_bytes: number;
  storage_path: string;
  es_principal: boolean;
  signed_url?: string | null;
}