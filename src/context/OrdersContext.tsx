'use client';

import { createContext, useContext, useEffect, useReducer, useState } from 'react';
import type { Order } from '@/types/order.types';
import { useAuth } from '@/context/AuthContext';

const ORDERS_STORAGE_PREFIX = 'ecommerce-landing:orders';

type OrdersAction =
  | { type: 'HYDRATE'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order };

function ordersReducer(state: Order[], action: OrdersAction): Order[] {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
    case 'ADD_ORDER':
      // Mas reciente primero, para que el listado no necesite ordenar.
      return [action.payload, ...state];
    default:
      return state;
  }
}

interface OrdersContextValue {
  orders: Order[];
  hydrated: boolean;
  addOrder: (order: Order) => void;
  getOrder: (orderNumber: string) => Order | undefined;
}

const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  // Igual que Cart/Wishlist: cada usuario (o "guest" sin sesion) tiene su
  // propio historial, guardado bajo su propia clave.
  const { user, hydrated: authHydrated } = useAuth();
  const storageKey = `${ORDERS_STORAGE_PREFIX}:${user?.id ?? 'guest'}`;

  const [orders, dispatch] = useReducer(ordersReducer, []);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!authHydrated) return;

    setHydrated(false);
    try {
      const raw = window.localStorage.getItem(storageKey);
      dispatch({ type: 'HYDRATE', payload: raw ? (JSON.parse(raw) as Order[]) : [] });
    } catch {
      dispatch({ type: 'HYDRATE', payload: [] });
    } finally {
      setHydrated(true);
    }
  }, [authHydrated, storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(orders));
  }, [orders, hydrated, storageKey]);

  const addOrder = (order: Order) => {
    dispatch({ type: 'ADD_ORDER', payload: order });
  };

  const getOrder = (orderNumber: string) => orders.find((order) => order.orderNumber === orderNumber);

  const value: OrdersContextValue = { orders, hydrated, addOrder, getOrder };

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders(): OrdersContextValue {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders debe usarse dentro de un <OrdersProvider>.');
  }
  return context;
}