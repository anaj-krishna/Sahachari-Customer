import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { cancelOrder, getOrderById, getOrders } from "../../services/orders.api";

export default function Orders() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // ✅ Use React Query for order details
  const { data: selectedOrder } = useQuery({
    queryKey: ["order", selectedOrderId],
    queryFn: () => getOrderById(selectedOrderId!),
    enabled: !!selectedOrderId && showDetailsModal,
  });

  // ✅ Use mutation for canceling
  const cancelMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      // ✅ Invalidate BOTH queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", selectedOrderId] });
      Alert.alert("Success", "Order cancelled successfully");
    },
    onError: () => {
      Alert.alert("Error", "Unable to cancel order");
    },
  });

  const handleOrderPress = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowDetailsModal(true);
  };

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => cancelMutation.mutate(orderId),
        },
      ]
    );
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedOrderId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLACED":
        return "bg-blue-100 text-blue-700";
      case "CONFIRMED":
        return "bg-green-100 text-green-700";
      case "DELIVERED":
        return "bg-green-500 text-white";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-2 text-gray-500">Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text className="text-xl font-bold text-red-600 mb-2">Error loading orders</Text>
        <Text className="text-gray-500 text-center mb-4">{String(error)}</Text>
        <Pressable
          onPress={() => queryClient.invalidateQueries({ queryKey: ["orders"] })}
          className="bg-blue-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-bold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  // Handle different response structures
  const orders = data?.orders || data || [];

  if (!orders || orders.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text className="text-6xl mb-4">📦</Text>
        <Text className="text-xl font-bold text-gray-800 mb-2">No orders yet</Text>
        <Text className="text-gray-500 text-center mb-6">
          Your past orders will appear here
        </Text>
        <Pressable
          onPress={() => router.push("/(tabs)/home")}
          className="bg-blue-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-bold">Start Shopping</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={orders}
        contentContainerStyle={{ padding: 16 }}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleOrderPress(item._id)}
            className="bg-white rounded-xl p-4 mb-3 shadow-sm"
          >
            {/* Order Header */}
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="text-xs text-gray-500 mb-1">Order ID</Text>
                <Text className="font-bold text-gray-800">{item.checkoutId}</Text>
              </View>
              <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
                <Text className="text-xs font-semibold">{item.status}</Text>
              </View>
            </View>

            {/* Store Info */}
            <View className="flex-row items-center mb-3 pb-3 border-b border-gray-100">
              <Text className="text-gray-600">
                🏪 {item.storeId?.name || "Store"}
              </Text>
            </View>

            {/* Items Preview */}
            <View className="mb-3">
              <Text className="text-gray-500 text-xs mb-2">
                {item.items?.length} item(s)
              </Text>
              {item.items?.slice(0, 2).map((orderItem: any, idx: number) => (
                <Text key={idx} className="text-gray-700 text-sm">
                  • {orderItem.productId?.name || "Product"} × {orderItem.quantity}
                </Text>
              ))}
              {item.items?.length > 2 && (
                <Text className="text-gray-400 text-xs mt-1">
                  +{item.items.length - 2} more items
                </Text>
              )}
            </View>

            {/* Total */}
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-500">Total Amount</Text>
              <Text className="text-xl font-bold text-blue-600">
                ₹{item.totalAmount}
              </Text>
            </View>
          </Pressable>
        )}
      />

      {/* Order Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View className="flex-1 bg-white">
          {/* Modal Header */}
          <View className="bg-blue-600 px-4 pt-12 pb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-white">Order Details</Text>
            <Pressable onPress={handleCloseModal}>
              <Text className="text-white text-2xl">×</Text>
            </Pressable>
          </View>

          {!selectedOrder ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : (
            <ScrollView className="flex-1">
              {/* Status Banner */}
              <View className="bg-gray-50 p-4 border-b border-gray-200">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-gray-500 text-xs mb-1">Order ID</Text>
                    <Text className="font-bold text-lg">{selectedOrder.checkoutId}</Text>
                  </View>
                  <View className={`px-4 py-2 rounded-lg ${getStatusColor(selectedOrder.status)}`}>
                    <Text className="font-bold">{selectedOrder.status}</Text>
                  </View>
                </View>
              </View>

              {/* Items */}
              <View className="p-4 border-b border-gray-200">
                <Text className="font-bold text-lg mb-3">Items</Text>
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <View key={idx} className="flex-row mb-4">
                    <Image
                      source={{ uri: item.productId?.images?.[0] }}
                      className="w-16 h-16 rounded-lg bg-gray-200"
                      resizeMode="cover"
                    />
                    <View className="flex-1 ml-3">
                      <Text className="font-semibold text-gray-800">
                        {item.productId?.name}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        Qty: {item.quantity} × ₹{item.price}
                      </Text>
                      <Text className="font-bold text-blue-600 mt-1">
                        ₹{item.quantity * item.price}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Delivery Address */}
              <View className="p-4 border-b border-gray-200">
                <Text className="font-bold text-lg mb-3">Delivery Address</Text>
                <Text className="text-gray-700 leading-6">
                  {selectedOrder.deliveryAddress?.street}
                  {"\n"}
                  {selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.zipCode}
                  {"\n"}
                  Phone: {selectedOrder.deliveryAddress?.phone}
                  {selectedOrder.deliveryAddress?.notes && (
                    <>
                      {"\n"}Notes: {selectedOrder.deliveryAddress.notes}
                    </>
                  )}
                </Text>
              </View>

              {/* Store Info */}
              <View className="p-4 border-b border-gray-200">
                <Text className="font-bold text-lg mb-2">Store</Text>
                <Text className="text-gray-700">
                  🏪 {selectedOrder.storeId?.name || selectedOrder.storeId || "Store Name"}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Pickup: {selectedOrder.pickupAddress}
                </Text>
              </View>

              {/* Total */}
              <View className="p-4 bg-gray-50">
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-bold">Total Amount</Text>
                  <Text className="text-2xl font-bold text-blue-600">
                    ₹{selectedOrder.totalAmount}
                  </Text>
                </View>
              </View>

              {/* Cancel Button */}
              {selectedOrder.status === "PLACED" && (
                <View className="p-4">
                  <Pressable
                    onPress={() => handleCancelOrder(selectedOrder._id)}
                    disabled={cancelMutation.isPending}
                    className="bg-red-500 py-4 rounded-lg"
                  >
                    {cancelMutation.isPending ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white text-center font-bold text-lg">
                        Cancel Order
                      </Text>
                    )}
                  </Pressable>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}