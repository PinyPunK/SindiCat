import type { BaseEntity } from '../../types/base';

export type TipoAlimentacion =
  | 'alimentacion'
  | 'reposicion_agua'
  | 'limpieza'
  | 'control_comederos'
  | 'materiales_existencias';

export interface RegistroAlimentacion extends BaseEntity {
  owner_id: string;
  colonia_id: string | null;
  tipo: TipoAlimentacion;
  fecha: string;
  consumo_pienso_kg: number | null;
  agua_repuesta: boolean;
  limpieza_realizada: boolean;
  estado_comederos: string | null;
  materiales_existencias: string | null;
  responsable: string | null;
  observaciones: string | null;
  colonia_nombre?: string;
}

export interface RegistroAlimentacionInput {
  colonia_id: string | null;
  tipo: TipoAlimentacion;
  fecha: string;
  consumo_pienso_kg: number | null;
  agua_repuesta: boolean;
  limpieza_realizada: boolean;
  estado_comederos: string | null;
  materiales_existencias: string | null;
  responsable: string | null;
  observaciones: string | null;
}

export const TIPO_ALIMENTACION_LABELS: Record<TipoAlimentacion, string> = {
  alimentacion: 'Alimentación',
  reposicion_agua: 'Reposición de agua',
  limpieza: 'Limpieza',
  control_comederos: 'Control de comederos',
  materiales_existencias: 'Materiales y existencias',
};