import type { BaseEntity } from '../../types/base';

export type TipoRecordatorio =
  | 'captura'
  | 'revision_veterinaria'
  | 'medicacion'
  | 'vacunacion'
  | 'alimentacion'
  | 'actuacion_cer'
  | 'otro';

export type PrioridadRecordatorio = 'baja' | 'media' | 'alta';

export interface Recordatorio extends BaseEntity {
  owner_id: string;
  colonia_id: string | null;
  gato_id: string | null;
  titulo: string;
  tipo: TipoRecordatorio;
  fecha_recordatorio: string;
  prioridad: PrioridadRecordatorio;
  completado: boolean;
  notas: string | null;
  colonia_nombre?: string;
  gato_codigo?: string | null;
  gato_nombre?: string | null;
}

export interface RecordatorioInput {
  colonia_id: string | null;
  gato_id: string | null;
  titulo: string;
  tipo: TipoRecordatorio;
  fecha_recordatorio: string;
  prioridad: PrioridadRecordatorio;
  completado: boolean;
  notas: string | null;
}

export const TIPO_RECORDATORIO_LABELS: Record<TipoRecordatorio, string> = {
  captura: 'Captura',
  revision_veterinaria: 'Revisión veterinaria',
  medicacion: 'Medicación',
  vacunacion: 'Vacunación',
  alimentacion: 'Alimentación',
  actuacion_cer: 'Actuación CER',
  otro: 'Otro',
};

export const PRIORIDAD_LABELS: Record<PrioridadRecordatorio, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
};