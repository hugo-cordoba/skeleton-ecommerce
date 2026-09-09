'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderTree, LayoutDashboard, Package, Receipt, ShoppingBag, Store, Tag, Users } from 'lucide-react';
import { siteConfig } from '@/config/site.config';
import NavUser from '@/components/admin/NavUser/NavUser';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

// Mismo listado que tenía AdminHeader.tsx; si añades secciones nuevas
// (Productos, Marcas...) solo hace falta un objeto más aquí.
const navMain = [
  { title: 'Inicio', href: '/admin', icon: LayoutDashboard },
  { title: 'Productos', href: '/admin/products', icon: Package },
  { title: 'Categorías', href: '/admin/categories', icon: FolderTree },
  { title: 'Marcas', href: '/admin/brands', icon: Tag },
  { title: 'Clientes', href: '/admin/customers', icon: Users },
  { title: 'Pedidos', href: '/admin/orders', icon: ShoppingBag },
  { title: 'Facturación', href: '/admin/settings/fiscal', icon: Receipt },
];

export default function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Store className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{siteConfig.name}</span>
                  <span className="truncate text-xs">Admin</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
          <SidebarMenu>
            {navMain.map((item) => {
              const isActive =
                item.href === '/admin' ? pathname === '/admin' : Boolean(pathname?.startsWith(item.href));
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}