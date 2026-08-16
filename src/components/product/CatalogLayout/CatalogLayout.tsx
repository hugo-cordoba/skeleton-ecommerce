import styles from './CatalogLayout.module.css';

export default function CatalogLayout({
  filters,
  children,
}: {
  filters: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>{filters}</aside>
      <div className={styles.content}>{children}</div>
    </div>
  );
}