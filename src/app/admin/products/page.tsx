import Link from 'next/link';
import { getAdminProducts } from '@/lib/actions/admin/product.actions';
import DeleteProductButton from '@/components/admin/DeleteProductButton/DeleteProductButton';
import styles from './AdminProducts.module.css';

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Productos <span className={styles.count}>({products.length})</span>
        </h1>
        <Link href="/admin/products/new" className={styles.newButton}>
          + Nuevo producto
        </Link>
      </div>

      {products.length === 0 ? (
        <p className={styles.empty}>Todavía no hay productos.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>SKU</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <span className={styles.productName}>{product.name}</span>
                    {product.brandLabel && <span className={styles.productBrand}>{product.brandLabel}</span>}
                  </td>
                  <td>{product.sku}</td>
                  <td>{product.categoryLabel}</td>
                  <td>{product.price}</td>
                  <td>
                    <span className={styles.stock} data-low={product.stock <= 5}>
                      {product.stock}
                    </span>
                  </td>
                  <td className={styles.actions}>
                    <Link href={`/admin/products/${product.id}/edit`} className={styles.actionLink}>
                      Editar
                    </Link>
                    <DeleteProductButton productId={product.id} productName={product.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}