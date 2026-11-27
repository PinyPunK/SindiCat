import { supabase } from '../../lib/supabase/client';
import { compressImageFile } from './imageCompression';
import type { Adjunto, EntidadAdjunto, TipoAdjunto } from './types';

const BUCKET_NAME = 'sindicat-media';

export async function listAdjuntos(
  entidad: EntidadAdjunto,
  registroId: string
): Promise<Adjunto[]> {
  const { data, error } = await supabase
    .from('adjuntos')
    .select('*')
    .eq('entidad', entidad)
    .eq('registro_id', registroId)
    .is('deleted_at', null)
    .order('es_principal', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Adjunto[];
  const withUrls = await Promise.all(
    rows.map(async (item) => {
      const { data: urlData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(item.storage_path, 3600);
      return {
        ...item,
        signed_url: urlData?.signedUrl ?? null,
      };
    })
  );

  return withUrls;
}

export async function uploadAdjunto(params: {
  entidad: EntidadAdjunto;
  registroId: string;
  file: File;
  esPrincipal?: boolean;
}): Promise<Adjunto> {
  const { entidad, registroId, file, esPrincipal = false } = params;

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('Debes iniciar sesión para subir archivos.');
  }

  const esFoto = file.type.startsWith('image/');
  const tipo: TipoAdjunto = esFoto ? 'foto' : 'documento';
  const fileToUpload = esFoto ? await compressImageFile(file) : file;

  const safeName = fileToUpload.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${userData.user.id}/${entidad}/${registroId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileToUpload, {
      contentType: fileToUpload.type || 'application/octet-stream',
      upsert: false,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data, error: insertError } = await supabase
    .from('adjuntos')
    .insert({
      entidad,
      registro_id: registroId,
      tipo,
      nombre_archivo: fileToUpload.name,
      mime_type: fileToUpload.type || 'application/octet-stream',
      tamano_bytes: fileToUpload.size,
      storage_path: storagePath,
      es_principal: esFoto ? esPrincipal : false,
    })
    .select('*')
    .single();

  if (insertError) throw new Error(insertError.message);

  if (entidad === 'gato' && esFoto && esPrincipal) {
    await supabase
      .from('gatos')
      .update({ foto_principal_path: storagePath })
      .eq('id', registroId);
  }

  return data as Adjunto;
}

export async function setFotoPrincipal(adjunto: Adjunto): Promise<void> {
  const { error: resetError } = await supabase
    .from('adjuntos')
    .update({ es_principal: false })
    .eq('entidad', adjunto.entidad)
    .eq('registro_id', adjunto.registro_id)
    .eq('tipo', 'foto')
    .is('deleted_at', null);

  if (resetError) throw new Error(resetError.message);

  const { error: setError } = await supabase
    .from('adjuntos')
    .update({ es_principal: true })
    .eq('id', adjunto.id);

  if (setError) throw new Error(setError.message);

  if (adjunto.entidad === 'gato') {
    const { error: gatoError } = await supabase
      .from('gatos')
      .update({ foto_principal_path: adjunto.storage_path })
      .eq('id', adjunto.registro_id);

    if (gatoError) throw new Error(gatoError.message);
  }
}

export async function softDeleteAdjunto(id: string): Promise<void> {
  const { error } = await supabase
    .from('adjuntos')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}