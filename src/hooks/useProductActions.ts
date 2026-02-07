// This extracts the "Add to Cart" and "Buy Now" logic.
import { useState } from "react";
import { Alert, Platform, ToastAndroid } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { addToCart, placeSingleOrder } from "../services/orders.api";

export function useProductActions(product: any) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [address, setAddress] = useState({ street: "", city: "", zipCode: "", phone: "", notes: "" });

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await addToCart({ productId: product.id, quantity: 1 });
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      
      if (Platform.OS === "android") {
        ToastAndroid.show("Added to cart", ToastAndroid.SHORT);
      } else {
        Alert.alert("Success", "Added to cart");
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      Alert.alert("Error", "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!address.street || address.street.length < 5 || !address.phone) {
      Alert.alert("Error", "Please fill valid delivery details");
      return;
    }

    setLoading(true);
    try {
      await placeSingleOrder({
        productId: product.id,
        quantity: 1,
        deliveryAddress: address,
      });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      setShowAddressModal(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Buy now error:", err);
      const msg = err?.response?.data?.message;
      Alert.alert("Order Failed", Array.isArray(msg) ? msg[0] : msg || "Error");
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
    showSuccessModal,
    setShowSuccessModal,
    handleAddToCart,
    handleBuyNow,
  };
}