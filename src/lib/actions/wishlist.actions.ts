'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getOrCreateGuestId, readGuestId } from '@/lib/guest';
import type { Product } from '@/types/product.types';

type Actor = { userId: string } | { guestId: string };

async function getActor(createGuestIfMissing = false): Promise<Actor | null> {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return { userId: session.user.id };

  const guestId = createGuestIfMissing ? getOrCreateGuestId() : readGuestId();
  return guestId ? { guestId } : null;
}

function actorWhere(actor: Actor) {
  return 'userId' in actor ? { userId: actor.userId } : { guestId: actor.guestId };
}

// Devolvemos el shape de `Product`, no un DTO nuevo: así ProductGrid,
// ProductCard y WishlistButton siguen funcionando sin tocarlos.
function toDTO(row: {
  product: { id: string; slug: string; name: string; image: string; price: string; href: string | null; badge: string | null };
}): Product {
  return {
    id: row.product.id,
    slug: row.product.slug,
    name: row.product.name,
    price: row.product.price,
    image: row.product.image,
    href: row.product.href ?? `/products/${row.product.slug}`,
    badge: row.product.badge ?? undefined,
  };
}

export async function getWishlist(): Promise<Product[]> {
  const actor = await getActor();
  if (!actor) return [];

  const rows = await prisma.wishlistItem.findMany({
    where: actorWhere(actor),
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(toDTO);
}

export async function toggleWishlistAction(productId: string): Promise<Product[]> {
  const actor = (await getActor(true))!;
  const existing = await prisma.wishlistItem.findFirst({ where: { ...actorWhere(actor), productId } });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
  } else {
    await prisma.wishlistItem.create({ data: { ...actorWhere(actor), productId } });
  }
  return getWishlist();
}

export async function removeFromWishlistAction(productId: string): Promise<Product[]> {
  const actor = await getActor();
  if (actor) {
    await prisma.wishlistItem.deleteMany({ where: { ...actorWhere(actor), productId } });
  }
  return getWishlist();
}

export async function clearWishlistAction(): Promise<Product[]> {
  const actor = await getActor();
  if (actor) await prisma.wishlistItem.deleteMany({ where: actorWhere(actor) });
  return getWishlist();
}

/** Mismo patrón que mergeGuestCartIntoUserAction: pasa la wishlist de invitado a la cuenta tras login/registro. */
export async function mergeGuestWishlistIntoUserAction(): Promise<void> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const guestId = readGuestId();
  if (!userId || !guestId) return;

  const guestItems = await prisma.wishlistItem.findMany({ where: { guestId } });

  for (const item of guestItems) {
    const existing = await prisma.wishlistItem.findFirst({ where: { userId, productId: item.productId } });
    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: item.id } });
    } else {
      await prisma.wishlistItem.update({ where: { id: item.id }, data: { userId, guestId: null } });
    }
  }
}