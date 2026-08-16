import Link from 'next/link';
import styles from './Pagination.module.css';

type SearchParams = { [key: string]: string | string[] | undefined };

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pathname: string;
  searchParams: SearchParams;
}

function buildHref(pathname: string, searchParams: SearchParams, page: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === 'page' || value === undefined) continue;
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    else params.set(key, value);
  }
  if (page > 1) params.set('page', String(page));

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/** Ventana de paginas a mostrar: siempre primera, ultima, actual y sus vecinas; el resto se colapsa en "…". */
function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const keep = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = Array.from(keep)
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const result: (number | 'ellipsis')[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push('ellipsis');
    result.push(page);
  });
  return result;
}

export default function Pagination({ currentPage, totalPages, pathname, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <nav className={styles.pagination} aria-label="Paginación de resultados">
      <Link
        href={buildHref(pathname, searchParams, Math.max(1, currentPage - 1))}
        className={`${styles.navLink} ${isFirstPage ? styles.disabled : ''}`}
        aria-disabled={isFirstPage}
        tabIndex={isFirstPage ? -1 : undefined}
      >
        ← Anterior
      </Link>

      <ul className={styles.pages}>
        {pageNumbers.map((page, index) =>
          page === 'ellipsis' ? (
            <li key={`ellipsis-${index}`} className={styles.ellipsis} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={page}>
              <Link
                href={buildHref(pathname, searchParams, page)}
                className={`${styles.pageLink} ${page === currentPage ? styles.active : ''}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </Link>
            </li>
          )
        )}
      </ul>

      <Link
        href={buildHref(pathname, searchParams, Math.min(totalPages, currentPage + 1))}
        className={`${styles.navLink} ${isLastPage ? styles.disabled : ''}`}
        aria-disabled={isLastPage}
        tabIndex={isLastPage ? -1 : undefined}
      >
        Siguiente →
      </Link>
    </nav>
  );
}