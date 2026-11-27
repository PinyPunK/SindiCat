import { supabase } from '../../lib/supabase/client';

export interface ProximaCapturaItem {
  id: string;
  fecha_programada: string;
  ubicacion_texto: string | null;
  resultado: string;
}

export interface ActuacionRecienteItem {
  id: string;
  estado: string;
  fecha_actuacion: string;
  observaciones: string | null;
}

export interface DashboardData {
  totalColonias: number;
  totalGatos: number;
  machos: number;
  hembras: number;
  esterilizados: number;
  pendientesCer: number;
  seguimientoVeterinario: number;
  incidenciasAbiertas: number;
  proximasCapturas: ProximaCapturaItem[];
  actuacionesRecientes: ActuacionRecienteItem[];
}

const ESTADOS_ESTERILIZADOS = new Set(['esterilizado', 'en_recuperacion', 'retornado']);
const ESTADOS_PENDIENTES = new Set(['pendiente', 'captura_programada', 'capturado', 'en_clinica']);

export async function getDashboardData(): Promise<DashboardData> {
  const [
    coloniasRes,
    gatosRes,
    vetRes,
    incidenciasRes,
    capturasRes,
    actuacionesRes,
  ] = await Promise.all([
    supabase
      .from('colonias')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null),
    supabase
      .from('gatos')
      .select('sexo, estado_cer_actual')
      .is('deleted_at', null),
    supabase
      .from('registros_veterinarios')
      .select('gato_id')
      .eq('requiere_seguimiento', true)
      .is('deleted_at', null),
    supabase
      .from('incidencias')
      .select('id', { count: 'exact', head: true })
      .neq('estado', 'resuelta')
      .is('deleted_at', null),
    supabase
      .from('capturas')
      .select('id, fecha_programada, ubicacion_texto, resultado')
      .eq('resultado', 'planificada')
      .is('deleted_at', null)
      .order('fecha_programada', { ascending: true })
      .limit(5),
    supabase
      .from('actuaciones_cer')
      .select('id, estado, fecha_actuacion, observaciones')
      .is('deleted_at', null)
      .order('fecha_actuacion', { ascending: false })
      .limit(5),
  ]);

  const firstError =
    coloniasRes.error ||
    gatosRes.error ||
    vetRes.error ||
    incidenciasRes.error ||
    capturasRes.error ||
    actuacionesRes.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const gatos = gatosRes.data ?? [];
  const machos = gatos.filter((g) => g.sexo === 'macho').length;
  const hembras = gatos.filter((g) => g.sexo === 'hembra').length;
  const esterilizados = gatos.filter((g) => ESTADOS_ESTERILIZADOS.has(g.estado_cer_actual)).length;
  const pendientesCer = gatos.filter((g) => ESTADOS_PENDIENTES.has(g.estado_cer_actual)).length;

  const gatosEnSeguimiento = new Set((vetRes.data ?? []).map((r) => r.gato_id));

  return {
    totalColonias: coloniasRes.count ?? 0,
    totalGatos: gatos.length,
    machos,
    hembras,
    esterilizados,
    pendientesCer,
    seguimientoVeterinario: gatosEnSeguimiento.size,
    incidenciasAbiertas: incidenciasRes.count ?? 0,
    proximasCapturas: capturasRes.data ?? [],
    actuacionesRecientes: actuacionesRes.data ?? [],
  };
}