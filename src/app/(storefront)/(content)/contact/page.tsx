import type { Metadata } from 'next';
import ContactForm from '@/components/content/ContactForm/ContactForm';
import { contactContent } from '@/config/content.config';
import styles from './ContactPage.module.css';

export const metadata: Metadata = {
  title: contactContent.title,
};

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <div className={styles.intro}>
        <h1 className={styles.title}>{contactContent.title}</h1>
        {contactContent.intro && <p className={styles.description}>{contactContent.intro}</p>}

        <dl className={styles.infoList}>
          {contactContent.infoItems.map((item) => (
            <div key={item.label} className={styles.infoItem}>
              <dt className={styles.infoLabel}>{item.label}</dt>
              <dd>{item.href ? <a href={item.href}>{item.value}</a> : item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className={styles.formWrapper}>
        <h2 className={styles.formTitle}>{contactContent.formTitle ?? 'Escribenos'}</h2>
        <ContactForm />
      </div>
    </div>
  );
}
