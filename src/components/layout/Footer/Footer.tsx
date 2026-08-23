import Link from 'next/link';
import type { NavLink, SocialLink } from '@/types/section.types';
import NewsletterForm from './NewsletterForm';
import styles from './Footer.module.css';

interface FooterProps {
  siteName: string;
  slogan?: string;
  navLinks?: NavLink[];
  socialLinks?: SocialLink[];
  followLabel?: string;
  aboutTitle?: string;
  aboutText?: string;
  phoneLabel?: string;
  phone?: string;
  emailLabel?: string;
  email?: string;
  newsletterPlaceholder?: string;
}

export default function Footer({
  siteName,
  slogan,
  navLinks = [],
  socialLinks = [],
  followLabel = 'Síguenos',
  aboutTitle = 'Sobre nosotros',
  aboutText,
  phoneLabel = 'Llamar:',
  phone,
  emailLabel = 'Email:',
  email,
  newsletterPlaceholder = 'Escribe tu email',
}: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        {/* Columna 1: marca + redes sociales */}
        <div className={styles.column}>
          <p className={styles.brandName}>{siteName}</p>
          {slogan && <p className={styles.slogan}>{slogan}</p>}

          {socialLinks.length > 0 && (
            <>
              <ul className={styles.socials}>
                {socialLinks.map((social) => (
                  <li key={social.label}>
                    <a href={social.href} className={styles.socialLink} aria-label={social.label}>
                      {social.initial}
                    </a>
                  </li>
                ))}
              </ul>
              <span className={styles.followLabel}>{followLabel}</span>
            </>
          )}
        </div>

        {/* Columna 2: navegacion + sobre nosotros */}
        <div className={styles.column}>
          {navLinks.length > 0 && (
            <ul className={styles.navList}>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          )}

          {aboutText && (
            <div className={styles.about}>
              <h3 className={styles.aboutTitle}>{aboutTitle}</h3>
              <p className={styles.aboutText}>{aboutText}</p>
            </div>
          )}
        </div>

        {/* Columna 3: contacto + newsletter */}
        <div className={styles.column}>
          {phone && (
            <div className={styles.contactItem}>
              <span className={styles.contactLabel}>{phoneLabel}</span>
              <span>{phone}</span>
            </div>
          )}
          {email && (
            <div className={styles.contactItem}>
              <span className={styles.contactLabel}>{emailLabel}</span>
              <span>{email}</span>
            </div>
          )}

          {/* Subcomponente cliente: es el unico trozo interactivo de este
              Footer, que sigue siendo Server Component en el resto. */}
          <NewsletterForm placeholder={newsletterPlaceholder} />
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>
          &copy; {new Date().getFullYear()} {siteName}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}