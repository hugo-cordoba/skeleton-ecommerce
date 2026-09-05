'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  createProductAction,
  updateProductAction,
  type AdminProductDetail,
  type ProductFormInput,
} from '@/lib/actions/admin/product.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OptionItem {
  slug: string;
  label: string;
}

interface ProductFormProps {
  mode: 'create' | 'edit';
  productId?: string;
  initialData?: AdminProductDetail;
  categories: OptionItem[];
  brands: OptionItem[];
}

const NO_BRAND = '__none__';

export default function ProductForm({ mode, productId, initialData, categories, brands }: ProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [sku, setSku] = useState(initialData?.sku ?? '');
  const [price, setPrice] = useState(initialData?.price ?? '');
  const [compareAtPrice, setCompareAtPrice] = useState(initialData?.compareAtPrice ?? '');
  const [image, setImage] = useState(initialData?.image ?? '');
  const [imagesText, setImagesText] = useState((initialData?.images ?? []).join('\n'));
  const [badge, setBadge] = useState(initialData?.badge ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription ?? '');
  const [stock, setStock] = useState(initialData?.stock ?? 0);
  const [categorySlug, setCategorySlug] = useState(initialData?.categorySlug ?? categories[0]?.slug ?? '');
  const [brandSlug, setBrandSlug] = useState(initialData?.brandSlug ?? NO_BRAND);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const images = imagesText.split('\n').map((line) => line.trim()).filter(Boolean);

    const input: ProductFormInput = {
      name,
      slug,
      sku,
      price,
      compareAtPrice: compareAtPrice || undefined,
      image,
      images,
      badge: badge || undefined,
      description,
      shortDescription: shortDescription || undefined,
      stock,
      categorySlug,
      brandSlug: brandSlug === NO_BRAND ? undefined : brandSlug,
    };

    const result =
      mode === 'create' ? await createProductAction(input) : await updateProductAction(productId!, input);

    setIsSubmitting(false);
    if (result && !result.ok) setError(result.error ?? 'No se ha podido guardar el producto.');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información general</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (opcional, se genera del nombre)</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="mi-producto" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" required value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              required
              min={0}
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Precio (ej. 24,90 EUR)</Label>
            <Input id="price" required value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="compareAtPrice">Precio anterior (opcional)</Label>
            <Input id="compareAtPrice" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={categorySlug} onValueChange={setCategorySlug}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.slug} value={category.slug}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Marca (opcional)</Label>
            <Select value={brandSlug} onValueChange={setBrandSlug}>
              <SelectTrigger id="brand">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_BRAND}>Sin marca</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.slug} value={brand.slug}>
                    {brand.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="badgeLabel">Etiqueta (opcional, ej. &quot;Nuevo&quot;, &quot;Más vendido&quot;)</Label>
            <Input id="badgeLabel" value={badge} onChange={(e) => setBadge(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Imágenes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="image">Imagen principal (URL)</Label>
            <Input id="image" required value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="images">Imágenes de galería (una URL por línea, opcional)</Label>
            <Textarea id="images" rows={3} value={imagesText} onChange={(e) => setImagesText(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Descripción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="shortDescription">Descripción corta (opcional)</Label>
            <Input id="shortDescription" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" required rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push('/admin/products')}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}