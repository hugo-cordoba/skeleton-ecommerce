'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './AdminHeader.module.css';

const adminNav = [
  { label: 'Inicio', href: '/admin' },
  { label: 'Categorías', href: '/admin/categories' },
  { label: 'Pedidos', href: '/admin/orders' },
];

export default function AdminHeader({ siteName }: { siteName: string }) {
  const pathname = usePathname();
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

      <nav aria-label="Navegación de administración">
        <ul className={styles.nav}>
          {adminNav.map((item) => {
            const isActive = item.href === '/admin' ? pathname === '/admin' : Boolean(pathname?.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link href={item.href} className={styles.navLink} data-active={isActive}>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

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