'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Order } from '@/types/order.types';
import { getOrders } from '@/lib/actions/order.actions';

interface OrdersContextValue {
  orders: Order[];
  hydrated: boolean;
  addOrder: (order: Order) => void;
  getOrder: (orderNumber: string) => Order | undefined;
}

const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);

/** `initialOrders` llega resuelto desde app/layout.tsx, igual que initialCart/initialItems en Cart/WishlistProvider. */
export function OrdersProvider({
  children,
  initialOrders = [],
}: {
  children: React.ReactNode;
  initialOrders?: Order[];
}) {
  const { user, hydrated: authHydrated } = useAuth();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const isFirstRender = useRef(true);

  // Igual que Cart/Wishlist: solo se vuelve a pedir el historial cuando
  // cambia la identidad (login/logout), para reflejar el merge de
  // pedidos de invitado -> cuenta.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!authHydrated) return;
    getOrders().then(setOrders);
  }, [user?.id, authHydrated]);

  function addOrder(order: Order) {
    // El pedido ya se creó en BD (createOrderAction); esto solo lo
    // refleja de inmediato en el estado local sin esperar un refetch.
    setOrders((prev) => [order, ...prev]);
  }

  function getOrder(orderNumber: string) {
    return orders.find((order) => order.orderNumber === orderNumber);
  }

  const value: OrdersContextValue = { orders, hydrated: true, addOrder, getOrder };

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders(): OrdersContextValue {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders debe usarse dentro de un <OrdersProvider>.');
  }
  return context;
}