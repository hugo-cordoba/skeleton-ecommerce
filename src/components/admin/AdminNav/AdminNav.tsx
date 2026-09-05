'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AdminNav.module.css';

const items = [
  { label: 'Resumen', href: '/admin' },
  { label: 'Productos', href: '/admin/products' },
  { label: 'Pedidos', href: '/admin/orders' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación de administración">
      <ul className={styles.list}>
        {items.map((item) => {
          // "/admin" solo se marca activo en la raiz; el resto usa
          // startsWith para que subrutas (ej. /admin/products/nuevo)
          // sigan resaltando su seccion.
          const isActive = item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link href={item.href} className={styles.link} data-active={isActive}>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}