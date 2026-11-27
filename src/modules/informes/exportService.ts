import { supabase } from '../../lib/supabase/client';
import type { OrientacionPagina, TipoInforme } from './types';

export interface InformeConfig {
  tipo: TipoInforme;
  coloniaId?: string;
  gatoId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  incluirFotos: boolean;
  orientacion: OrientacionPagina;
}

interface TablaExportable {
  titulo: string;
  subtitulo: string;
  nombreArchivo: string;
  columnas: string[];
  filas: string[][];
  fotoDataUrl?: string | null;
}

function formatFecha(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('es-ES');
}

function dentroDeRango(fechaIso: string | null | undefined, desde?: string, hasta?: string): boolean {
  if (!fechaIso) return true;
  const f = fechaIso.slice(0, 10);
  if (desde && f < desde) return false;
  if (hasta && f > hasta) return false;
  return true;
}

async function fetchImageAsDataUrl(storagePath: string): Promise<string | null> {
  try {
    const { data } = await supabase.storage
      .from('sindicat-media')
      .createSignedUrl(storagePath, 300);
    if (!data?.signedUrl) return null;

    const response = await fetch(data.signedUrl);
    if (!response.ok) return null;
    const blob = await response.blob();

    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function buildDatosInforme(config: InformeConfig): Promise<TablaExportable> {
  const hoy = new Date().toISOString().slice(0, 10);

  const [coloniasRes, gatosRes] = await Promise.all([
    supabase.from('colonias').select('id, codigo, nombre, municipio').is('deleted_at', null),
    supabase.from('gatos').select('*').is('deleted_at', null).order('codigo', { ascending: true }),
  ]);

  if (coloniasRes.error) throw new Error(coloniasRes.error.message);
  if (gatosRes.error) throw new Error(gatosRes.error.message);

  const coloniaMap: Record<string, string> = {};
  for (const c of coloniasRes.data ?? []) {
    coloniaMap[c.id] = `${c.codigo} · ${c.nombre}`;
  }

  const gatoMap: Record<string, { codigo: string; nombre: string }> = {};
  for (const g of gatosRes.data ?? []) {
    gatoMap[g.id] = { codigo: g.codigo, nombre: g.nombre };
  }

  if (config.tipo === 'ficha_gato') {
    const gato = (gatosRes.data ?? []).find((g) => g.id === config.gatoId);
    if (!gato) throw new Error('Selecciona un gato válido para generar su ficha.');

    const [cerRes, vetRes] = await Promise.all([
      supabase
        .from('actuaciones_cer')
        .select('estado, fecha_actuacion, clinica_veterinaria, resultado_intervencion')
        .eq('gato_id', gato.id)
        .is('deleted_at', null)
        .order('fecha_actuacion', { ascending: false }),
      supabase
        .from('registros_veterinarios')
        .select('tipo, fecha, diagnostico_o_motivo, tratamiento')
        .eq('gato_id', gato.id)
        .is('deleted_at', null)
        .order('fecha', { ascending: false }),
    ]);

    const fotoDataUrl =
      config.incluirFotos && gato.foto_principal_path
        ? await fetchImageAsDataUrl(gato.foto_principal_path)
        : null;

    const filas: string[][] = [
      ['Código', gato.codigo],
      ['Nombre', gato.nombre],
      ['Colonia actual', gato.colonia_actual_id ? (coloniaMap[gato.colonia_actual_id] ?? '—') : 'Sin colonia'],
      ['Estado actual', String(gato.estado_actual).replaceAll('_', ' ')],
      ['Estado CER', String(gato.estado_cer_actual).replaceAll('_', ' ')],
      ['Sexo / Color', `${gato.sexo} · ${gato.color || 'No especificado'}`],
      ['Marcaje auricular', gato.marcaje_auricular ? `Sí (${gato.marcaje_detalle || 'Realizado'})` : 'No'],
      ['Microchip', gato.microchip || 'No registrado'],
      ['Primera observación', formatFecha(gato.fecha_primera_observacion)],
      ['Observaciones', gato.observaciones || '—'],
    ];

    for (const a of cerRes.data ?? []) {
      filas.push([
        `CER · ${formatFecha(a.fecha_actuacion)}`,
        `${String(a.estado).replaceAll('_', ' ')}${a.clinica_veterinaria ? ` (${a.clinica_veterinaria})` : ''}`,
      ]);
    }
    for (const v of vetRes.data ?? []) {
      filas.push([
        `Vet · ${formatFecha(v.fecha)}`,
        `${String(v.tipo).replaceAll('_', ' ')}: ${v.diagnostico_o_motivo}`,
      ]);
    }

    return {
      titulo: `Ficha individual · ${gato.codigo} ${gato.nombre}`,
      subtitulo: `Emitido el ${formatFecha(hoy)}`,
      nombreArchivo: `SindiCat_Ficha_${gato.codigo}_${hoy}`,
      columnas: ['Campo / Evento', 'Detalle'],
      filas,
      fotoDataUrl,
    };
  }

  if (config.tipo === 'censo_general' || config.tipo === 'censo_colonia') {
    const filtrados = (gatosRes.data ?? []).filter((g) => {
      if (config.tipo === 'censo_colonia' && config.coloniaId && g.colonia_actual_id !== config.coloniaId) {
        return false;
      }
      return dentroDeRango(g.fecha_primera_observacion, config.fechaDesde, config.fechaHasta);
    });

    const subtituloColonia =
      config.tipo === 'censo_colonia' && config.coloniaId
        ? coloniaMap[config.coloniaId] ?? 'Colonia seleccionada'
        : 'Todas las colonias';

    return {
      titulo: config.tipo === 'censo_colonia' ? 'Censo felino por colonia' : 'Censo felino general',
      subtitulo: `${subtituloColonia} · ${filtrados.length} gatos · Emitido el ${formatFecha(hoy)}`,
      nombreArchivo: `SindiCat_${config.tipo}_${hoy}`,
      columnas: ['Código', 'Nombre', 'Colonia', 'Sexo', 'Estado', 'CER', 'Marcaje'],
      filas: filtrados.map((g) => [
        g.codigo,
        g.nombre,
        g.colonia_actual_id ? (coloniaMap[g.colonia_actual_id] ?? '—') : 'Sin colonia',
        g.sexo,
        String(g.estado_actual).replaceAll('_', ' '),
        String(g.estado_cer_actual).replaceAll('_', ' '),
        g.marcaje_auricular ? 'Sí' : 'No',
      ]),
    };
  }

  if (config.tipo === 'informe_cer') {
    const { data, error } = await supabase
      .from('actuaciones_cer')
      .select('*')
      .is('deleted_at', null)
      .order('fecha_actuacion', { ascending: false });
    if (error) throw new Error(error.message);

    const filtrados = (data ?? []).filter((a) => {
      if (config.coloniaId && a.colonia_id !== config.coloniaId) return false;
      return dentroDeRango(a.fecha_actuacion, config.fechaDesde, config.fechaHasta);
    });

    return {
      titulo: 'Informe de actuaciones CER',
      subtitulo: `${filtrados.length} actuaciones · Emitido el ${formatFecha(hoy)}`,
      nombreArchivo: `SindiCat_Informe_CER_${hoy}`,
      columnas: ['Fecha', 'Gato', 'Colonia', 'Fase CER', 'Clínica', 'Marcaje'],
      filas: filtrados.map((a) => [
        formatFecha(a.fecha_actuacion),
        gatoMap[a.gato_id] ? `${gatoMap[a.gato_id].codigo} · ${gatoMap[a.gato_id].nombre}` : '—',
        a.colonia_id ? (coloniaMap[a.colonia_id] ?? '—') : 'Sin colonia',
        String(a.estado).replaceAll('_', ' '),
        a.clinica_veterinaria || '—',
        a.marcaje_realizado ? 'Sí' : 'No',
      ]),
    };
  }

  if (config.tipo === 'historial_veterinario') {
    const { data, error } = await supabase
      .from('registros_veterinarios')
      .select('*')
      .is('deleted_at', null)
      .order('fecha', { ascending: false });
    if (error) throw new Error(error.message);

    const filtrados = (data ?? []).filter((v) =>
      dentroDeRango(v.fecha, config.fechaDesde, config.fechaHasta)
    );

    return {
      titulo: 'Historial veterinario',
      subtitulo: `${filtrados.length} registros · Emitido el ${formatFecha(hoy)}`,
      nombreArchivo: `SindiCat_Veterinario_${hoy}`,
      columnas: ['Fecha', 'Gato', 'Tipo', 'Motivo / Diagnóstico', 'Clínica', 'Coste'],
      filas: filtrados.map((v) => [
        formatFecha(v.fecha),
        gatoMap[v.gato_id] ? `${gatoMap[v.gato_id].codigo} · ${gatoMap[v.gato_id].nombre}` : '—',
        String(v.tipo).replaceAll('_', ' '),
        v.diagnostico_o_motivo,
        v.clinica_veterinaria || '—',
        v.coste != null ? `${Number(v.coste).toFixed(2)} €` : '—',
      ]),
    };
  }

  // listado_incidencias
  const { data, error } = await supabase
    .from('incidencias')
    .select('*')
    .is('deleted_at', null)
    .order('fecha', { ascending: false });
  if (error) throw new Error(error.message);

  const filtrados = (data ?? []).filter((i) => {
    if (config.coloniaId && i.colonia_id !== config.coloniaId) return false;
    return dentroDeRango(i.fecha, config.fechaDesde, config.fechaHasta);
  });

  return {
    titulo: 'Listado de incidencias',
    subtitulo: `${filtrados.length} incidencias · Emitido el ${formatFecha(hoy)}`,
    nombreArchivo: `SindiCat_Incidencias_${hoy}`,
    columnas: ['Fecha', 'Tipo', 'Estado', 'Colonia', 'Descripción'],
    filas: filtrados.map((i) => [
      formatFecha(i.fecha),
      String(i.tipo).replaceAll('_', ' '),
      String(i.estado).replaceAll('_', ' '),
      i.colonia_id ? (coloniaMap[i.colonia_id] ?? '—') : 'Sin colonia',
      i.descripcion,
    ]),
  };
}

export async function generarInformePdf(config: InformeConfig): Promise<string> {
  const datos = await buildDatosInforme(config);

  const pdfMakeModule = await import('pdfmake/build/pdfmake');
  const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

  const pdfMake = (pdfMakeModule.default ?? pdfMakeModule) as unknown as {
    vfs?: Record<string, string>;
    addVirtualFileSystem?: (vfs: Record<string, string>) => void;
    createPdf: (docDefinition: unknown) => { download: (filename: string) => void };
  };

  const fontsObj = (pdfFontsModule.default ?? pdfFontsModule) as unknown as Record<string, unknown>;
  const vfs =
    (fontsObj?.pdfMake as { vfs?: Record<string, string> } | undefined)?.vfs ??
    (fontsObj?.vfs as Record<string, string> | undefined) ??
    (fontsObj as Record<string, string>);

  if (typeof pdfMake.addVirtualFileSystem === 'function') {
    pdfMake.addVirtualFileSystem(vfs);
  } else {
    pdfMake.vfs = vfs;
  }

  const body = [
    datos.columnas.map((col) => ({ text: col, bold: true, color: '#FFFFFF', fillColor: '#2E6F5E' })),
    ...(datos.filas.length > 0
      ? datos.filas.map((fila) => fila.map((celda) => ({ text: celda || '—', fontSize: 9 })))
      : [[{ text: 'Sin registros para los filtros seleccionados.', colSpan: datos.columnas.length, italics: true }, ...Array(datos.columnas.length - 1).fill('')]]),
  ];

  const content: unknown[] = [
    { text: 'SindiCat · Gestión de Colonias Felinas', fontSize: 10, color: '#2E6F5E', bold: true },
    { text: datos.titulo, fontSize: 16, bold: true, margin: [0, 4, 0, 2] },
    { text: datos.subtitulo, fontSize: 9, color: '#555555', margin: [0, 0, 0, 12] },
  ];

  if (datos.fotoDataUrl) {
    content.push({
      image: datos.fotoDataUrl,
      fit: [160, 160],
      margin: [0, 0, 0, 12],
    });
  }

  content.push({
    table: {
      headerRows: 1,
      widths: datos.columnas.map(() => '*'),
      body,
    },
    layout: 'lightHorizontalLines',
  });

  const docDefinition = {
    pageSize: 'A4',
    pageOrientation: config.orientacion === 'horizontal' ? 'landscape' : 'portrait',
    pageMargins: [32, 36, 32, 36],
    content,
    defaultStyle: { fontSize: 10 },
  };

  const filename = `${datos.nombreArchivo}.pdf`;
  pdfMake.createPdf(docDefinition).download(filename);
  return filename;
}

function escapeCsvCell(value: string): string {
  const clean = value.replace(/\r?\n/g, ' ').replace(/"/g, '""');
  return `"${clean}"`;
}

export async function exportarInformeCsv(config: InformeConfig): Promise<string> {
  const datos = await buildDatosInforme(config);
  const lines = [
    datos.columnas.map(escapeCsvCell).join(';'),
    ...datos.filas.map((row) => row.map(escapeCsvCell).join(';')),
  ];

  const csvContent = `\uFEFF${lines.join('\r\n')}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const filename = `${datos.nombreArchivo}.csv`;
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return filename;
}