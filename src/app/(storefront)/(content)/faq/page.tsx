import type { Metadata } from 'next';
import FaqAccordion from '@/components/content/FaqAccordion/FaqAccordion';
import { faqContent } from '@/config/content.config';
import styles from './FaqPage.module.css';

export const metadata: Metadata = {
  title: faqContent.title,
};

export default function FaqPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{faqContent.title}</h1>
      {faqContent.intro && <p className={styles.intro}>{faqContent.intro}</p>}
      <FaqAccordion items={faqContent.items} />
    </div>
  );
}
