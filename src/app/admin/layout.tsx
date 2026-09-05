import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { siteConfig } from '@/config/site.config';
import AdminNav from '@/components/admin/AdminNav/AdminNav';
import styles from './Admin.module.css';

export const metadata: Metadata = {
  title: `Admin · ${siteConfig.name}`,
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Segunda barrera ademas del middleware: evita cualquier parpadeo de
  // contenido protegido y cubre el caso de que el middleware no llegue
  // a ejecutarse (ej. navegacion cliente con cache de router).
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect('/?authRequired=1');
  if (session.user.role !== 'ADMIN') redirect('/');

  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <Link href="/admin" className={styles.logo}>
          {siteConfig.name}
          <span className={styles.badge}>Admin</span>
        </Link>

        <AdminNav />

        <Link href="/" className={styles.backLink}>
          ← Volver a la tienda
        </Link>
      </aside>

      <main className={styles.content}>{children}</main>
    </div>
  );
}