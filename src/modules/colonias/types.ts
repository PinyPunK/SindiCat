import type { BaseEntity } from '../../types/base';

export type EstadoColonia = 'activa' | 'inactiva';

export interface Colonia extends BaseEntity {
  owner_id: string;
  codigo: string;
  nombre: string;
  municipio: string;
  barrio: string | null;
  direccion: string | null;
  latitud: number | null;
  longitud: number | null;
  foto_principal_path: string | null;
  fecha_registro: string;
  alimentadores: string | null;
  observaciones: string | null;
  estado: EstadoColonia;
  total_gatos?: number;
}

export interface ColoniaInput {
  codigo: string;
  nombre: string;
  municipio: string;
  barrio: string | null;
  direccion: string | null;
  latitud: number | null;
  longitud: number | null;
  fecha_registro: string;
  alimentadores: string | null;
  observaciones: string | null;
  estado: EstadoColonia;
}

export interface ColoniaHistorialItem {
  id: string;
  origen: 'CER' | 'Incidencia';
  fecha: string;
  titulo: string;
  detalle: string | null;
}