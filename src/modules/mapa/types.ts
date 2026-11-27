export type TipoPuntoMapa = 'colonia_activa' | 'colonia_inactiva' | 'captura';

export interface PuntoMapa {
  id: string;
  origenId: string;
  tipo: TipoPuntoMapa;
  titulo: string;
  subtitulo: string;
  latitud: number;
  longitud: number;
  totalGatos?: number;
  fecha?: string;
}

export interface MapaResumen {
  puntos: PuntoMapa[];
  coloniasSinGps: number;
  capturasSinGps: number;
}