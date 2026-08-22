'use client';

import { useState } from 'react';
import type { FaqItem } from '@/types/content.types';
import styles from './FaqAccordion.module.css';

/**
 * Acordeon de preguntas frecuentes. Es el unico trozo de cliente de la
 * pagina de FAQ (necesita useState para abrir/cerrar), el resto sigue
 * siendo un Server Component. Los datos vienen de `content.config.ts`.
 */
export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  // La primera pregunta empieza abierta para que la pagina no se vea vacia.
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  function toggle(index: number) {
    setOpenIndex((current) => (current === index ? null : index));
  }

  return (
    <div className={styles.accordion}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const buttonId = `faq-button-${index}`;
        const panelId = `faq-panel-${index}`;

        return (
          <div key={item.question} className={styles.item}>
            <h3 className={styles.questionRow}>
              <button
                type="button"
                id={buttonId}
                className={styles.question}
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <span>{item.question}</span>
                <span className={styles.icon} aria-hidden="true">
                  {isOpen ? '\u2212' : '+'}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={styles.answerWrapper}
              data-open={isOpen}
            >
              <p className={styles.answer}>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
