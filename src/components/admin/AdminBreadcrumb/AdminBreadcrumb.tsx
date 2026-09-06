'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const sectionLabels: Record<string, string> = {
  admin: 'Inicio',
  products: 'Productos',
  new: 'Nuevo',
  categories: 'Categorías',
  orders: 'Pedidos',
};

export default function AdminBreadcrumb() {
  const pathname = usePathname() ?? '/admin';
  const segments = pathname.split('/').filter(Boolean);

  const crumbs = segments.map((segment, index) => ({
    label: sectionLabels[segment] ?? decodeURIComponent(segment),
    href: '/' + segments.slice(0, index + 1).join('/'),
    isLast: index === segments.length - 1,
  }));

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      {crumbs.map((crumb, index) => (
        <Fragment key={crumb.href}>
          {index > 0 && <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden="true" />}
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="text-muted-foreground hover:text-foreground">
              {crumb.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}