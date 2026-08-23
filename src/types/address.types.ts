import type { ShippingAddress } from './order.types';

/**
 * Direccion guardada en la libreta del usuario. Extiende ShippingAddress
 * (el mismo tipo que ya usa el checkout) añadiendo id y flag de
 * predeterminada, para poder listarlas, editarlas y elegir una en el
 * checkout mas adelante sin duplicar campos.
 */
export interface SavedAddress extends ShippingAddress {
  id: string;
  isDefault: boolean;
  /** Etiqueta corta para identificarla en la lista, ej. "Casa", "Trabajo". */
  label?: string;
}