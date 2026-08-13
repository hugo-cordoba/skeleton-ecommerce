'use client';

import { createContext, useContext, useEffect, useReducer, useState } from 'react';
import type { CartItem } from './CartContext';

const CHECKOUT_STORAGE_KEY = 'ecommerce-landing:checkout';

export interface ContactInfo {
  email: string;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface ShippingMethod {
  id: string;
  label: string;
  price: number;
  priceFormatted: string;
  etaLabel: string;
}

export interface CompletedOrder {
  orderNumber: string;
  email: string;
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethod;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
}

interface CheckoutState {
  contactInfo: ContactInfo | null;
  shippingAddress: ShippingAddress | null;
  shippingMethod: ShippingMethod | null;
  completedOrder: CompletedOrder | null;
}

const initialState: CheckoutState = {
  contactInfo: null,
  shippingAddress: null,
  shippingMethod: null,
  completedOrder: null,
};

type CheckoutAction =
  | { type: 'HYDRATE'; payload: CheckoutState }
  | { type: 'SET_CONTACT_INFO'; payload: ContactInfo }
  | { type: 'SET_SHIPPING_ADDRESS'; payload: ShippingAddress }
  | { type: 'SET_SHIPPING_METHOD'; payload: ShippingMethod }
  | { type: 'COMPLETE_ORDER'; payload: CompletedOrder }
  | { type: 'RESET' };

function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
    case 'SET_CONTACT_INFO':
      return { ...state, contactInfo: action.payload };
    case 'SET_SHIPPING_ADDRESS':
      return { ...state, shippingAddress: action.payload };
    case 'SET_SHIPPING_METHOD':
      return { ...state, shippingMethod: action.payload };
    case 'COMPLETE_ORDER':
      return { ...state, completedOrder: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface CheckoutContextValue extends CheckoutState {
  setContactInfo: (info: ContactInfo) => void;
  setShippingAddress: (address: ShippingAddress) => void;
  setShippingMethod: (method: ShippingMethod) => void;
  completeOrder: (order: CompletedOrder) => void;
  resetCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  // Mismo patron que CartContext, pero con sessionStorage: los datos de un
  // pedido a medias no deben sobrevivir a cerrar la pestaña.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
      if (raw) {
        dispatch({ type: 'HYDRATE', payload: JSON.parse(raw) as CheckoutState });
      }
    } catch {
      // sessionStorage corrupto o no disponible: seguimos con estado inicial.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const value: CheckoutContextValue = {
    ...state,
    setContactInfo: (info) => dispatch({ type: 'SET_CONTACT_INFO', payload: info }),
    setShippingAddress: (address) => dispatch({ type: 'SET_SHIPPING_ADDRESS', payload: address }),
    setShippingMethod: (method) => dispatch({ type: 'SET_SHIPPING_METHOD', payload: method }),
    completeOrder: (order) => dispatch({ type: 'COMPLETE_ORDER', payload: order }),
    resetCheckout: () => {
      dispatch({ type: 'RESET' });
      window.sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
    },
  };

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout(): CheckoutContextValue {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout debe usarse dentro de un <CheckoutProvider>.');
  }
  return context;
}