import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getStatusColor } from "./OrderCard";

export function OrderDetailsModal({
  visible,
  order,
  isLoading,
  onClose,
  onCancel,
  isCancelling,
}: any) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-white">
        <SafeAreaView
          edges={["top"]}
          className="bg-blue-600 px-4 pb-4 flex-row items-center justify-between"
        >
          <Text className="text-xl font-bold text-white">Order Details</Text>
          <Pressable onPress={onClose}>
            <Text className="text-white text-2xl">×</Text>
          </Pressable>
        </SafeAreaView>

        {!order || isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <ScrollView className="flex-1">
            <View className="bg-gray-50 p-4 border-b border-gray-200 flex-row justify-between items-center">
              <View>
                <Text className="text-gray-500 text-xs mb-1">Order ID</Text>
                <Text className="font-bold text-lg">{order.checkoutId}</Text>
              </View>
              <View
                className={`px-4 py-2 rounded-lg ${getStatusColor(order.status)}`}
              >
                <Text className="font-bold">{order.status}</Text>
              </View>
            </View>

            <View className="p-4 border-b border-gray-200">
              <Text className="font-bold text-lg mb-3">Items</Text>
              {order.items?.map((item: any, idx: number) => (
                <View key={idx} className="flex-row mb-4">
                  <Image
                    source={{ uri: item.productId?.images?.[0] }}
                    className="w-16 h-16 rounded-lg bg-gray-200"
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

            <View className="p-4 border-b border-gray-200">
              <Text className="font-bold text-lg mb-3">Delivery Address</Text>
              <Text className="text-gray-700 leading-6">
                {order.deliveryAddress?.street}
                {"\n"}
                {order.deliveryAddress?.city}, {order.deliveryAddress?.zipCode}
                {"\n"}Phone: {order.deliveryAddress?.phone}
                {order.deliveryAddress?.notes &&
                  `\nNotes: ${order.deliveryAddress.notes}`}
              </Text>
            </View>

            <View className="p-4 bg-gray-50 flex-row justify-between items-center">
              <Text className="text-lg font-bold">Total Amount</Text>
              <Text className="text-2xl font-bold text-blue-600">
                ₹{order.totalAmount}
              </Text>
            </View>

            {order.status === "PLACED" && (
              <View className="p-4">
                <Pressable
                  onPress={() => onCancel(order._id)}
                  disabled={isCancelling}
                  className="bg-red-500 py-4 rounded-lg"
                >
                  {isCancelling ? (
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
      </SafeAreaView>
    </Modal>
  );
}
