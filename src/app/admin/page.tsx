import Link from 'next/link';
import { Package, ShoppingCart, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function AdminDashboardPage() {
  const [productCount, orderCount, pendingOrderCount, lowStockCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PROCESSING' } }),
    prisma.product.count({ where: { stock: { lte: 5 } } }),
  ]);

  const stats = [
    { label: 'Productos', value: productCount, icon: Package },
    { label: 'Pedidos totales', value: orderCount, icon: ShoppingCart },
    { label: 'En preparación', value: pendingOrderCount, icon: Clock },
    { label: 'Stock bajo (≤5)', value: lowStockCount, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resumen</h1>
        <p className="text-sm text-muted-foreground">Vista general de la tienda.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Productos</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Gestiona el catálogo, precios y stock.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/products">
                Ver productos <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pedidos</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Revisa y gestiona los pedidos entrantes.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/orders">
                Ver pedidos <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}