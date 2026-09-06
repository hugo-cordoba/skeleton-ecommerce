'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './AdminHeader.module.css';

export default function AdminHeader({ siteName }: { siteName: string }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <header className={styles.header}>
      <Link href="/admin" className={styles.logo}>
        {siteName} <span className={styles.badge}>Admin</span>
      </Link>

      <div className={styles.actions}>
        <Link href="/" className={styles.storeLink}>
          Ver tienda
        </Link>
        {user && <span className={styles.userName}>{user.fullName}</span>}
        <button type="button" className={styles.logoutButton} onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}