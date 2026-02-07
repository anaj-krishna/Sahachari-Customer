import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  CheckCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getCart,
  placeOrder,
  removeCartItem,
  updateCartItemQuantity,
} from "../../services/orders.api";

export default function Cart() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form state
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItemQuantity(itemId, quantity),
    onMutate: ({ itemId }) => {
      setUpdatingItems((prev) => new Set(prev).add(itemId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onSettled: (_, __, { itemId }) => {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onMutate: (itemId: string) => {
      setUpdatingItems((prev) => new Set(prev).add(itemId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onSettled: (_, __, itemId) => {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: (orderData: {
      street: string;
      city: string;
      zipCode: string;
      phone: string;
      notes: string;
    }) => placeOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setShowCheckoutModal(false);
      setShowSuccessModal(true);
      // Reset form
      setStreet("");
      setCity("");
      setZipCode("");
      setPhone("");
      setNotes("");
    },
  });

  const cart = data;

  // Helper to coerce various price/quantity formats into numbers
  const parseNumber = (v: any) => {
    if (v == null) return 0;
    const n = Number(v);
    if (Number.isFinite(n)) return n;
    const cleaned = parseFloat(String(v).replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(cleaned) ? cleaned : 0;
  };

  // Calculate total (no tax) using parsed numbers
  const total =
    cart?.items?.reduce((sum: number, item: any) => {
      const price = parseNumber(item.productId?.price ?? item.price ?? 0);
      const qty = parseNumber(item.quantity ?? item.qty ?? 0);
      return sum + price * qty;
    }, 0) || 0;

  const isEmpty = !cart || !cart.items?.length;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#1877F2" />
        <Text className="text-gray-600 mt-4 text-base">
          Loading your cart...
        </Text>
      </View>
    );
  }

  const handleQuantityChange = (
    itemId: string,
    currentQty: number,
    delta: number,
  ) => {
    const newQty = currentQty + delta;
    if (newQty >= 1) {
      updateQuantityMutation.mutate({ itemId, quantity: newQty });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const handleCheckout = () => {
    if (!street || !city || !zipCode || !phone) {
      alert("Please fill in all required fields");
      return;
    }
    placeOrderMutation.mutate({
      street,
      city,
      zipCode,
      phone,
      notes,
    });
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push("/(tabs)/home");
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">Shopping Cart</Text>
        <Text className="text-gray-500 mt-1">
          {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
        </Text>
      </View>

      {/* Cart Items or Empty State */}
      {isEmpty ? (
        <View className="flex-1 items-center justify-center px-6 pt-6">
          <View className="bg-blue-50 rounded-full p-6 mb-6">
            <ShoppingBag size={64} color="#1877F2" strokeWidth={1.5} />
          </View>
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Your cart is empty
          </Text>
          <Text className="text-gray-500 text-center text-base mb-8">
            Looks like you have not added anything to your cart yet
          </Text>

          <Pressable
            onPress={() => router.push("/(tabs)/home")}
            className="bg-blue-600 px-8 py-4 rounded-xl flex-row items-center active:bg-blue-700"
          >
            <Text className="text-white font-semibold text-base mr-2">
              Start Shopping
            </Text>
            <ArrowRight size={20} color="white" />
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={cart.items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          renderItem={({ item }) => {
            const isUpdating = updatingItems.has(item._id);
            const rawImg = item.productId?.images?.[0];
            const s3Base = (process.env.EXPO_PUBLIC_S3_BASE_URL || "").replace(
              /\/$/,
              "",
            );
            const imgUrl = rawImg
              ? /^https?:\/\//.test(rawImg)
                ? rawImg
                : `${s3Base}/${String(rawImg).replace(/^\/+/, "")}`
              : undefined;

            // Handle both quantity and qty fields and parse prices
            const itemQuantity = parseNumber(item.quantity ?? item.qty ?? 0);
            const itemPrice = parseNumber(
              item.productId?.price ?? item.price ?? 0,
            );
            const itemTotal = itemPrice * itemQuantity;

            return (
              <View className="bg-white rounded-2xl mb-4 shadow-sm overflow-hidden">
                <View className="flex-row p-4">
                  {/* Product Image */}
                  <View className="bg-gray-100 rounded-xl overflow-hidden">
                    <Image
                      source={{ uri: imgUrl }}
                      style={{ width: 100, height: 100 }}
                      resizeMode="cover"
                    />
                  </View>

                  {/* Product Details */}
                  <View className="flex-1 ml-4 justify-between">
                    <View>
                      <Text
                        className="font-semibold text-gray-800 text-base"
                        numberOfLines={2}
                      >
                        {item.productId?.name}
                      </Text>
                      <Text className="text-blue-600 font-bold text-lg mt-1">
                        ₹{itemPrice.toFixed(2)}
                      </Text>
                    </View>

                    {/* Quantity Controls */}
                    <View className="flex-row items-center mt-2">
                      <View className="flex-row items-center bg-gray-100 rounded-lg overflow-hidden">
                        <Pressable
                          onPress={() =>
                            handleQuantityChange(item._id, itemQuantity, -1)
                          }
                          disabled={isUpdating || itemQuantity <= 1}
                          className="p-2 active:bg-gray-200"
                        >
                          <Minus
                            size={18}
                            color={itemQuantity <= 1 ? "#9CA3AF" : "#1877F2"}
                            strokeWidth={2.5}
                          />
                        </Pressable>

                        <View className="px-4 py-2 bg-white min-w-[50px] items-center">
                          {isUpdating ? (
                            <ActivityIndicator size="small" color="#1877F2" />
                          ) : (
                            <Text className="font-semibold text-gray-800">
                              {itemQuantity}
                            </Text>
                          )}
                        </View>

                        <Pressable
                          onPress={() =>
                            handleQuantityChange(item._id, itemQuantity, 1)
                          }
                          disabled={isUpdating}
                          className="p-2 active:bg-gray-200"
                        >
                          <Plus size={18} color="#1877F2" strokeWidth={2.5} />
                        </Pressable>
                      </View>

                      {/* Remove Button */}
                      <Pressable
                        onPress={() => handleRemoveItem(item._id)}
                        disabled={isUpdating}
                        className="ml-auto p-2 bg-red-50 rounded-lg active:bg-red-100"
                      >
                        <Trash2 size={20} color="#EF4444" strokeWidth={2} />
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* Item Total */}
                <View className="bg-blue-50 px-4 py-2 flex-row justify-between items-center">
                  <Text className="text-gray-600 text-sm">Item Total</Text>
                  <Text className="font-bold text-blue-600">
                    ₹{itemTotal.toFixed(2)}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Bottom Summary Card */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl">
        <View className="px-6 py-4">
          {/* Total Amount */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">
              Total Amount
            </Text>
            <Text className="text-2xl font-bold text-blue-600">
              ₹{total.toFixed(2)}
            </Text>
          </View>

          {/* Checkout Button */}
          <Pressable
            onPress={() => setShowCheckoutModal(true)}
            className="bg-blue-600 py-4 rounded-xl flex-row items-center justify-center active:bg-blue-700"
          >
            <Text className="text-white font-bold text-lg mr-2">
              Proceed to Checkout
            </Text>
            <ArrowRight size={24} color="white" strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>

      {/* Checkout Modal */}
      <Modal
        visible={showCheckoutModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCheckoutModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[85%]">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
              <Text className="text-2xl font-bold text-gray-800">
                Delivery Details
              </Text>
              <Pressable
                onPress={() => setShowCheckoutModal(false)}
                className="p-2 bg-gray-100 rounded-full"
              >
                <X size={24} color="#374151" />
              </Pressable>
            </View>

            <ScrollView className="px-6 py-4">
              {/* Street Address */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">
                  Street Address *
                </Text>
                <TextInput
                  value={street}
                  onChangeText={setStreet}
                  placeholder="123 Main Street, Apartment 4B"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* City */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">City *</Text>
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="Mumbai"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Zip Code */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">
                  Zip Code *
                </Text>
                <TextInput
                  value={zipCode}
                  onChangeText={setZipCode}
                  placeholder="400001"
                  keyboardType="numeric"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Phone */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">
                  Phone Number *
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+919876543210"
                  keyboardType="phone-pad"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Notes */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">
                  Delivery Notes (Optional)
                </Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Deliver after 5 PM, ring bell twice"
                  multiline
                  numberOfLines={3}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                />
              </View>

              {/* Order Summary */}
              <View className="bg-blue-50 rounded-xl p-4 mb-6">
                <Text className="text-gray-700 font-semibold mb-2">
                  Order Summary
                </Text>
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-600">
                    {cart.items.length}{" "}
                    {cart.items.length === 1 ? "item" : "items"}
                  </Text>
                  <Text className="text-2xl font-bold text-blue-600">
                    ₹{total.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Place Order Button */}
              <Pressable
                onPress={handleCheckout}
                disabled={placeOrderMutation.isPending}
                className="bg-blue-600 py-4 rounded-xl flex-row items-center justify-center active:bg-blue-700 mb-6"
              >
                {placeOrderMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text className="text-white font-bold text-lg mr-2">
                      Place Order
                    </Text>
                    <ArrowRight size={24} color="white" strokeWidth={2.5} />
                  </>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        animationType="fade"
        transparent={true}
        onRequestClose={handleSuccessClose}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-3xl p-8 items-center max-w-sm w-full">
            {/* Success Icon */}
            <View className="bg-green-100 rounded-full p-4 mb-6">
              <CheckCircle size={64} color="#22C55E" strokeWidth={2} />
            </View>

            {/* Success Message */}
            <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
              Order Placed Successfully!
            </Text>
            <Text className="text-gray-600 text-center mb-8">
              Your order has been placed and will be delivered soon
            </Text>

            {/* Continue Shopping Button */}
            <Pressable
              onPress={handleSuccessClose}
              className="bg-blue-600 py-4 rounded-xl w-full items-center active:bg-blue-700"
            >
              <Text className="text-white font-bold text-lg">
                Continue Shopping
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
