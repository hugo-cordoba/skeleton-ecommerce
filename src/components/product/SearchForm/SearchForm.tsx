import styles from './SearchForm.module.css';

interface SearchFormProps {
  defaultValue?: string;
}

export default function SearchForm({ defaultValue = '' }: SearchFormProps) {
  return (
    <form action="/search" method="get" className={styles.form} role="search">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Buscar productos..."
        className={styles.input}
        aria-label="Buscar productos"
      />
      <button type="submit" className={styles.button}>
        Buscar
      </button>
    </form>
  );
}