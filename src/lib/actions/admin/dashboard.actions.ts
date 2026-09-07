'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { statusToClient } from '@/lib/order-mapper';
import type { OrderStatus } from '@/types/order.types';

/** A partir de este stock (inclusive), un producto activo se considera "bajo" y aparece en el dashboard. */
const LOW_STOCK_THRESHOLD = 5;
const LOW_STOCK_LIMIT = 5;
const RECENT_ORDERS_LIMIT = 5;

export interface LowStockProduct {
  id: string;
  name: string;
  image: string;
  stock: number;
}

export interface RecentOrderSummary {
  orderNumber: string;
  email: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  isGuest: boolean;
}

export interface DashboardStats {
  todayOrderCount: number;
  todayRevenue: number;
  weekOrderCount: number;
  weekRevenue: number;
  pendingOrderCount: number;
  totalActiveProducts: number;
  totalCustomers: number;
  lowStockProducts: LowStockProduct[];
  recentOrders: RecentOrderSummary[];
}

/** Medianoche de hoy en la hora del servidor -- mismo criterio simple que usa el resto de la app (sin gestión de timezone por cliente). */
function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Lunes de esta semana a medianoche. */
function startOfWeek(): Date {
  const today = startOfToday();
  const daysSinceMonday = (today.getDay() + 6) % 7; // getDay(): 0=domingo..6=sabado
  const monday = new Date(today);
  monday.setDate(monday.getDate() - daysSinceMonday);
  return monday;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin();

  const [todayAgg, weekAgg, pendingOrderCount, lowStockRows, recentRows, totalActiveProducts, totalCustomers] =
    await Promise.all([
      prisma.order.aggregate({
        where: { createdAt: { gte: startOfToday() } },
        _count: true,
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: startOfWeek() } },
        _count: true,
        _sum: { total: true },
      }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
      prisma.product.findMany({
        where: { status: 'ACTIVE', stock: { lte: LOW_STOCK_THRESHOLD } },
        orderBy: { stock: 'asc' },
        take: LOW_STOCK_LIMIT,
        select: { id: true, name: true, image: true, stock: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: RECENT_ORDERS_LIMIT,
        select: { orderNumber: true, email: true, createdAt: true, status: true, total: true, userId: true },
      }),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
    ]);

  return {
    todayOrderCount: todayAgg._count,
    todayRevenue: todayAgg._sum.total ?? 0,
    weekOrderCount: weekAgg._count,
    weekRevenue: weekAgg._sum.total ?? 0,
    pendingOrderCount,
    totalActiveProducts,
    totalCustomers,
    lowStockProducts: lowStockRows,
    recentOrders: recentRows.map((row) => ({
      orderNumber: row.orderNumber,
      email: row.email,
      createdAt: row.createdAt.toISOString(),
      status: statusToClient(row.status),
      total: row.total,
      isGuest: !row.userId,
    })),
  };
}