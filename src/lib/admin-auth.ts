import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * Guard para las Server Actions de /admin. No sustituye al middleware (esa es
 * la primera barrera, a nivel de ruta): esto evita que una action admin se
 * pueda ejecutar si alguien la llama directamente sin pasar por una página
 * protegida, o si el rol cambia a media sesión. Cuando montemos el CRUD, cada
 * action de admin empieza con `await requireAdmin()`, igual que las de cliente
 * ya empiezan con `requireUserId()`.
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('No autorizado: se requiere rol ADMIN.');
  }
  return session.user;
}