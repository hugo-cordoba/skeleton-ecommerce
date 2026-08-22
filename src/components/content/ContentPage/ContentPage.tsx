import type { ContentPageData } from '@/types/content.types';
import styles from './ContentPage.module.css';

/**
 * Layout generico para paginas de texto: about, privacidad, terminos,
 * devoluciones y envios. Recibe el contenido tipado desde
 * `config/content.config.ts`, asi que anadir/editar una pagina de este
 * tipo es solo cuestion de editar ese fichero, sin tocar este componente.
 */
export default function ContentPage({ title, intro, updatedAt, sections }: ContentPageData) {
  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {intro && <p className={styles.intro}>{intro}</p>}
        {updatedAt && <p className={styles.updatedAt}>Ultima actualizacion: {updatedAt}</p>}
      </header>

      <div className={styles.sections}>
        {sections.map((section, index) => (
          <section key={section.heading ?? index} className={styles.section}>
            {section.heading && <h2 className={styles.sectionHeading}>{section.heading}</h2>}
            {section.body.map((paragraph, paragraphIndex) => (
              <p key={paragraphIndex} className={styles.paragraph}>
                {paragraph}
              </p>
            ))}
            {section.list && section.list.length > 0 && (
              <ul className={styles.list}>
                {section.list.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
