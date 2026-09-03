import type { ReactNode } from 'react';
import styles from './CatalogHeader.module.css';

interface CatalogHeaderProps {
  title: string;
  description?: string;
  resultsCount?: number;
  actions?: ReactNode;
}

export default function CatalogHeader({ title, description, resultsCount, actions }: CatalogHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{title}</h1>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {description && <p className={styles.description}>{description}</p>}
      {typeof resultsCount === 'number' && (
        <span className={styles.count}>
          {resultsCount} producto{resultsCount === 1 ? '' : 's'}
        </span>
      )}
    </div>
  );
}
