import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getAdminProducts } from '@/lib/actions/admin/product.actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DeleteProductButton from '@/components/admin/DeleteProductButton/DeleteProductButton';

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} producto{products.length === 1 ? '' : 's'}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="size-4" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay productos.</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    {product.brandLabel && (
                      <div className="text-xs text-muted-foreground">{product.brandLabel}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                  <TableCell className="text-muted-foreground">{product.categoryLabel}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>
                    <Badge variant={product.stock <= 5 ? 'destructive' : 'secondary'}>{product.stock}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/products/${product.id}/edit`}>Editar</Link>
                      </Button>
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}