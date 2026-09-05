'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { label: 'Resumen', href: '/admin', icon: LayoutDashboard },
  { label: 'Productos', href: '/admin/products', icon: Package },
  { label: 'Pedidos', href: '/admin/orders', icon: ShoppingCart },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación de administración" className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive = item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-accent text-accent-foreground'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}