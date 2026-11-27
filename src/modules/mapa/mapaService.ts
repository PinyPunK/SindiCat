import { supabase } from '../../lib/supabase/client';
import type { MapaResumen, PuntoMapa } from './types';

export async function getMapaResumen(): Promise<MapaResumen> {
  const [coloniasRes, gatosRes, capturasRes] = await Promise.all([
    supabase
      .from('colonias')
      .select('id, codigo, nombre, municipio, barrio, latitud, longitud, estado')
      .is('deleted_at', null),
    supabase
      .from('gatos')
      .select('colonia_actual_id')
      .is('deleted_at', null),
    supabase
      .from('capturas')
      .select('id, ubicacion_texto, latitud, longitud, fecha_programada, resultado')
      .is('deleted_at', null),
  ]);

  if (coloniasRes.error) throw new Error(coloniasRes.error.message);
  if (gatosRes.error) throw new Error(gatosRes.error.message);
  if (capturasRes.error) throw new Error(capturasRes.error.message);

  const conteoGatos: Record<string, number> = {};
  for (const g of gatosRes.data ?? []) {
    if (g.colonia_actual_id) {
      conteoGatos[g.colonia_actual_id] = (conteoGatos[g.colonia_actual_id] ?? 0) + 1;
    }
  }

  const puntos: PuntoMapa[] = [];
  let coloniasSinGps = 0;
  let capturasSinGps = 0;

  for (const c of coloniasRes.data ?? []) {
    if (c.latitud == null || c.longitud == null) {
      coloniasSinGps += 1;
      continue;
    }
    puntos.push({
      id: `col-${c.id}`,
      origenId: c.id,
      tipo: c.estado === 'activa' ? 'colonia_activa' : 'colonia_inactiva',
      titulo: `${c.codigo} · ${c.nombre}`,
      subtitulo: c.barrio ? `${c.municipio} (${c.barrio})` : c.municipio,
      latitud: Number(c.latitud),
      longitud: Number(c.longitud),
      totalGatos: conteoGatos[c.id] ?? 0,
    });
  }

  for (const cap of capturasRes.data ?? []) {
    if (cap.latitud == null || cap.longitud == null) {
      capturasSinGps += 1;
      continue;
    }
    puntos.push({
      id: `cap-${cap.id}`,
      origenId: cap.id,
      tipo: 'captura',
      titulo: cap.ubicacion_texto || 'Punto de captura',
      subtitulo: `Estado: ${cap.resultado}`,
      latitud: Number(cap.latitud),
      longitud: Number(cap.longitud),
      fecha: cap.fecha_programada,
    });
  }

  return { puntos, coloniasSinGps, capturasSinGps };
}