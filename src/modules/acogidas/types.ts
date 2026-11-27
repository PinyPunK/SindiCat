import type { BaseEntity } from '../../types/base';

export type TipoAcogidaAdopcion = 'acogida' | 'adopcion';
export type EstadoAcogidaAdopcion = 'activa' | 'finalizada' | 'cancelada';

export interface AcogidaAdopcion extends BaseEntity {
  owner_id: string;
  gato_id: string;
  tipo: TipoAcogidaAdopcion;
  estado: EstadoAcogidaAdopcion;
  fecha_inicio: string;
  fecha_fin: string | null;
  persona_destino: string;
  telefono_contacto: string | null;
  seguimiento: string | null;
  gato_codigo?: string;
  gato_nombre?: string;
}

export interface AcogidaAdopcionInput {
  gato_id: string;
  tipo: TipoAcogidaAdopcion;
  estado: EstadoAcogidaAdopcion;
  fecha_inicio: string;
  fecha_fin: string | null;
  persona_destino: string;
  telefono_contacto: string | null;
  seguimiento: string | null;
}

export const TIPO_ACOGIDA_LABELS: Record<TipoAcogidaAdopcion, string> = {
  acogida: 'Acogida',
  adopcion: 'Adopción',
};

export const ESTADO_ACOGIDA_LABELS: Record<EstadoAcogidaAdopcion, string> = {
  activa: 'Activa',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};