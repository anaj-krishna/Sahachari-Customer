import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getCart,
  placeOrder,
  removeCartItem,
  updateCartItemQuantity,
} from "../services/orders.api";

export function useCart() {
  const queryClient = useQueryClient();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [optimisticQty, setOptimisticQty] = useState<Record<string, number>>({});
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [address, setAddress] = useState({
    street: "",
    city: "",
    zipCode: "",
    phone: "",
    notes: "",
  });

  const { data: cart, isLoading, refetch } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });

  /* ================= UPDATE QUANTITY ================= */

  const updateQuantityMutation = useMutation({
    mutationFn: ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => updateCartItemQuantity(itemId, quantity),

    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previous = queryClient.getQueryData<any>(["cart"]);

      // local instant override for total/UI
      setOptimisticQty((prev) => ({ ...prev, [itemId]: quantity }));

      queryClient.setQueryData(["cart"], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          items: old.items.map((item: any) => {
            const keys = getItemKeys(item);
            const isTarget = keys.includes(itemId);
            return isTarget ? { ...item, quantity } : item;
          }),
        };
      });

      setUpdatingItems((prev) => new Set(prev).add(itemId));
      return { previous, itemId };
    },

    onError: (_, __, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(["cart"], context.previous);
      }
      if (context?.itemId) {
        setOptimisticQty((prev) => {
          const next = { ...prev };
          delete next[context.itemId];
          return next;
        });
      }
    },

    onSuccess: (updatedCart, variables) => {
      queryClient.setQueryData(["cart"], updatedCart);
      setOptimisticQty((prev) => {
        const next = { ...prev };
        delete next[variables.itemId];
        return next;
      });
    },

    onSettled: (_, __, context: any) => {
      if (context?.itemId) {
        setUpdatingItems((prev) => {
          const next = new Set(prev);
          next.delete(context.itemId);
          return next;
        });
      }
    },
  });

  /* ================= REMOVE ITEM ================= */

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),

    onMutate: async (itemId: string) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previous = queryClient.getQueryData<any>(["cart"]);

      queryClient.setQueryData(["cart"], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          items: old.items.filter(
            (item: any) => item._id?.toString() !== itemId
          ),
        };
      });

      setUpdatingItems((prev) => new Set(prev).add(itemId));

      return { previous, itemId };
    },

    onError: (_, __, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(["cart"], context.previous);
      }
    },

    onSettled: (_, __, context: any) => {
      if (context?.itemId) {
        setUpdatingItems((prev) => {
          const next = new Set(prev);
          next.delete(context.itemId);
          return next;
        });
      }
    },
  });

  /* ================= PLACE ORDER ================= */

  const placeOrderMutation = useMutation({
    mutationFn: placeOrder,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      setShowCheckoutModal(false);
      setTimeout(() => setShowSuccessModal(true), 250);

      setAddress({
        street: "",
        city: "",
        zipCode: "",
        phone: "",
        notes: "",
      });
    },
  });

  /* ================= HELPERS ================= */

  const parseNumber = (v: any) => {
    if (v == null) return 0;
    const n = Number(v);
    if (Number.isFinite(n)) return n;
    const cleaned = parseFloat(String(v).replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(cleaned) ? cleaned : 0;
  };

  const getItemKeys = (item: any) =>
    [
      item?._id?.toString?.(),
      item?.id?.toString?.(),
      item?.productId?._id?.toString?.(),
      item?.productId?.id?.toString?.(),
    ].filter(Boolean) as string[];

  const total =
    cart?.items?.reduce((sum: number, item: any) => {
      const price = parseNumber(item.productId?.price ?? item.price ?? 0);
      const keys = getItemKeys(item);
      const optimistic = keys.find((k) => optimisticQty[k] != null);
      const qty = optimistic != null
        ? parseNumber(optimisticQty[optimistic])
        : parseNumber(item.quantity ?? 0);

      return sum + price * qty;
    }, 0) || 0;

  /* ================= RETURN ================= */

  return {
    cart,
    isLoading,
    total,
    updatingItems,
    showCheckoutModal,
    setShowCheckoutModal,
    showSuccessModal,
    setShowSuccessModal,
    address,
    setAddress,

    handleQuantityChange: (id: string, cur: number, delta: number) => {
      const next = parseNumber(cur) + parseNumber(delta);
      if (next >= 1) {
        updateQuantityMutation.mutate({ itemId: id, quantity: next });
      }
    },

    handleRemoveItem: (id: string) => {
      removeItemMutation.mutate(id);
    },

    handleCheckout: () => {
      if (!address.street || !address.city || !address.zipCode || !address.phone) {
        alert("Please fill in all required fields");
        return;
      }

      placeOrderMutation.mutate(address);
    },

    isPlacingOrder: placeOrderMutation.isPending,
    parseNumber,
    refetch,
  };
}