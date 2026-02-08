// components/orders/OrderDetailsModal.tsx
import { ChevronLeft, CreditCard, MapPin, Package, Phone, StickyNote, X } from "lucide-react-native";
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

const getStatusEmoji = (status: string) => {
  const emojis: Record<string, string> = {
    PLACED: '📦',
    CONFIRMED: '✅',
    SHIPPED: '🚚',
    DELIVERED: '🎉',
    CANCELLED: '❌',
  };
  return emojis[status] || '📋';
};

const getStatusTextColor = (status: string) => {
  const colors: Record<string, string> = {
    PLACED: 'text-yellow-800',
    CONFIRMED: 'text-blue-800',
    SHIPPED: 'text-purple-800',
    DELIVERED: 'text-green-800',
    CANCELLED: 'text-red-800',
  };
  return colors[status] || 'text-gray-800';
};

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
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-gray-50">
        {/* Premium Header with Back Button */}
        <View className="bg-white px-4 py-4 shadow-sm border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            {/* Back Button */}
            <Pressable 
              onPress={onClose}
              className="bg-gray-100 p-2 rounded-full active:bg-gray-200 mr-3"
            >
              <ChevronLeft size={24} color="#374151" />
            </Pressable>

            {/* Title */}
            <View className="flex-row items-center flex-1">
              <View className="bg-blue-100 p-2 rounded-full mr-3">
                <Package size={20} color="#3B82F6" />
              </View>
              <Text className="text-xl font-bold text-gray-800">Order Details</Text>
            </View>

            {/* Close Button */}
            <Pressable 
              onPress={onClose}
              className="bg-gray-100 p-2 rounded-full active:bg-gray-200"
            >
              <X size={24} color="#374151" />
            </Pressable>
          </View>
        </View>

        {!order || isLoading ? (
          <View className="flex-1 items-center justify-center">
            <View className="bg-white p-8 rounded-3xl shadow-lg items-center">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="text-gray-500 mt-4 font-medium">Loading details...</Text>
            </View>
          </View>
        ) : (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Order Status Card */}
            <View className="mx-4 mt-4 bg-white rounded-3xl shadow-md overflow-hidden">
              <View className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                <View className="flex-row justify-between items-center mb-4">
                  <View>
                    <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">
                      Order ID
                    </Text>
                    <Text className="font-bold text-xl text-gray-800">
                      #{order.checkoutId}
                    </Text>
                  </View>
                  <View className="bg-white rounded-full p-3 shadow-sm">
                    <Text className="text-3xl">{getStatusEmoji(order.status)}</Text>
                  </View>
                </View>
                <View
                  className={`px-5 py-3 rounded-full self-start ${getStatusColor(order.status)} shadow-sm`}
                >
                  <Text className={`font-bold text-sm uppercase tracking-wide ${getStatusTextColor(order.status)}`}>
                    {order.status}
                  </Text>
                </View>
              </View>
            </View>

            {/* Items Section */}
            <View className="mx-4 mt-4 bg-white rounded-3xl shadow-md p-6">
              <View className="flex-row items-center mb-4">
                <View className="bg-green-100 p-2 rounded-lg mr-3">
                  <Package size={20} color="#10B981" />
                </View>
                <Text className="font-bold text-xl text-gray-800">Order Items</Text>
              </View>
              
              {order.items?.map((item: any, idx: number) => (
                <View 
                  key={idx} 
                  className="flex-row mb-4 pb-4 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0"
                >
                  <View className="relative">
                    <Image
                      source={{ uri: item.productId?.images?.[0] }}
                      className="w-20 h-20 rounded-xl bg-gray-100"
                    />
                    <View className="absolute -top-2 -right-2 bg-blue-600 rounded-full w-6 h-6 items-center justify-center shadow-md">
                      <Text className="text-white text-xs font-bold">{item.quantity}</Text>
                    </View>
                  </View>
                  <View className="flex-1 ml-4 justify-center">
                    <Text className="font-bold text-gray-800 text-base mb-1">
                      {item.productId?.name}
                    </Text>
                    <Text className="text-gray-500 text-sm mb-2">
                      {item.quantity} × ₹{item.price?.toFixed(2)}
                    </Text>
                    <View className="bg-blue-50 px-3 py-1 rounded-full self-start">
                      <Text className="font-bold text-blue-700">
                        ₹{(item.quantity * item.price)?.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Delivery Address Section */}
            <View className="mx-4 mt-4 bg-white rounded-3xl shadow-md p-6">
              <View className="flex-row items-center mb-4">
                <View className="bg-red-100 p-2 rounded-lg mr-3">
                  <MapPin size={20} color="#EF4444" />
                </View>
                <Text className="font-bold text-xl text-gray-800">Delivery Address</Text>
              </View>
              
              <View className="bg-gray-50 rounded-xl p-4">
                <Text className="text-gray-800 leading-6 text-base mb-3">
                  {order.deliveryAddress?.street}
                </Text>
                <Text className="text-gray-700 font-medium mb-3">
                  {order.deliveryAddress?.city}, {order.deliveryAddress?.zipCode}
                </Text>
                
                <View className="flex-row items-center pt-3 border-t border-gray-200">
                  <View className="bg-blue-100 p-2 rounded-lg mr-3">
                    <Phone size={16} color="#3B82F6" />
                  </View>
                  <Text className="text-gray-700 font-semibold">
                    {order.deliveryAddress?.phone}
                  </Text>
                </View>
                
                {order.deliveryAddress?.notes && (
                  <View className="mt-3 pt-3 border-t border-gray-200">
                    <View className="flex-row items-start">
                      <StickyNote size={16} color="#F59E0B" className="mr-2 mt-0.5" />
                      <View className="flex-1">
                        <Text className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-wide">
                          Delivery Notes
                        </Text>
                        <Text className="text-gray-700 italic">
                          {order.deliveryAddress.notes}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Total Amount Section */}
            <View className="mx-4 mt-4 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-lg p-6">
              <View className="flex-row items-center mb-3">
                <View className="bg-white/20 p-2 rounded-lg mr-3">
                  <CreditCard size={20} color="white" />
                </View>
                <Text className="text-white text-lg font-semibold">Total Amount</Text>
              </View>
              <Text className="text-white text-4xl font-bold">
                ₹{order.totalAmount?.toFixed(2)}
              </Text>
              <Text className="text-white/70 text-sm mt-2">
                Including all taxes and fees
              </Text>
            </View>

            {/* Cancel Order Button */}
            {order.status === "PLACED" && (
              <View className="px-4 pb-6">
                <Pressable
                  onPress={() => onCancel(order._id)}
                  disabled={isCancelling}
                  className="bg-red-500 py-4 rounded-2xl shadow-lg active:bg-red-600"
                >
                  {isCancelling ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <View className="flex-row items-center justify-center">
                      <X size={20} color="white" />
                      <Text className="text-white text-center font-bold text-lg ml-2">
                        Cancel Order
                      </Text>
                    </View>
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