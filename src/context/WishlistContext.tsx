'use client';

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import type { Product } from '@/types/product.types';
import { useAuth } from '@/context/AuthContext';

const WISHLIST_STORAGE_PREFIX = 'ecommerce-landing:wishlist';

export interface WishlistItem {
  id: string;
  slug: string;
  name: string;
  price: string;
  image: string;
  href?: string;
  badge?: string;
}

type WishlistAction =
  | { type: 'HYDRATE'; payload: WishlistItem[] }
  | { type: 'ADD_ITEM'; payload: WishlistItem }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR' };

function wishlistReducer(state: WishlistItem[], action: WishlistAction): WishlistItem[] {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
    case 'ADD_ITEM':
      if (state.some((item) => item.id === action.payload.id)) return state;
      return [...state, action.payload];
    case 'REMOVE_ITEM':
      return state.filter((item) => item.id !== action.payload.id);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

/** Solo guardamos lo minimo necesario para pintar la wishlist, no el ProductDetail completo. */
function toWishlistItem(product: Product): WishlistItem {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.image,
    href: product.href,
    badge: product.badge,
  };
}

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

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  // Cada usuario (o "guest" sin sesion) tiene su propia wishlist, guardada
  // bajo su propia clave. Asi el logout/login cambia la lista de verdad,
  // en vez de compartir una unica clave global.
  const { user, hydrated: authHydrated } = useAuth();
  const storageKey = `${WISHLIST_STORAGE_PREFIX}:${user?.id ?? 'guest'}`;

  const [items, dispatch] = useReducer(wishlistReducer, []);
  const [hydrated, setHydrated] = useState(false);

  // Se re-ejecuta cada vez que cambia storageKey (login/logout), no solo al montar.
  useEffect(() => {
    // Esperamos a que Auth resuelva la sesion para no leer la clave de
    // invitado por error durante el instante inicial de carga.
    if (!authHydrated) return;

    setHydrated(false);
    try {
      const raw = window.localStorage.getItem(storageKey);
      dispatch({ type: 'HYDRATE', payload: raw ? (JSON.parse(raw) as WishlistItem[]) : [] });
    } catch {
      // localStorage corrupto, en modo privado, o no disponible: seguimos con wishlist vacia.
      dispatch({ type: 'HYDRATE', payload: [] });
    } finally {
      setHydrated(true);
    }
  }, [authHydrated, storageKey]);

  // Persiste cualquier cambio, pero solo despues de la hidratacion de ESTA
  // clave, para no sobrescribir el storage del usuario anterior con [].
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, hydrated, storageKey]);

  const idSet = useMemo(() => new Set(items.map((item) => item.id)), [items]);

  const isInWishlist = (id: string) => idSet.has(id);

  const toggleItem = (product: Product) => {
    if (idSet.has(product.id)) {
      dispatch({ type: 'REMOVE_ITEM', payload: { id: product.id } });
    } else {
      dispatch({ type: 'ADD_ITEM', payload: toWishlistItem(product) });
    }
  };

  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  const clearWishlist = () => dispatch({ type: 'CLEAR' });

  const value: WishlistContextValue = {
    items,
    itemCount: items.length,
    hydrated,
    isInWishlist,
    toggleItem,
    removeItem,
    clearWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist debe usarse dentro de un <WishlistProvider>.');
  }
  return context;
}