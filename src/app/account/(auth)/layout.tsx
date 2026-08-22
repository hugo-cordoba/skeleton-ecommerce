import Link from 'next/link';
import { siteConfig } from '@/config/site.config';
import styles from './Auth.module.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <Link href="/" className={styles.logo}>
        {siteConfig.name}
      </Link>
      <main className={styles.main}>{children}</main>
    </div>
  );
}