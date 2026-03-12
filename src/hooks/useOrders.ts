import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert } from "react-native";
import {
  addToCart,
  getOrders,
  getOrderById,
  cancelOrder,
} from "../services/orders.api";

export function useOrders() {
  const queryClient = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const { data: selectedOrder, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["order", selectedOrderId],
    queryFn: () => getOrderById(selectedOrderId!),
    enabled: !!selectedOrderId && showDetailsModal,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", selectedOrderId] });
      Alert.alert("Success", "Order cancelled successfully");
    },
    onError: () => Alert.alert("Error", "Unable to cancel order"),
  });

  const orderAgainMutation = useMutation({
    mutationFn: async (order: any) => {
      const items = order?.items || [];

      for (const item of items) {
        const productId = item?.productId?._id || item?.productId?.id || item?.productId;
        const quantity = Number(item?.quantity || 1);

        if (!productId) continue;
        await addToCart({ productId: String(productId), quantity: quantity > 0 ? quantity : 1 });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      Alert.alert("Success", "Items added to cart");
    },
    onError: () => Alert.alert("Error", "Unable to add items to cart"),
  });

  const handleOrderPress = (orderId?: string) => {
    if (!orderId) return;
    setSelectedOrderId(orderId);
    setShowDetailsModal(true);
  };

  const handleCancelOrder = (orderId: string) => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      { text: "Yes, Cancel", style: "destructive", onPress: () => cancelMutation.mutate(orderId) },
    ]);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedOrderId(null);
  };

  const handleOrderAgain = (order: any) => {
    if (!order?.items?.length) {
      Alert.alert("Info", "No items found in this order");
      return;
    }
    orderAgainMutation.mutate(order);
  };

  const orders = data?.orders || data || [];

  return {
    orders,
    isLoading,
    error,
    selectedOrder,
    isLoadingDetails,
    showDetailsModal,
    isCancelling: cancelMutation.isPending,
    isOrderingAgain: orderAgainMutation.isPending,
    handleOrderPress,
    handleCancelOrder,
    handleOrderAgain,
    handleCloseModal,
    refetch,
  };
}