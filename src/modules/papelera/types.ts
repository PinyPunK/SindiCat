export type TablaPapelera =
  | 'colonias'
  | 'gatos'
  | 'actuaciones_cer'
  | 'registros_veterinarios'
  | 'capturas'
  | 'incidencias'
  | 'alimentacion_mantenimiento'
  | 'acogidas_adopciones'
  | 'agenda_recordatorios';

export interface ItemPapelera {
  id: string;
  tabla: TablaPapelera;
  entidadLabel: string;
  titulo: string;
  detalle: string;
  deleted_at: string;
}

export const TABLA_LABELS: Record<TablaPapelera, string> = {
  colonias: 'Colonia',
  gatos: 'Gato (Censo)',
  actuaciones_cer: 'Actuación CER',
  registros_veterinarios: 'Registro veterinario',
  capturas: 'Captura / rescate',
  incidencias: 'Incidencia',
  alimentacion_mantenimiento: 'Alimentación',
  acogidas_adopciones: 'Acogida / adopción',
  agenda_recordatorios: 'Recordatorio',
};