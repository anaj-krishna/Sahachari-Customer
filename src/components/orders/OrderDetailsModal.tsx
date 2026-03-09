// components/orders/OrderDetailsModal.tsx
import { LinearGradient } from "expo-linear-gradient";
import {
    ChevronLeft,
    CreditCard,
    MapPin,
    Package,
    Phone,
    StickyNote,
    X,
} from "lucide-react-native";
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
    PLACED: "📦",
    CONFIRMED: "✅",
    SHIPPED: "🚚",
    DELIVERED: "🎉",
    CANCELLED: "❌",
  };
  return emojis[status] || "📋";
};

const getStatusTextColor = (status: string) => {
  const colors: Record<string, string> = {
    PLACED: "text-yellow-800",
    CONFIRMED: "text-blue-800",
    SHIPPED: "text-purple-800",
    DELIVERED: "text-green-800",
    CANCELLED: "text-red-800",
  };
  return colors[status] || "text-gray-800";
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
        <LinearGradient
          colors={["#1E3A8A", "#2563EB", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingBottom: 18 }}
        >
          <View className="px-4 pt-4">
            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={onClose}
                className="bg-white/20 p-2 rounded-full active:bg-white/30"
              >
                <ChevronLeft size={22} color="#FFFFFF" />
              </Pressable>

              <View className="flex-row items-center">
                <View className="bg-white/20 p-2 rounded-full mr-2">
                  <Package size={18} color="#FFFFFF" />
                </View>
                <Text className="text-lg font-bold text-white">
                  Order Details
                </Text>
              </View>

              <Pressable
                onPress={onClose}
                className="bg-white/20 p-2 rounded-full active:bg-white/30"
              >
                <X size={22} color="#FFFFFF" />
              </Pressable>
            </View>

            {order?.checkoutId && (
              <View className="mt-4 bg-white/15 rounded-2xl p-4 border border-white/15">
                <Text className="text-blue-100 text-xs font-semibold uppercase tracking-wider">
                  Order ID
                </Text>
                <Text className="text-white text-xl font-bold mt-1">
                  #{order.checkoutId}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {!order || isLoading ? (
          <View className="flex-1 items-center justify-center">
            <View className="bg-white p-8 rounded-3xl shadow-lg items-center">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="text-gray-500 mt-4 font-medium">
                Loading details...
              </Text>
            </View>
          </View>
        ) : (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="mx-4 mt-4 bg-white rounded-3xl shadow-md overflow-hidden">
              <LinearGradient
                colors={["#EFF6FF", "#EEF2FF", "#F5F3FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View className="p-6">
                  <View className="flex-row justify-between items-center mb-4">
                    <View>
                      <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">
                        Status
                      </Text>
                      <Text className="font-bold text-xl text-gray-800">
                        {order.status}
                      </Text>
                    </View>
                    <View className="bg-white rounded-full p-3 shadow-sm">
                      <Text className="text-3xl">
                        {getStatusEmoji(order.status)}
                      </Text>
                    </View>
                  </View>
                  <View
                    className={`px-5 py-3 rounded-full self-start ${getStatusColor(order.status)} shadow-sm`}
                  >
                    <Text
                      className={`font-bold text-sm uppercase tracking-wide ${getStatusTextColor(order.status)}`}
                    >
                      {order.status}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Items Section */}
            <View className="mx-4 mt-4 bg-white rounded-3xl shadow-md p-6">
              <View className="flex-row items-center mb-4">
                <View className="bg-emerald-100 p-2 rounded-lg mr-3">
                  <Package size={20} color="#10B981" />
                </View>
                <Text className="font-bold text-xl text-gray-800">
                  Order Items
                </Text>
              </View>

              {order.items?.map((item: any, idx: number) => (
                <View
                  key={idx}
                  className="flex-row mb-4 pb-4 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0"
                >
                  <View className="flex-1 justify-center">
                    <View className="flex-row items-center mb-1">
                      <Image
                        source={{ uri: item.productId?.images?.[0] }}
                        className="w-6 h-6 rounded-md bg-gray-100 mr-2"
                      />
                      <Text
                        className="font-bold text-gray-800 text-base flex-1"
                        numberOfLines={1}
                      >
                        {item.productId?.name}
                      </Text>
                      <View className="bg-blue-600 rounded-full w-6 h-6 items-center justify-center ml-2">
                        <Text className="text-white text-xs font-bold">
                          {item.quantity}
                        </Text>
                      </View>
                    </View>
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
                <View className="bg-rose-100 p-2 rounded-lg mr-3">
                  <MapPin size={20} color="#EF4444" />
                </View>
                <Text className="font-bold text-xl text-gray-800">
                  Delivery Address
                </Text>
              </View>

              <View className="bg-gray-50 rounded-2xl p-4">
                <Text className="text-gray-800 leading-6 text-base mb-3">
                  {order.deliveryAddress?.street}
                </Text>
                <Text className="text-gray-700 font-medium mb-3">
                  {order.deliveryAddress?.city},{" "}
                  {order.deliveryAddress?.zipCode}
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
                      <StickyNote
                        size={16}
                        color="#F59E0B"
                        className="mr-2 mt-0.5"
                      />
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
            <View className="mx-4 mt-4 mb-4 rounded-3xl shadow-lg overflow-hidden">
              <LinearGradient
                colors={["#2563EB", "#1D4ED8", "#312E81"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View className="p-6">
                  <View className="flex-row items-center mb-3">
                    <View className="bg-white/20 p-2 rounded-lg mr-3">
                      <CreditCard size={20} color="white" />
                    </View>
                    <Text className="text-white text-lg font-semibold">
                      Total Amount
                    </Text>
                  </View>

                  {/* Breakdown Section */}
                  <View className="bg-white/10 rounded-2xl p-4 mb-4">
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="text-white/80 text-sm">
                        Items Subtotal
                      </Text>
                      <Text className="text-white font-semibold">
                        ₹{order.itemsSubtotal?.toFixed(2)}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center pb-3 border-b border-white/20">
                      <Text className="text-white/80 text-sm">
                        Delivery Charge
                      </Text>
                      <Text className="text-orange-300 font-semibold">
                        ₹{order.deliveryCharge?.toFixed(2)}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center pt-3">
                      <Text className="text-white font-semibold">Total</Text>
                      <Text className="text-white text-2xl font-bold">
                        ₹{order.totalAmount?.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-white/70 text-xs text-center">
                    Including all taxes and delivery charges
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Cancel Order Button */}
            {order.status === "PLACED" && (
              <View className="px-4 pb-6">
                <Pressable
                  onPress={() => onCancel(order._id)}
                  disabled={isCancelling}
                  className="py-4 rounded-2xl shadow-lg active:bg-red-700"
                  style={{ backgroundColor: "#DC2626", opacity: 1 }}
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
