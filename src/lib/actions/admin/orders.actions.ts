'use server';

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { runAdminAction, type AdminActionResult } from './admin-utils';
import { statusToClient, statusToPrisma, toOrderDTO } from '@/lib/order-mapper';
import type { Order, OrderStatus } from '@/types/order.types';

export interface AdminOrderSummary {
  orderNumber: string;
  email: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  isGuest: boolean;
}

export interface AdminOrdersResult {
  orders: AdminOrderSummary[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface AdminOrdersQuery {
  status?: OrderStatus;
  query?: string;
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 20;

/** A diferencia del catálogo, aquí paginamos en BD (skip/take): los pedidos crecen sin límite. */
export async function getAdminOrders(params: AdminOrdersQuery = {}): Promise<AdminOrdersResult> {
  await requireAdmin();

  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

  const where: Prisma.OrderWhereInput = {
    ...(params.status ? { status: statusToPrisma(params.status) } : {}),
    ...(params.query
      ? {
          OR: [
            { orderNumber: { contains: params.query, mode: 'insensitive' } },
            { email: { contains: params.query, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [rows, totalItems] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        orderNumber: true,
        email: true,
        createdAt: true,
        status: true,
        total: true,
        userId: true,
        items: { select: { quantity: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: rows.map((row) => ({
      orderNumber: row.orderNumber,
      email: row.email,
      createdAt: row.createdAt.toISOString(),
      status: statusToClient(row.status),
      total: row.total,
      itemCount: row.items.reduce((sum, item) => sum + item.quantity, 0),
      isGuest: !row.userId,
    })),
    currentPage: page,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    totalItems,
  };
}

export interface AdminOrderDetail extends Order {
  isGuest: boolean;
}

export async function getAdminOrderDetail(orderNumber: string): Promise<AdminOrderDetail | null> {
  await requireAdmin();

  const row = await prisma.order.findUnique({ where: { orderNumber }, include: { items: true } });
  if (!row) return null;

  return { ...toOrderDTO(row), isGuest: !row.userId };
}

export async function updateOrderStatusAction(
  orderNumber: string,
  status: OrderStatus
): Promise<AdminActionResult<{ status: OrderStatus }>> {
  return runAdminAction(async () => {
    const existing = await prisma.order.findUnique({ where: { orderNumber } });
    if (!existing) throw new Error('El pedido no existe.');

    await prisma.order.update({ where: { orderNumber }, data: { status: statusToPrisma(status) } });
    return { status };
  });
}