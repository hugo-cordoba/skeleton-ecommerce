import type { Metadata } from 'next';
import styles from './AdminHome.module.css';

export const metadata: Metadata = {
  title: 'Panel de administración',
};

export default function AdminHomePage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Panel de administración</h1>
      <p className={styles.text}>
        Si ves esta página es porque tu cuenta tiene rol <strong>ADMIN</strong> y has pasado
        tanto el middleware como el guard del cliente.
      </p>
      <p className={styles.text}>
        Las secciones de productos, categorías, marcas y pedidos se irán añadiendo aquí en los
        siguientes pasos.
      </p>
    </div>
  );
}