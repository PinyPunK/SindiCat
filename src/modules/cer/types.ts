import type { BaseEntity } from '../../types/base';
import type { EstadoCerActual } from '../censo/types';

export type EstadoActuacionCer =
  | 'esterilizacion_pendiente'
  | 'captura_programada'
  | 'captura_realizada'
  | 'captura_fallida'
  | 'traslado_clinica'
  | 'intervencion_quirurgica'
  | 'marcaje_auricular'
  | 'recuperacion'
  | 'retorno_colonia'
  | 'seguimiento_posterior';

export interface ActuacionCer extends BaseEntity {
  owner_id: string;
  gato_id: string;
  colonia_id: string | null;
  estado: EstadoActuacionCer;
  fecha_actuacion: string;
  clinica_veterinaria: string | null;
  resultado_intervencion: string | null;
  marcaje_realizado: boolean;
  observaciones: string | null;
  gato_nombre?: string;
  gato_codigo?: string;
  colonia_nombre?: string;
}

export interface ActuacionCerInput {
  gato_id: string;
  colonia_id: string | null;
  estado: EstadoActuacionCer;
  fecha_actuacion: string;
  clinica_veterinaria: string | null;
  resultado_intervencion: string | null;
  marcaje_realizado: boolean;
  observaciones: string | null;
}

export const ESTADO_CER_LABELS: Record<EstadoActuacionCer, string> = {
  esterilizacion_pendiente: 'Esterilización pendiente',
  captura_programada: 'Captura programada',
  captura_realizada: 'Captura realizada',
  captura_fallida: 'Captura fallida',
  traslado_clinica: 'Traslado a clínica',
  intervencion_quirurgica: 'Intervención quirúrgica',
  marcaje_auricular: 'Marcaje auricular',
  recuperacion: 'Recuperación',
  retorno_colonia: 'Retorno a la colonia',
  seguimiento_posterior: 'Seguimiento posterior',
};

export const MAPA_ESTADO_CER_A_GATO: Record<EstadoActuacionCer, EstadoCerActual> = {
  esterilizacion_pendiente: 'pendiente',
  captura_programada: 'captura_programada',
  captura_realizada: 'capturado',
  captura_fallida: 'pendiente',
  traslado_clinica: 'en_clinica',
  intervencion_quirurgica: 'esterilizado',
  marcaje_auricular: 'esterilizado',
  recuperacion: 'en_recuperacion',
  retorno_colonia: 'retornado',
  seguimiento_posterior: 'retornado',
};