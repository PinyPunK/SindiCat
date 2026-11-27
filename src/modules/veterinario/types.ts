import type { BaseEntity } from '../../types/base';

export type TipoRegistroVeterinario =
  | 'enfermedad_diagnostico'
  | 'vacunacion'
  | 'desparasitacion'
  | 'medicacion'
  | 'curacion'
  | 'intervencion'
  | 'revision';

export interface RegistroVeterinario extends BaseEntity {
  owner_id: string;
  gato_id: string;
  tipo: TipoRegistroVeterinario;
  fecha: string;
  clinica_veterinaria: string | null;
  diagnostico_o_motivo: string;
  tratamiento: string | null;
  evolucion_resultado: string | null;
  coste: number | null;
  requiere_seguimiento: boolean;
  gato_codigo?: string;
  gato_nombre?: string;
}

export interface RegistroVeterinarioInput {
  gato_id: string;
  tipo: TipoRegistroVeterinario;
  fecha: string;
  clinica_veterinaria: string | null;
  diagnostico_o_motivo: string;
  tratamiento: string | null;
  evolucion_resultado: string | null;
  coste: number | null;
  requiere_seguimiento: boolean;
}

export const TIPO_VET_LABELS: Record<TipoRegistroVeterinario, string> = {
  enfermedad_diagnostico: 'Enfermedad / diagnóstico',
  vacunacion: 'Vacunación',
  desparasitacion: 'Desparasitación',
  medicacion: 'Medicación',
  curacion: 'Curación',
  intervencion: 'Intervención',
  revision: 'Revisión',
};