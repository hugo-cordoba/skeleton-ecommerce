import type { ContentPageData } from '@/types/content.types';
import styles from './ContentPage.module.css';

export default function ContentPage({ title, intro, updatedAt, sections }: ContentPageData) {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {intro && <p className={styles.intro}>{intro}</p>}
        {updatedAt && <p className={styles.updatedAt}>Última actualización: {updatedAt}</p>}
      </div>

      <div className={styles.sections}>
        {sections.map((section, index) => (
          <section key={index} className={styles.section}>
            {section.heading && <h2 className={styles.sectionHeading}>{section.heading}</h2>}
            {section.body.map((paragraph, pIndex) => (
              <p key={pIndex} className={styles.paragraph}>
                {paragraph}
              </p>
            ))}
            {section.list && (
              <ul className={styles.list}>
                {section.list.map((item, iIndex) => (
                  <li key={iIndex}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}