import type { BaseEntity } from '../../types/base';

export type SexoGato = 'macho' | 'hembra' | 'desconocido';

export type EstadoCerActual =
  | 'pendiente'
  | 'captura_programada'
  | 'capturado'
  | 'en_clinica'
  | 'esterilizado'
  | 'en_recuperacion'
  | 'retornado'
  | 'no_aplica';

export type EstadoActualGato =
  | 'en_colonia'
  | 'acogida'
  | 'adoptado'
  | 'fallecido'
  | 'desaparecido'
  | 'trasladado';

export interface Gato extends BaseEntity {
  owner_id: string;
  codigo: string;
  nombre: string;
  foto_principal_path: string | null;
  sexo: SexoGato;
  edad_estimada: string | null;
  fecha_nacimiento_estimada: string | null;
  color: string | null;
  caracteristicas_fisicas: string | null;
  colonia_actual_id: string | null;
  colonia_nombre?: string | null;
  fecha_primera_observacion: string;
  microchip: string | null;
  marcaje_auricular: boolean;
  marcaje_detalle: string | null;
  estado_cer_actual: EstadoCerActual;
  estado_actual: EstadoActualGato;
  observaciones: string | null;
}

export interface GatoInput {
  nombre: string;
  sexo: SexoGato;
  edad_estimada: string | null;
  fecha_nacimiento_estimada: string | null;
  color: string | null;
  caracteristicas_fisicas: string | null;
  colonia_actual_id: string | null;
  fecha_primera_observacion: string;
  microchip: string | null;
  marcaje_auricular: boolean;
  marcaje_detalle: string | null;
  estado_cer_actual: EstadoCerActual;
  estado_actual: EstadoActualGato;
  observaciones: string | null;
  motivo_cambio_colonia?: string | null;
}

export interface HistorialColoniaItem {
  id: string;
  colonia_origen_id: string | null;
  colonia_destino_id: string | null;
  fecha_cambio: string;
  motivo: string | null;
}

export interface GatoHistorialCompleto {
  cambiosColonia: HistorialColoniaItem[];
  actuacionesCer: {
    id: string;
    estado: string;
    fecha_actuacion: string;
    clinica_veterinaria: string | null;
    observaciones: string | null;
  }[];
  registrosVet: {
    id: string;
    tipo: string;
    fecha: string;
    diagnostico_o_motivo: string;
    clinica_veterinaria: string | null;
  }[];
}