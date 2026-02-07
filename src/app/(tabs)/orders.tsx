import { FlatList, Text, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useOrders } from "../../hooks/useOrders";
import { OrderCard } from "../../components/orders/OrderCard";
import { OrderDetailsModal } from "../../components/orders/OrderDetailsModal";

export default function Orders() {
  const router = useRouter();
  const { 
    orders, isLoading, error, selectedOrder, isLoadingDetails, 
    showDetailsModal, isCancelling, handleOrderPress, handleCancelOrder, 
    handleCloseModal, refetch 
  } = useOrders();

  if (isLoading) return (
    <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
      <ActivityIndicator size="large" color="#2563eb" />
      <Text className="mt-2 text-gray-500">Loading orders...</Text>
    </SafeAreaView>
  );

  if (error || !orders.length) return (
    <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-6">
      <Text className="text-6xl mb-4">{error ? "⚠️" : "📦"}</Text>
      <Text className="text-xl font-bold text-gray-800 mb-2">{error ? "Error loading orders" : "No orders yet"}</Text>
      <Pressable onPress={() => error ? refetch() : router.push("/home")} className="bg-blue-600 px-6 py-3 rounded-lg">
        <Text className="text-white font-bold">{error ? "Retry" : "Start Shopping"}</Text>
      </Pressable>
    </SafeAreaView>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
      <FlatList
        data={orders}
        contentContainerStyle={{ padding: 16 }}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <OrderCard item={item} onPress={handleOrderPress} />}
      />
      <OrderDetailsModal
        visible={showDetailsModal}
        order={selectedOrder}
        isLoading={isLoadingDetails}
        onClose={handleCloseModal}
        onCancel={handleCancelOrder}
        isCancelling={isCancelling}
      />
    </SafeAreaView>
  );
}