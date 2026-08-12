import Link from 'next/link';
import { siteConfig } from '@/config/site.config';

const steps = [
  { label: 'Informacion', href: '/checkout/information' },
  { label: 'Envio', href: '/checkout/shipping' },
  { label: 'Pago', href: '/checkout/payment' },
];

/**
 * LAYOUT DE CHECKOUT: deliberadamente NO incluye el Header ni el
 * Footer de la tienda. En checkout interesa minimizar distracciones
 * y puntos de fuga (menu, buscador, enlaces a categorias...), asi
 * que solo mostramos el logo (vuelve al home) y los pasos del proceso.
 *
 * TODO: en /checkout/success probablemente no quieras mostrar los
 * pasos (el pedido ya esta hecho) — se puede resolver con un flag
 * en el propio page.tsx o separando "success" de este layout.
 */
export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header>
        <Link href="/">{siteConfig.name}</Link>
        <nav>
          <ol>
            {steps.map((step) => (
              <li key={step.href}>
                <Link href={step.href}>{step.label}</Link>
              </li>
            ))}
          </ol>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
