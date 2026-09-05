import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { siteConfig } from '@/config/site.config';
import AdminNav from '@/components/admin/AdminNav/AdminNav';
import './admin-globals.css';

export const metadata: Metadata = {
  title: `Admin · ${siteConfig.name}`,
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect('/?authRequired=1');
  if (session.user.role !== 'ADMIN') redirect('/');

  return (
    <div className="grid min-h-screen grid-cols-1 bg-background text-foreground md:grid-cols-[240px_1fr]">
      <aside className="flex flex-col gap-6 border-b p-5 md:h-screen md:border-b-0 md:border-r md:sticky md:top-0">
        <Link href="/admin" className="flex items-baseline gap-2 text-sm font-semibold tracking-tight">
          {siteConfig.name}
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
            Admin
          </span>
        </Link>

        <AdminNav />

        <Link href="/" className="mt-auto text-sm text-muted-foreground hover:text-foreground">
          ← Volver a la tienda
        </Link>
      </aside>

      <main className="p-6 lg:p-10">{children}</main>
    </div>
  );
}