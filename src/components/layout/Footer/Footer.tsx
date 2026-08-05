import styles from './Footer.module.css';

export default function Footer({ siteName }: { siteName: string }) {
  return (
    <footer className={styles.footer}>
      <p>
        &copy; {new Date().getFullYear()} {siteName}. Todos los derechos reservados.
      </p>
    </footer>
  );
}
