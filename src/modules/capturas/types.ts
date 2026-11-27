import type { BaseEntity } from '../../types/base';

export type ResultadoCaptura = 'planificada' | 'capturado' | 'fallida' | 'cancelada';

export interface Captura extends BaseEntity {
  owner_id: string;
  colonia_id: string | null;
  gato_id: string | null;
  fecha_programada: string;
  ubicacion_texto: string | null;
  latitud: number | null;
  longitud: number | null;
  resultado: ResultadoCaptura;
  responsable: string | null;
  observaciones: string | null;
  colonia_nombre?: string;
  gato_codigo?: string | null;
  gato_nombre?: string | null;
}

export interface CapturaInput {
  colonia_id: string | null;
  gato_id: string | null;
  fecha_programada: string;
  ubicacion_texto: string | null;
  latitud: number | null;
  longitud: number | null;
  resultado: ResultadoCaptura;
  responsable: string | null;
  observaciones: string | null;
}

export const RESULTADO_CAPTURA_LABELS: Record<ResultadoCaptura, string> = {
  planificada: 'Planificada',
  capturado: 'Capturado',
  fallida: 'Fallida',
  cancelada: 'Cancelada',
};