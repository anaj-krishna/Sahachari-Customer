import { create } from "zustand";

export interface CheckoutAddress {
  street: string;
  city: string;
  zipCode: string;
  phone: string;
  notes?: string;
}

export interface SingleCheckoutPayload {
  productId: string;
  quantity: number;
  returnTo?: string;
  fromCategory?: string;
}

interface CheckoutState {
  address: CheckoutAddress | null;
  total: number;
  itemCount: number;
  checkoutType: "cart" | "single";
  singlePayload: SingleCheckoutPayload | null;
  setCheckoutData: (payload: {
    address: CheckoutAddress;
    total: number;
    itemCount: number;
    checkoutType?: "cart" | "single";
    singlePayload?: SingleCheckoutPayload | null;
  }) => void;
  clearCheckoutData: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  address: null,
  total: 0,
  itemCount: 0,
  checkoutType: "cart",
  singlePayload: null,
  setCheckoutData: ({
    address,
    total,
    itemCount,
    checkoutType = "cart",
    singlePayload = null,
  }) =>
    set({ address, total, itemCount, checkoutType, singlePayload }),
  clearCheckoutData: () =>
    set({
      address: null,
      total: 0,
      itemCount: 0,
      checkoutType: "cart",
      singlePayload: null,
    }),
}));
