'use client';

import { createContext, useContext, useEffect, useMemo, useState, useTransition } from 'react';
import type { SavedAddress } from '@/types/address.types';
import { useAuth } from '@/context/AuthContext';
import {
  addAddressAction,
  getAddresses,
  removeAddressAction,
  setDefaultAddressAction,
  updateAddressAction,
} from '@/lib/actions/address.actions';

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
  // Igual que Cart/Wishlist: se vuelve a pedir la lista al cambiar de
  // usuario (login/logout), y no antes de que Auth resuelva la sesión.
  const { user, hydrated: authHydrated } = useAuth();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!authHydrated) return;
    setHydrated(false);
    getAddresses()
      .then(setAddresses)
      .finally(() => setHydrated(true));
  }, [authHydrated, user?.id]);

  function addAddress(address: Omit<SavedAddress, 'id'>) {
    // Optimista: id temporal hasta que llegue la respuesta real del
    // server action con el id definitivo y el isDefault recalculado.
    const tempId = `temp-${Date.now().toString(36)}`;
    const shouldBeDefault = address.isDefault || addresses.length === 0;
    setAddresses((prev) => [
      ...(shouldBeDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev),
      { ...address, id: tempId, isDefault: shouldBeDefault },
    ]);

    startTransition(async () => {
      setAddresses(await addAddressAction(address));
    });
  }

  function updateAddress(address: SavedAddress) {
    setAddresses((prev) => {
      const next = address.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
      return next.map((a) => (a.id === address.id ? address : a));
    });

    startTransition(async () => {
      setAddresses(await updateAddressAction(address));
    });
  }

  function removeAddress(id: string) {
    setAddresses((prev) => {
      const removingDefault = prev.find((a) => a.id === id)?.isDefault;
      const filtered = prev.filter((a) => a.id !== id);
      if (removingDefault && filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
        filtered[0] = { ...filtered[0], isDefault: true };
      }
      return filtered;
    });

    startTransition(async () => {
      setAddresses(await removeAddressAction(id));
    });
  }

  function setDefaultAddress(id: string) {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));

    startTransition(async () => {
      setAddresses(await setDefaultAddressAction(id));
    });
  }

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