'use server';

import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/admin-auth';

export { requireAdmin };

/**
 * Resultado uniforme para las mutaciones de /admin (crear/editar/borrar/
 * archivar...). Mismo patrón que ya usan subscribeToNewsletter (lib/forms.ts)
 * o login/register (AuthContext): { ok, error? } en vez de dejar que la
 * excepción llegue cruda al componente cliente.
 */
export type AdminActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Traduce los errores conocidos de Prisma a un mensaje que se puede
 * mostrar tal cual en el formulario, sin filtrar detalles internos
 * (nombre de tabla/columna) al admin.
 */
export function toActionError(error: unknown, fallback = 'Ha ocurrido un error inesperado.'): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const fields = (error.meta?.target as string[] | undefined)?.join(', ');
        return fields ? `Ya existe un registro con ese ${fields}.` : 'Ya existe un registro con esos datos.';
      }
      case 'P2003':
        return 'No se puede completar la operación: hay otros registros que dependen de este.';
      case 'P2025':
        return 'El registro no existe o ya ha sido eliminado.';
      default:
        return fallback;
    }
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

/**
 * Envuelve una mutación de admin con: comprobación de rol (requireAdmin),
 * try/catch y mapeo de errores. Las acciones de cada recurso solo tienen
 * que escribir la lógica de negocio y lanzar un Error con el mensaje que
 * quieren mostrar. Ejemplo (esto se implementa en la Fase 1, aquí solo
 * como muestra de uso):
 *
 *   export async function deleteCategoryAction(id: string) {
 *     return runAdminAction(async () => {
 *       const category = await prisma.category.findUnique({ where: { id } });
 *       if (!category) throw new Error('La categoría no existe.');
 *       const inUse = await prisma.product.count({ where: { categorySlug: category.slug } });
 *       if (inUse > 0) throw new Error(`No se puede borrar: hay ${inUse} productos en esta categoría.`);
 *       await prisma.category.delete({ where: { id } });
 *     });
 *   }
 */
export async function runAdminAction<T>(fn: () => Promise<T>): Promise<AdminActionResult<T>> {
  try {
    await requireAdmin();
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}