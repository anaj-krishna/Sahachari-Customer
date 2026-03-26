// useProductActions.ts
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Platform, ToastAndroid } from "react-native";
import { addToCart } from "../services/orders.api";
import { useCheckoutStore } from "../store/checkout.store";

interface DirectCheckoutContext {
  returnTo?: string;
  fromCategory?: string;
}

export function useProductActions(product: any, context?: DirectCheckoutContext) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setCheckoutData = useCheckoutStore((s) => s.setCheckoutData);
  const [loading, setLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    zipCode: "",
    phone: "",
    notes: "",
  });

  const handleAddToCart = async (quantity: number) => {
    setLoading(true);
    try {
      await addToCart({ productId: product.id, quantity });
      await queryClient.invalidateQueries({ queryKey: ["cart"] });

      if (Platform.OS === "android") {
        ToastAndroid.show(
          `Added ${quantity} item(s) to cart`,
          ToastAndroid.SHORT,
        );
      } else {
        Alert.alert("Success", `Added ${quantity} item(s) to cart`);
      }

      return true; // Success indicator
    } catch (err) {
      console.error("Add to cart error:", err);
      Alert.alert("Error", "Failed to add to cart");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async (quantity: number) => {
    if (!address.street || address.street.length < 5 || !address.phone) {
      Alert.alert("Error", "Please fill valid delivery details");
      return false;
    }

    if (!product?.id) {
      Alert.alert("Error", "Product details are missing. Please retry.");
      return false;
    }

    const basePrice = Number(product?.finalPrice ?? product?.price ?? 0);

    setLoading(true);
    try {
      setCheckoutData({
        address,
        total: basePrice * quantity,
        itemCount: quantity,
        checkoutType: "single",
        singlePayload: {
          productId: String(product.id),
          quantity,
          returnTo: context?.returnTo,
          fromCategory: context?.fromCategory,
        },
      });
      router.push("/payment");
      return true;
    } catch (err: any) {
      console.error("Buy now error:", err);
      const msg = err?.response?.data?.message;
      Alert.alert("Order Failed", Array.isArray(msg) ? msg[0] : msg || "Error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    address,
    setAddress,
    showAddressModal,
    setShowAddressModal,
    showQuantityModal,
    setShowQuantityModal,
    handleAddToCart,
    handleBuyNow,
  };
}
