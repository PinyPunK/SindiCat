import type { BaseEntity } from '../../types/base';

export type TipoIncidencia =
  | 'gatos_nuevos'
  | 'desapariciones'
  | 'fallecimientos'
  | 'camadas'
  | 'lesiones'
  | 'enfermedades'
  | 'problemas_alimentacion'
  | 'problemas_vecinos'
  | 'danos_instalaciones'
  | 'presencia_otros_animales';

export type EstadoIncidencia = 'abierta' | 'en_curso' | 'resuelta';

export interface Incidencia extends BaseEntity {
  owner_id: string;
  colonia_id: string | null;
  gato_id: string | null;
  tipo: TipoIncidencia;
  estado: EstadoIncidencia;
  fecha: string;
  descripcion: string;
  colonia_nombre?: string;
  gato_codigo?: string | null;
  gato_nombre?: string | null;
}

export interface IncidenciaInput {
  colonia_id: string | null;
  gato_id: string | null;
  tipo: TipoIncidencia;
  estado: EstadoIncidencia;
  fecha: string;
  descripcion: string;
}

export const TIPO_INCIDENCIA_LABELS: Record<TipoIncidencia, string> = {
  gatos_nuevos: 'Gatos nuevos',
  desapariciones: 'Desapariciones',
  fallecimientos: 'Fallecimientos',
  camadas: 'Camadas',
  lesiones: 'Lesiones',
  enfermedades: 'Enfermedades',
  problemas_alimentacion: 'Problemas de alimentación',
  problemas_vecinos: 'Problemas con vecinos',
  danos_instalaciones: 'Daños en instalaciones',
  presencia_otros_animales: 'Presencia de otros animales',
};

export const ESTADO_INCIDENCIA_LABELS: Record<EstadoIncidencia, string> = {
  abierta: 'Abierta',
  en_curso: 'En curso',
  resuelta: 'Resuelta',
};