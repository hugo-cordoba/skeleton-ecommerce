import { PrismaClient } from '@prisma/client';
import { products, productCategories, productBrands } from '../src/data/products.config.seed-source';

const prisma = new PrismaClient();

async function main() {
  for (const category of productCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  for (const brand of productBrands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    });
  }

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        slug: product.slug,
        name: product.name,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        image: product.image,
        images: product.images,
        href: product.href,
        badge: product.badge,
        description: product.description,
        shortDescription: product.shortDescription,
        sku: product.sku,
        stock: product.stock,
        categorySlug: product.categorySlug,
        brandSlug: product.brandSlug,
        relatedIds: product.relatedIds ?? [],
        variantGroups: product.variants
          ? {
              create: product.variants.map((group) => ({
                label: group.label,
                options: {
                  create: group.options.map((option) => ({
                    label: option.label,
                    available: option.available,
                  })),
                },
              })),
            }
          : undefined,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });