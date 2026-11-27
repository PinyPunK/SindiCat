import {
  LayoutDashboard,
  MapPin,
  Cat,
  ShieldCheck,
  Stethoscope,
  Crosshair,
  AlertTriangle,
  Utensils,
  HeartHandshake,
  Calendar,
  Map,
  FileText,
  Trash2,
  Lock,
  type LucideIcon,
} from 'lucide-react';

export type ModuleId =
  | 'dashboard'
  | 'colonias'
  | 'censo'
  | 'cer'
  | 'veterinario'
  | 'capturas'
  | 'incidencias'
  | 'alimentacion'
  | 'acogidas'
  | 'agenda'
  | 'mapa'
  | 'informes'
  | 'papelera'
  | 'admin';

export interface NavItem {
  id: ModuleId;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', description: 'Resumen general de colonias, censo, CER e incidencias.', icon: LayoutDashboard },
  { id: 'colonias', label: 'Colonias', description: 'Gestión de colonias felinas, ubicaciones y alimentadores.', icon: MapPin },
  { id: 'censo', label: 'Censo felino', description: 'Registro individual de gatos, fichas y galería fotográfica.', icon: Cat },
  { id: 'cer', label: 'Control CER', description: 'Seguimiento avanzado de capturas, esterilizaciones y retornos.', icon: ShieldCheck },
  { id: 'veterinario', label: 'Veterinario', description: 'Historial sanitario, vacunas, tratamientos e informes.', icon: Stethoscope },
  { id: 'capturas', label: 'Capturas', description: 'Planificación y seguimiento de capturas y rescates.', icon: Crosshair },
  { id: 'incidencias', label: 'Incidencias', description: 'Registro de alertas, desapariciones, camadas y avisos.', icon: AlertTriangle },
  { id: 'alimentacion', label: 'Alimentación', description: 'Control de pienso, agua, limpieza y comederos.', icon: Utensils },
  { id: 'acogidas', label: 'Acogidas y adopciones', description: 'Control de entradas, salidas, adopciones y seguimiento.', icon: HeartHandshake },
  { id: 'agenda', label: 'Agenda', description: 'Recordatorios de capturas, revisiones y actuaciones.', icon: Calendar },
  { id: 'mapa', label: 'Mapa', description: 'Mapa interactivo privado de colonias y puntos de alimentación.', icon: Map },
  { id: 'informes', label: 'Informes PDF', description: 'Generación de fichas individuales, listados y exportaciones.', icon: FileText },
  { id: 'papelera', label: 'Papelera', description: 'Recuperación o borrado definitivo controlado de registros.', icon: Trash2 },
  { id: 'admin', label: 'Administración privada', description: 'Copias de seguridad, auditoría y ajustes de cuenta.', icon: Lock },
];