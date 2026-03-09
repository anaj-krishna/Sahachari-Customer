import { CheckCircle } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  orderResponse?: any;
}

export function SuccessModal({
  visible,
  onClose,
  orderResponse,
}: SuccessModalProps) {
  // Handle both cart checkout (orders array) and single order (order object)
  const isSingleOrder =
    orderResponse?.order && !Array.isArray(orderResponse.order);
  const orders = isSingleOrder
    ? [orderResponse.order]
    : orderResponse?.orders || [];
  const hasMultipleOrders = orders.length > 1;
  const checkoutId = isSingleOrder
    ? orderResponse?.order?.checkoutId
    : orderResponse?.checkoutId;
  const totalAmount = isSingleOrder
    ? orderResponse?.order?.totalAmount
    : orderResponse?.totalAmount;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-3xl p-8 items-center max-w-sm w-full max-h-[80%]">
          {/* Success Icon */}
          <View className="bg-green-100 rounded-full p-4 mb-6">
            <CheckCircle size={64} color="#22C55E" strokeWidth={2} />
          </View>

          {/* Success Message */}
          <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Order Placed Successfully!
          </Text>
          <Text className="text-gray-600 text-center mb-6 text-sm">
            Your order has been placed and will be delivered soon.
          </Text>

          {/* Order Summary */}
          {orderResponse && (
            <ScrollView className="w-full mb-6 max-h-48">
              <View className="bg-blue-50 rounded-2xl p-4 mb-4">
                <Text className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                  Checkout ID
                </Text>
                <Text className="text-lg font-bold text-blue-900 mb-3">
                  {checkoutId}
                </Text>

                {hasMultipleOrders && (
                  <Text className="text-xs text-blue-700 mb-2">
                    {orders.length} {orders.length === 1 ? "Order" : "Orders"}{" "}
                    Created
                  </Text>
                )}

                <View className="border-t border-blue-200 pt-3 mt-3">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm font-medium text-gray-700">
                      Items Subtotal
                    </Text>
                    <Text className="text-sm font-bold text-gray-900">
                      ₹
                      {orders
                        .reduce(
                          (sum: number, o: any) => sum + (o.itemsSubtotal || 0),
                          0,
                        )
                        .toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm font-medium text-gray-700">
                      Delivery Charge
                    </Text>
                    <Text className="text-sm font-bold text-orange-600">
                      ₹
                      {orders
                        .reduce(
                          (sum: number, o: any) =>
                            sum + (o.deliveryCharge || 0),
                          0,
                        )
                        .toFixed(2)}
                    </Text>
                  </View>
                  <View className="border-t border-blue-200 pt-2 mt-2 flex-row justify-between">
                    <Text className="text-sm font-bold text-gray-800">
                      Total Amount
                    </Text>
                    <Text className="text-lg font-bold text-green-600">
                      ₹{totalAmount?.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Per-Order breakdown if multiple orders */}
              {hasMultipleOrders && (
                <View>
                  <Text className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Order Breakdown
                  </Text>
                  {orders.map((order: any, idx: number) => (
                    <View key={idx} className="bg-gray-50 rounded-xl p-3 mb-2">
                      <Text className="text-xs font-semibold text-gray-700 mb-2">
                        Order {idx + 1}
                      </Text>
                      <View className="flex-row justify-between text-xs mb-1">
                        <Text className="text-gray-600">
                          Items: ₹{order.itemsSubtotal?.toFixed(2)}
                        </Text>
                        <Text className="text-gray-600">
                          Delivery: ₹{order.deliveryCharge?.toFixed(2)}
                        </Text>
                      </View>
                      <Text className="text-xs font-bold text-blue-700">
                        Total: ₹{order.totalAmount?.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          )}

          {/* Continue Shopping Button */}
          <Pressable
            onPress={onClose}
            className="bg-blue-600 py-4 rounded-xl w-full items-center active:bg-blue-700"
          >
            <Text className="text-white font-bold text-lg">
              Continue Shopping
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
