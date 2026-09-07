'use server';

import { Prisma } from '@prisma/client';
import type { Role } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { runAdminAction, type AdminActionResult } from './admin-utils';
import { statusToClient } from '@/lib/order-mapper';
import type { OrderStatus } from '@/types/order.types';
import type { SavedAddress } from '@/types/address.types';

/* ---------- Listado ---------- */

export interface CustomerSummary {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  createdAt: string;
  orderCount: number;
}

export interface AdminCustomersResult {
  customers: CustomerSummary[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface AdminCustomersQuery {
  query?: string;
  role?: Role;
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 20;

/** Mismo patrón que getAdminOrders/getAdminProducts: paginación en BD, búsqueda por nombre/email, filtro opcional por rol. */
export async function getAdminCustomers(params: AdminCustomersQuery = {}): Promise<AdminCustomersResult> {
  await requireAdmin();

  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

  const where: Prisma.UserWhereInput = {
    ...(params.role ? { role: params.role } : {}),
    ...(params.query
      ? {
          OR: [
            { fullName: { contains: params.query, mode: 'insensitive' } },
            { email: { contains: params.query, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [rows, totalItems] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    customers: rows.map((row) => ({
      id: row.id,
      fullName: row.fullName,
      email: row.email,
      role: row.role,
      createdAt: row.createdAt.toISOString(),
      orderCount: row._count.orders,
    })),
    currentPage: page,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    totalItems,
  };
}

/* ---------- Detalle ---------- */

export interface CustomerOrderSummary {
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
}

export interface CustomerWishlistItemDTO {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: string;
}

export interface AdminCustomerDetail {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  createdAt: string;
  orders: CustomerOrderSummary[];
  addresses: SavedAddress[];
  wishlist: CustomerWishlistItemDTO[];
}

export async function getAdminCustomerById(id: string): Promise<AdminCustomerDetail | null> {
  await requireAdmin();

  const row = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: { orderBy: { createdAt: 'desc' }, include: { items: true } },
      addresses: { orderBy: [{ isDefault: 'desc' }, { id: 'asc' }] },
      wishlist: { orderBy: { createdAt: 'desc' }, include: { product: true } },
    },
  });
  if (!row) return null;

  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    role: row.role,
    createdAt: row.createdAt.toISOString(),
    orders: row.orders.map((order) => ({
      orderNumber: order.orderNumber,
      createdAt: order.createdAt.toISOString(),
      status: statusToClient(order.status),
      total: order.total,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    })),
    addresses: row.addresses.map((address) => ({
      id: address.id,
      label: address.label ?? undefined,
      fullName: address.fullName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? undefined,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone ?? undefined,
      isDefault: address.isDefault,
    })),
    wishlist: row.wishlist.map((item) => ({
      id: item.product.id,
      slug: item.product.slug,
      name: item.product.name,
      image: item.product.image,
      price: item.product.price,
    })),
  };
}

/* ---------- Cambiar rol (promover / degradar admin) ---------- */

/**
 * Único punto de la app donde el rol de un usuario deja de ser CUSTOMER por
 * defecto (antes solo era posible tocando la BD a mano, ver registerUser en
 * auth.actions.ts). Un admin no puede quitarse el rol a sí mismo, para no
 * dejar el panel sin nadie con acceso -- si hace falta, que lo haga otro admin.
 */
export async function updateCustomerRoleAction(
  userId: string,
  role: Role
): Promise<AdminActionResult<{ role: Role }>> {
  return runAdminAction(async () => {
    const session = await getServerSession(authOptions);
    if (session?.user?.id === userId && role !== 'ADMIN') {
      throw new Error('No puedes quitarte el rol de administrador a ti mismo.');
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) throw new Error('El cliente no existe.');

    await prisma.user.update({ where: { id: userId }, data: { role } });
    return { role };
  });
}