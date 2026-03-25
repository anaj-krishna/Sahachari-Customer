// app/(tabs)/orders/index.tsx
import { useRouter } from "expo-router";
import { AlertCircle, RefreshCw, ShoppingBag } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OrderCard } from "@/components/orders/OrderCard";
import { OrderDetailsModal } from "@/components/orders/OrderDetailsModal";
import { useOrders } from "@/hooks/useOrders";
import { useSmartRefresh } from "@/hooks/useSmartRefresh";

export default function Orders() {
  const router = useRouter();
  const {
    orders,
    isLoading,
    error,
    selectedOrder,
    isLoadingDetails,
    showDetailsModal,
    isCancelling,
    isOrderingAgain,
    handleOrderPress,
    handleCancelOrder,
    handleOrderAgain,
    handleCloseModal,
    refetch,
  } = useOrders();

  const { onScroll, getRefreshControlProps } = useSmartRefresh(async () => {
    await refetch();
  });

  const openOrderProduct = (productId?: string) => {
    if (!productId) return;

    router.push({
      pathname: "/product/[id]",
      params: { id: productId, returnTo: "orders" },
    } as any);
  };

  const renderOrder = ({ item }: { item: any }) => {
    if (!item) return null;

    return (
      <OrderCard
        order={item}
        onPress={() => handleOrderPress(item?._id ?? item?.id)}
        isCancelling={
          (isCancelling && selectedOrder?._id === item._id) || isOrderingAgain
        }
        onRateOrder={() =>
          Alert.alert("Coming Soon", "Rate order feature will be available soon")
        }
        onOrderAgain={() => handleOrderAgain(item)}
        onProductPress={openOrderProduct}
      />
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <View className="bg-white p-8 rounded-3xl shadow-xl items-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="mt-4 text-gray-600 font-semibold">Loading your orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !orders?.length) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-6">
        <View className="bg-white rounded-3xl shadow-2xl p-8 items-center max-w-sm mx-auto">
          <View className={`${error ? 'bg-red-100' : 'bg-blue-100'} p-6 rounded-full mb-6`}>
            {error ? (
              <AlertCircle size={48} color="#dc2626" />
            ) : (
              <ShoppingBag size={48} color="#2563eb" />
            )}
          </View>
          
          <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
            {error ? "Oops! Something went wrong" : "No orders yet"}
          </Text>
          
          <Text className="text-gray-500 text-center mb-6 leading-6">
            {error 
              ? "We couldn't load your orders. Please try again." 
              : "Start shopping and your orders will appear here"}
          </Text>
          
          <Pressable 
            onPress={() => error ? refetch() : router.push("/(tabs)/home")} 
            className="bg-blue-600 px-8 py-4 rounded-2xl shadow-lg active:bg-blue-700 flex-row items-center"
          >
            {error && <RefreshCw size={20} color="white" className="mr-2" />}
            <Text className="text-white font-bold text-lg ml-2">
              {error ? "Try Again" : "Start Shopping"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.headerWrap}>
        <Text style={styles.headerTitle}>Orders</Text>
        <Text style={styles.headerSubTitle}>
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} in total
        </Text>
      </View>

      <FlatList
        style={styles.container}
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(o: any) =>
          o?._id?.toString?.() ?? String(o?.id)
        }
        refreshControl={
          <RefreshControl {...getRefreshControlProps()} />
        }
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={<View style={styles.header} />}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      
      <OrderDetailsModal
        visible={showDetailsModal}
        order={selectedOrder}
        isLoading={isLoadingDetails}
        onClose={handleCloseModal}
        onCancel={handleCancelOrder}
        isCancelling={isCancelling}
        isOrderingAgain={isOrderingAgain}
        onOrderAgain={() => handleOrderAgain(selectedOrder)}
        onOpenProduct={openOrderProduct}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EEF4FF" },
  headerWrap: {
    backgroundColor: "#F5F8FF",
    borderBottomWidth: 1,
    borderBottomColor: "#D6E4FF",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  headerTitle: {
    textAlign: "center",
    color: "#123C7A",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  headerSubTitle: {
    textAlign: "center",
    color: "#5F7EA8",
    fontSize: 14,
    marginTop: 4,
    fontWeight: "600",
  },
  container: { flex: 1 },
  header: { height: 12 },
  separator: { height: 14 },
});