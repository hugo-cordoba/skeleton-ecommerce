import { prisma } from '@/lib/prisma';

export default async function AdminDashboardPage() {
  const [productCount, orderCount, pendingOrderCount, lowStockCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PROCESSING' } }),
    prisma.product.count({ where: { stock: { lte: 5 } } }),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50 p-4 flex flex-col justify-between">
          <div className="text-sm text-muted-foreground">Total Products</div>
          <div className="text-4xl font-bold">{productCount}</div>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50 p-4 flex flex-col justify-between">
          <div className="text-sm text-muted-foreground">Total Orders</div>
          <div className="text-4xl font-bold">{orderCount}</div>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50 p-4 flex flex-col justify-between">
          <div className="text-sm text-muted-foreground">Processing</div>
          <div className="text-4xl font-bold">{pendingOrderCount}</div>
        </div>
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <p className="text-sm text-muted-foreground">Overview of your store's recent activity</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Products</div>
              <div className="text-xs text-muted-foreground">Total: {productCount}</div>
            </div>
            <div className="text-sm text-muted-foreground">
              Manage your catalog, prices and inventory
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Low Stock Alert</div>
              <div className="text-xs text-destructive">{lowStockCount} items</div>
            </div>
            <div className="text-sm text-muted-foreground">
              Products with stock ≤5 units need attention
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
