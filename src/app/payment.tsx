import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  CreditCard,
  IndianRupee,
  Package,
  Smartphone,
  Wallet,
} from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SuccessModal } from "../components/cart/SuccessModal";
import { placeOrder, placeSingleOrder } from "../services/orders.api";
import { useCheckoutStore } from "../store/checkout.store";

type PaymentMethod = "COD" | "ONLINE";

export default function PaymentScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    address,
    total,
    itemCount,
    checkoutType,
    singlePayload,
    clearCheckoutData,
  } = useCheckoutStore();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderResponse, setOrderResponse] = useState<any>(null);

  const handleBackFromPayment = useCallback(() => {
    if (showSuccessModal) {
      return true;
    }

    if (checkoutType === "single" && singlePayload?.productId) {
      const targetReturnTo =
        singlePayload.returnTo === "services" ? "services" : "products";

      router.replace({
        pathname: "/product/[id]",
        params: {
          id: singlePayload.productId,
          openDelivery: "1",
          returnTo: targetReturnTo,
          fromCategory:
            targetReturnTo === "products"
              ? singlePayload.fromCategory
              : undefined,
        },
      } as any);
      return true;
    }

    router.replace({
      pathname: "/(tabs)/cart",
      params: { openDelivery: "1" },
    } as any);
    return true;
  }, [
    checkoutType,
    router,
    showSuccessModal,
    singlePayload?.fromCategory,
    singlePayload?.productId,
    singlePayload?.returnTo,
  ]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackFromPayment,
      );

      return () => subscription.remove();
    }, [handleBackFromPayment]),
  );

  const formattedAddress = useMemo(() => {
    if (!address) return "";
    return [address.street, address.city, address.zipCode]
      .filter(Boolean)
      .join(", ");
  }, [address]);

  const handlePlaceOrder = async () => {
    if (!address) {
      Alert.alert("Missing checkout details", "Please start checkout again.");
      router.replace("/(tabs)/cart");
      return;
    }

    if (selectedMethod === "ONLINE") {
      Alert.alert(
        "Online payment coming soon",
        "Please choose Cash on Delivery for now.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const response =
        checkoutType === "single" && singlePayload
          ? await placeSingleOrder({
              productId: singlePayload.productId,
              quantity: singlePayload.quantity,
              deliveryAddress: {
                street: address.street,
                city: address.city,
                zipCode: address.zipCode,
                phone: address.phone,
                notes: address.notes || "",
              },
            })
          : await placeOrder({
              street: address.street,
              city: address.city,
              zipCode: address.zipCode,
              phone: address.phone,
              notes: address.notes || "",
            });

      setOrderResponse(response);
      if (checkoutType === "cart") {
        await queryClient.invalidateQueries({ queryKey: ["cart"] });
      }
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      setShowSuccessModal(true);
    } catch (error: any) {
      const message = error?.response?.data?.message;
      Alert.alert(
        "Order failed",
        Array.isArray(message) ? message[0] : message || "Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!address) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={styles.headerWrapSingle}>
          <View className="px-6 py-4">
            <Pressable
              onPress={handleBackFromPayment}
              style={styles.backButton}
            >
              <ArrowLeft size={20} color="#123C7A" />
            </Pressable>
          </View>
        </View>

        <View className="flex-1 items-center justify-center px-8">
            <View className="bg-amber-100 rounded-full p-4 mb-4">
              <CircleAlert size={34} color="#B45309" />
            </View>
            <Text className="text-xl font-bold text-[#123C7A] text-center mb-2">
              No checkout data found
            </Text>
            <Text className="text-[#5F7EA8] text-center mb-6">
              Start from cart checkout to continue with payment.
            </Text>
            <Pressable
              className="bg-blue-600 px-6 py-3 rounded-xl"
              onPress={() => router.replace("/(tabs)/cart")}
            >
              <Text className="text-white font-semibold">Go to Cart</Text>
            </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.headerWrap}>
        <View className="px-6 py-4 flex-row items-center justify-between">
          <Pressable
            onPress={handleBackFromPayment}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color="#123C7A" />
          </Pressable>
          <View className="items-center">
            <Text style={styles.headerCaption}>Secure Checkout</Text>
            <Text style={styles.headerTitle}>Payment</Text>
          </View>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 36 }}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Summary</Text>
            <View className="flex-row items-center justify-between mb-2">
              <Text style={styles.cardLabel}>Items</Text>
              <Text style={styles.cardValue}>{itemCount}</Text>
            </View>
            <View className="flex-row items-center justify-between mb-2">
              <Text style={styles.cardLabel}>Subtotal</Text>
              <Text style={styles.cardValue}>₹{total.toFixed(2)}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text style={styles.cardLabel}>Delivery charge</Text>
              <Text className="text-amber-700 font-semibold">Calculated by store</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Address</Text>
            <Text style={styles.cardBody}>{formattedAddress}</Text>
            <Text style={styles.cardBodyMuted}>Phone: {address.phone}</Text>
            {address.notes ? (
              <Text style={styles.cardBodyMuted}>Note: {address.notes}</Text>
            ) : null}
          </View>

          <View style={[styles.card, { marginBottom: 24 }]}>
            <Text style={styles.cardTitle}>Select Payment Method</Text>

            <Pressable
              className={`rounded-2xl border p-4 mb-3 flex-row items-center justify-between ${
                selectedMethod === "COD"
                  ? "border-blue-400 bg-blue-50"
                  : "border-blue-100 bg-white"
              }`}
              onPress={() => setSelectedMethod("COD")}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-lg bg-emerald-100 items-center justify-center mr-3">
                  <Wallet size={20} color="#047857" />
                </View>
                <View>
                  <Text className="text-[#123C7A] font-semibold">Cash on Delivery</Text>
                  <Text className="text-[#5F7EA8] text-xs">Pay when order arrives</Text>
                </View>
              </View>
              {selectedMethod === "COD" ? (
                <CircleCheck size={20} color="#2563EB" />
              ) : (
                <View className="w-5 h-5 rounded-full border border-blue-200" />
              )}
            </Pressable>

            <Pressable
              className="rounded-2xl border border-dashed border-blue-200 p-4 flex-row items-center justify-between bg-[#F8FBFF]"
              onPress={() => setSelectedMethod("ONLINE")}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-lg bg-blue-100 items-center justify-center mr-3">
                  <CreditCard size={20} color="#1D4ED8" />
                </View>
                <View>
                  <Text className="text-[#123C7A] font-semibold">Online Payment</Text>
                  <Text className="text-[#5F7EA8] text-xs">UPI / Card / Netbanking</Text>
                </View>
              </View>
              <Text className="text-xs font-semibold text-amber-800 bg-amber-200 px-2 py-1 rounded-full">
                Soon
              </Text>
            </Pressable>
          </View>

          <LinearGradient
            colors={isSubmitting ? ["#60A5FA", "#3B82F6"] : ["#22D3EE", "#2563EB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 18 }}
          >
            <Pressable
              disabled={isSubmitting}
              onPress={handlePlaceOrder}
              className="rounded-2xl px-4 py-4 flex-row items-center justify-center"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Package size={20} color="#FFFFFF" />
                  <Text className="text-white font-bold text-base ml-2">
                    {checkoutType === "single"
                      ? "Confirm Booking (COD)"
                      : "Place Order (COD)"}
                  </Text>
                </>
              )}
            </Pressable>
          </LinearGradient>

          <View className="mt-4 items-center">
            <View className="flex-row items-center bg-[#EAF2FF] px-3 py-2 rounded-full border border-[#D6E4FF]">
              <Smartphone size={14} color="#4D74A9" />
              <IndianRupee size={14} color="#4D74A9" />
              <Text className="text-[#5F7EA8] text-xs ml-1">
                Secure payment gateway integration can be enabled next.
              </Text>
            </View>
          </View>
      </ScrollView>

      <SuccessModal
        visible={showSuccessModal}
        orderResponse={orderResponse}
        onClose={() => {
          setShowSuccessModal(false);
          setOrderResponse(null);
          clearCheckoutData();
          router.replace("/(tabs)/orders");
        }}
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
  },
  headerWrapSingle: {
    backgroundColor: "#F5F8FF",
    borderBottomWidth: 1,
    borderBottomColor: "#D6E4FF",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D6E4FF",
  },
  headerCaption: {
    textAlign: "center",
    color: "#5F7EA8",
    fontSize: 12,
    fontWeight: "600",
  },
  headerTitle: {
    textAlign: "center",
    color: "#123C7A",
    fontSize: 30,
    fontWeight: "800",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#D6E4FF",
    padding: 18,
    marginBottom: 14,
    shadowColor: "#123C7A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    color: "#123C7A",
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 10,
  },
  cardLabel: {
    color: "#5F7EA8",
    fontSize: 14,
    fontWeight: "600",
  },
  cardValue: {
    color: "#123C7A",
    fontSize: 15,
    fontWeight: "700",
  },
  cardBody: {
    color: "#2A4D84",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  cardBodyMuted: {
    color: "#5F7EA8",
    fontSize: 14,
    marginTop: 4,
  },
});
