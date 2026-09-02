'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './AccountSidebar.module.css';

const accountNav = [
  { label: 'Mis pedidos', href: '/account/orders' },
  { label: 'Mi perfil', href: '/account' },
  { label: 'Direcciones', href: '/account/addresses' },
  { label: 'Lista de deseos', href: '/account/wishlist' },
];

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
      <path
        d="M7 4l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Sidebar del area de cuenta: tarjeta de bienvenida + navegacion entre
 * pedidos/perfil/direcciones/wishlist + cerrar sesion. AccountGuard ya
 * garantiza que solo se monta con sesion activa, pero el chequeo de
 * `user` se mantiene por seguridad.
 */
export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push('/');
  }

  if (!user) return null;

  const firstName = user.fullName.split(' ')[0];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.welcomeCard}>
        <p className={styles.welcomeEyebrow}>Bienvenido/a,</p>
        <p className={styles.welcomeName}>{firstName}</p>
        <p className={styles.welcomeText}>
          Gestiona tus pedidos, direcciones y datos personales desde aquí.
        </p>
      </div>

      <nav aria-label="Navegación de la cuenta">
        <ul className={styles.navList}>
          {accountNav.map((item) => {
            const isActive =
              item.href === '/account' ? pathname === '/account' : Boolean(pathname?.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.navLink}
                  data-active={isActive}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span>{item.label}</span>
                  <ChevronIcon />
                </Link>
              </li>
            );
          })}
          <li>
            <button type="button" className={styles.logoutLink} onClick={handleLogout}>
              Cerrar sesión
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}