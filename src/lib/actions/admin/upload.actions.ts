'use server';

import { uploadImageToR2, deleteImageFromR2 } from '@/lib/r2';
import { runAdminAction, type AdminActionResult } from './admin-utils';

export interface UploadedImage {
  url: string;
}

/**
 * Sube una imagen de producto a R2. Se llama desde ImageUploadField con un
 * FormData que trae un único campo "file". Mismo patrón {ok, data|error}
 * que el resto de acciones de /admin.
 */
export async function uploadProductImageAction(formData: FormData): Promise<AdminActionResult<UploadedImage>> {
  return runAdminAction(async () => {
    const file = formData.get('file');
    if (!(file instanceof File) || file.size === 0) {
      throw new Error('No se ha seleccionado ningún archivo.');
    }

    const { url } = await uploadImageToR2(file, 'products');
    return { url };
  });
}

/**
 * Borra una imagen de R2. Se usa desde ProductForm al guardar, para
 * limpiar las imágenes que el admin ha quitado o reemplazado. Silenciosa:
 * si falla el borrado remoto no bloquea el guardado del producto (el dato
 * importante, la referencia en BD, ya se actualizó correctamente).
 */
export async function deleteProductImageAction(url: string): Promise<void> {
  try {
    await deleteImageFromR2(url);
  } catch (error) {
    console.error('No se ha podido borrar la imagen de R2:', url, error);
  }
}