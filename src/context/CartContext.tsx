'use client';

import { createContext, useContext, useEffect, useRef, useState, useTransition } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/currency';
import {
  addToCartAction,
  clearCartAction,
  getCart,
  removeCartItemAction,
  updateCartItemQuantityAction,
  type CartDTO,
  type CartItemDTO,
} from '@/lib/actions/cart.actions';
import type { ProductDetail } from '@/types/product.types';

export type CartItem = CartItemDTO;
// Compatibilidad: si algo importaba esto desde aquí, sigue funcionando.
export { buildCartLineId } from '@/lib/cart-utils';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  subtotalFormatted: string;
  hydrated: boolean;
  addItem: (product: ProductDetail, quantity?: number, selectedVariants?: Record<string, string>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const EMPTY_CART: CartDTO = { items: [], itemCount: 0, subtotal: 0, subtotalFormatted: formatPrice(0) };

const CartContext = createContext<CartContextValue | undefined>(undefined);

/**
 * `initialCart` llega ya resuelto desde el Server Component raíz
 * (app/layout.tsx) -> primera pintura sin parpadeo, sin esperar un
 * useEffect.
 */
export function CartProvider({
  children,
  initialCart = EMPTY_CART,
}: {
  children: React.ReactNode;
  initialCart?: CartDTO;
}) {
  const { user, hydrated: authHydrated } = useAuth();
  const [cart, setCart] = useState<CartDTO>(initialCart);
  const [, startTransition] = useTransition();
  const isFirstRender = useRef(true);

  // Solo volvemos a pedir el carrito cuando cambia la identidad
  // (login/logout), para reflejar el merge de invitado -> cuenta.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!authHydrated) return;
    getCart().then(setCart);
  }, [user?.id, authHydrated]);

  function addItem(product: ProductDetail, quantity = 1, selectedVariants?: Record<string, string>) {
    startTransition(async () => {
      try {
        setCart(await addToCartAction(product.id, quantity, selectedVariants));
      } catch (error) {
        console.error('No se pudo añadir el producto al carrito:', error);
        // TODO: mostrar un toast de error en la UI
      }
    });
  }

  function updateQuantity(id: string, quantity: number) {
    // Optimista: refleja el cambio ya mismo, el server action confirma/corrige después.
    setCart((prev) => ({
      ...prev,
      items: prev.items
        .map((item) => (item.id === id ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    }));
    startTransition(async () => {
      setCart(await updateCartItemQuantityAction(id, quantity));
    });
  }

  function removeItem(id: string) {
    setCart((prev) => ({ ...prev, items: prev.items.filter((item) => item.id !== id) }));
    startTransition(async () => {
      setCart(await removeCartItemAction(id));
    });
  }

  function clearCart() {
    setCart(EMPTY_CART);
    startTransition(async () => {
      setCart(await clearCartAction());
    });
  }

  const value: CartContextValue = {
    items: cart.items,
    itemCount: cart.itemCount,
    subtotal: cart.subtotal,
    subtotalFormatted: cart.subtotalFormatted,
    hydrated: true, // ya viene hidratado del servidor
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