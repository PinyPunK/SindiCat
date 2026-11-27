export type TipoInforme =
  | 'ficha_gato'
  | 'censo_general'
  | 'censo_colonia'
  | 'informe_cer'
  | 'historial_veterinario'
  | 'listado_incidencias';

export type OrientacionPagina = 'vertical' | 'horizontal';

export interface PlantillaInforme {
  id: TipoInforme;
  titulo: string;
  descripcion: string;
  requiereGato?: boolean;
  permiteColonia?: boolean;
  permiteFechas?: boolean;
}

export interface InformesConteos {
  colonias: number;
  gatos: number;
  actuacionesCer: number;
  registrosVet: number;
  incidencias: number;
}

export const PLANTILLAS_INFORME: PlantillaInforme[] = [
  {
    id: 'ficha_gato',
    titulo: 'Ficha individual del gato',
    descripcion: 'Datos identificativos, marcaje, colonia, historial CER y sanitario.',
    requiereGato: true,
  },
  {
    id: 'censo_general',
    titulo: 'Censo general',
    descripcion: 'Listado completo del censo histórico con estado actual y CER.',
    permiteColonia: false,
    permiteFechas: true,
  },
  {
    id: 'censo_colonia',
    titulo: 'Censo por colonia',
    descripcion: 'Relación de gatos asignados a una colonia concreta y resumen CER.',
    permiteColonia: true,
  },
  {
    id: 'informe_cer',
    titulo: 'Informe CER',
    descripcion: 'Actuaciones de captura, esterilización, marcaje y retorno.',
    permiteColonia: true,
    permiteFechas: true,
  },
  {
    id: 'historial_veterinario',
    titulo: 'Historial veterinario',
    descripcion: 'Consultas, vacunas, tratamientos, costes y seguimiento clínico.',
    requiereGato: false,
    permiteFechas: true,
  },
  {
    id: 'listado_incidencias',
    titulo: 'Listado de incidencias',
    descripcion: 'Alertas, camadas, desapariciones y avisos por estado y fecha.',
    permiteColonia: true,
    permiteFechas: true,
  },
];