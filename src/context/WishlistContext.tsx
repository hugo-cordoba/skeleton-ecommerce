'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Product } from '@/types/product.types';
import { clearWishlistAction, getWishlist, removeFromWishlistAction, toggleWishlistAction } from '@/lib/actions/wishlist.actions';

export type WishlistItem = Product;

interface WishlistContextValue {
  items: WishlistItem[];
  itemCount: number;
  hydrated: boolean;
  isInWishlist: (id: string) => boolean;
  toggleItem: (product: Product) => void;
  removeItem: (id: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

/** `initialItems` llega resuelto desde app/layout.tsx, igual que initialCart en CartProvider. */
export function WishlistProvider({
  children,
  initialItems = [],
}: {
  children: React.ReactNode;
  initialItems?: WishlistItem[];
}) {
  const { user, hydrated: authHydrated } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>(initialItems);
  const [, startTransition] = useTransition();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!authHydrated) return;
    getWishlist().then(setItems);
  }, [user?.id, authHydrated]);

  const idSet = useMemo(() => new Set(items.map((item) => item.id)), [items]);
  const isInWishlist = (id: string) => idSet.has(id);

  function toggleItem(product: Product) {
    const wasInWishlist = idSet.has(product.id);
    setItems((prev) => (wasInWishlist ? prev.filter((item) => item.id !== product.id) : [product, ...prev]));

    startTransition(async () => {
      try {
        setItems(await toggleWishlistAction(product.id));
      } catch (error) {
        console.error('No se pudo actualizar la lista de deseos:', error);
      }
    });
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    startTransition(async () => {
      setItems(await removeFromWishlistAction(id));
    });
  }

  function clearWishlist() {
    setItems([]);
    startTransition(async () => {
      setItems(await clearWishlistAction());
    });
  }

  const value: WishlistContextValue = {
    items,
    itemCount: items.length,
    hydrated: true,
    isInWishlist,
    toggleItem,
    removeItem,
    clearWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist debe usarse dentro de un <WishlistProvider>.');
  return context;
}