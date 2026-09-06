import { siteConfig } from '@/config/site.config';
import AdminGuard from '@/components/admin/AdminGuard/AdminGuard';
import AdminHeader from '@/components/admin/AdminHeader/AdminHeader';
import styles from './Admin.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.wrapper}>
      <AdminGuard>
        <AdminHeader siteName={siteConfig.name} />
        <main className={styles.content}>{children}</main>
      </AdminGuard>
    </div>
  );
}