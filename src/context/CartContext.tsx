'use client';

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import type { ProductDetail } from '@/types/product.types';
import { parsePriceToNumber, formatPrice } from '@/lib/currency';

const CART_STORAGE_KEY = 'ecommerce-landing:cart';

/**
 * Una linea del carrito. Una misma "linea" es un producto + una
 * combinacion concreta de variantes (ver `buildCartLineId`); asi,
 * "Producto 1 talla M" y "Producto 1 talla L" son dos lineas
 * distintas aunque sean el mismo producto.
 */
export interface CartItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  /** Precio unitario tal cual lo muestra el producto, ej. "19,90 EUR". */
  price: string;
  /** El mismo precio pero en numero, para poder sumar totales. */
  unitPrice: number;
  quantity: number;
  selectedVariants?: Record<string, string>;
  /** Stock del producto en el momento de añadirlo; limita hasta cuanto se puede subir la cantidad. */
  maxStock: number;
}

type CartAction =
  | { type: 'HYDRATE'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: { item: Omit<CartItem, 'quantity'>; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;

    case 'ADD_ITEM': {
      const { item, quantity } = action.payload;
      const existing = state.find((line) => line.id === item.id);

      if (existing) {
        const nextQuantity = Math.min(existing.quantity + quantity, existing.maxStock);
        return state.map((line) => (line.id === item.id ? { ...line, quantity: nextQuantity } : line));
      }

      const clampedQuantity = Math.min(quantity, item.maxStock);
      return [...state, { ...item, quantity: clampedQuantity }];
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return state.filter((line) => line.id !== id);
      }
      return state.map((line) =>
        line.id === id ? { ...line, quantity: Math.min(quantity, line.maxStock) } : line
      );
    }

    case 'REMOVE_ITEM':
      return state.filter((line) => line.id !== action.payload.id);

    case 'CLEAR_CART':
      return [];

    default:
      return state;
  }
}

/**
 * Genera un id de linea unico por producto + combinacion de variantes
 * elegidas (ej. "prod-01__Talla:M"). Sin variantes, el id de linea es
 * simplemente el id del producto.
 */
export function buildCartLineId(productId: string, selectedVariants?: Record<string, string>): string {
  if (!selectedVariants || Object.keys(selectedVariants).length === 0) return productId;

  const variantKey = Object.entries(selectedVariants)
    .sort(([groupA], [groupB]) => groupA.localeCompare(groupB))
    .map(([group, option]) => `${group}:${option}`)
    .join('|');

  return `${productId}__${variantKey}`;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  subtotalFormatted: string;
  addItem: (product: ProductDetail, quantity?: number, selectedVariants?: Record<string, string>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const [hydrated, setHydrated] = useState(false);

  // Carga el carrito guardado en localStorage al montar (solo existe en cliente).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        dispatch({ type: 'HYDRATE', payload: JSON.parse(raw) as CartItem[] });
      }
    } catch {
      // localStorage corrupto, en modo privado, o no disponible: seguimos con carrito vacio.
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persiste cualquier cambio, pero solo despues de la hidratacion inicial
  // para no sobrescribir el storage con [] antes de haber podido leerlo.
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = (product: ProductDetail, quantity = 1, selectedVariants?: Record<string, string>) => {
    const id = buildCartLineId(product.id, selectedVariants);
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        item: {
          id,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.image,
          price: product.price,
          unitPrice: parsePriceToNumber(product.price),
          selectedVariants,
          maxStock: product.stock,
        },
        quantity,
      },
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const { itemCount, subtotal } = useMemo(
    () =>
      items.reduce(
        (acc, line) => ({
          itemCount: acc.itemCount + line.quantity,
          subtotal: acc.subtotal + line.unitPrice * line.quantity,
        }),
        { itemCount: 0, subtotal: 0 }
      ),
    [items]
  );

  const value: CartContextValue = {
    items,
    itemCount,
    subtotal,
    subtotalFormatted: formatPrice(subtotal),
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un <CartProvider>.');
  }
  return context;
}
