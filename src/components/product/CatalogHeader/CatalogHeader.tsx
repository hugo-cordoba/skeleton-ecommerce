import styles from './CatalogHeader.module.css';

interface CatalogHeaderProps {
  title: string;
  description?: string;
  resultsCount?: number;
}

export default function CatalogHeader({ title, description, resultsCount }: CatalogHeaderProps) {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
      {typeof resultsCount === 'number' && (
        <span className={styles.count}>
          {resultsCount} producto{resultsCount === 1 ? '' : 's'}
        </span>
      )}
    </div>
  );
}
