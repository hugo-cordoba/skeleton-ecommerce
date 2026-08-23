'use client';

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import type { SavedAddress } from '@/types/address.types';
import { useAuth } from '@/context/AuthContext';

const ADDRESS_STORAGE_PREFIX = 'ecommerce-landing:addresses';

type AddressAction =
  | { type: 'HYDRATE'; payload: SavedAddress[] }
  | { type: 'ADD'; payload: SavedAddress }
  | { type: 'UPDATE'; payload: SavedAddress }
  | { type: 'REMOVE'; payload: { id: string } }
  | { type: 'SET_DEFAULT'; payload: { id: string } };

function addressReducer(state: SavedAddress[], action: AddressAction): SavedAddress[] {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;

    case 'ADD': {
      // La primera direccion, o cualquiera marcada explicitamente, pasa a predeterminada.
      const shouldBeDefault = action.payload.isDefault || state.length === 0;
      const next = shouldBeDefault ? state.map((a) => ({ ...a, isDefault: false })) : state;
      return [...next, { ...action.payload, isDefault: shouldBeDefault }];
    }

    case 'UPDATE': {
      const next = action.payload.isDefault ? state.map((a) => ({ ...a, isDefault: false })) : state;
      return next.map((a) => (a.id === action.payload.id ? action.payload : a));
    }

    case 'REMOVE': {
      const removingDefault = state.find((a) => a.id === action.payload.id)?.isDefault;
      const filtered = state.filter((a) => a.id !== action.payload.id);
      // Si borrabamos la predeterminada, la primera que quede la hereda.
      if (removingDefault && filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
        filtered[0] = { ...filtered[0], isDefault: true };
      }
      return filtered;
    }

    case 'SET_DEFAULT':
      return state.map((a) => ({ ...a, isDefault: a.id === action.payload.id }));

    default:
      return state;
  }
}

interface AddressBookContextValue {
  addresses: SavedAddress[];
  hydrated: boolean;
  defaultAddress: SavedAddress | undefined;
  addAddress: (address: Omit<SavedAddress, 'id'>) => void;
  updateAddress: (address: SavedAddress) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

const AddressBookContext = createContext<AddressBookContextValue | undefined>(undefined);

export function AddressBookProvider({ children }: { children: React.ReactNode }) {
  // Mismo patron que Cart/Wishlist: una libreta por usuario (o "guest").
  const { user, hydrated: authHydrated } = useAuth();
  const storageKey = `${ADDRESS_STORAGE_PREFIX}:${user?.id ?? 'guest'}`;

  const [addresses, dispatch] = useReducer(addressReducer, []);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!authHydrated) return;
    setHydrated(false);
    try {
      const raw = window.localStorage.getItem(storageKey);
      dispatch({ type: 'HYDRATE', payload: raw ? (JSON.parse(raw) as SavedAddress[]) : [] });
    } catch {
      dispatch({ type: 'HYDRATE', payload: [] });
    } finally {
      setHydrated(true);
    }
  }, [authHydrated, storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(addresses));
  }, [addresses, hydrated, storageKey]);

  const addAddress = (address: Omit<SavedAddress, 'id'>) => {
    dispatch({ type: 'ADD', payload: { ...address, id: `addr-${Date.now().toString(36)}` } });
  };
  const updateAddress = (address: SavedAddress) => dispatch({ type: 'UPDATE', payload: address });
  const removeAddress = (id: string) => dispatch({ type: 'REMOVE', payload: { id } });
  const setDefaultAddress = (id: string) => dispatch({ type: 'SET_DEFAULT', payload: { id } });

  const defaultAddress = useMemo(() => addresses.find((a) => a.isDefault), [addresses]);

  const value: AddressBookContextValue = {
    addresses,
    hydrated,
    defaultAddress,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
  };

  return <AddressBookContext.Provider value={value}>{children}</AddressBookContext.Provider>;
}

export function useAddressBook(): AddressBookContextValue {
  const context = useContext(AddressBookContext);
  if (!context) {
    throw new Error('useAddressBook debe usarse dentro de un <AddressBookProvider>.');
  }
  return context;
}