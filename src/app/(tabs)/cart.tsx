import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowRight, ShoppingBag } from "lucide-react-native";
import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CartItem } from "../../components/cart/CartItem";
import { CheckoutModal } from "../../components/cart/CheckoutModal";
import { useCheckoutStore } from "../../store/checkout.store";
import { useCart } from "../../hooks/useCart";
import { useSmartRefresh } from "../../hooks/useSmartRefresh";

export default function Cart() {
  const router = useRouter();
  const setCheckoutData = useCheckoutStore((s) => s.setCheckoutData);
  const { returnProductId, fromCategory, fromStoreId, returnTo, openDelivery } =
    useLocalSearchParams<{
      returnProductId?: string;
      fromCategory?: string;
      fromStoreId?: string;
      returnTo?: string;
      openDelivery?: string;
    }>();
  const {
    cart,
    isLoading,
    total,
    updatingItems,
    showCheckoutModal,
    setShowCheckoutModal,
    address,
    setAddress,
    handleQuantityChange,
    handleRemoveItem,
    handleCheckout,
    parseNumber,
    refetch,
  } = useCart();

  const { onScroll, getRefreshControlProps } = useSmartRefresh(async () => {
    await refetch();
  });

  const handleBackToSource = useCallback(() => {
    if (returnProductId) {
      router.replace({
        pathname: "/product/[id]",
        params: {
          id: returnProductId,
          fromCategory,
          fromStoreId,
          returnTo,
        },
      } as any);
      return true;
    }

    if (router.canGoBack()) {
      router.back();
      return true;
    }

    return false;
  }, [fromCategory, fromStoreId, returnProductId, returnTo, router]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => handleBackToSource(),
      );

      return () => subscription.remove();
    }, [handleBackToSource]),
  );

  useEffect(() => {
    if (openDelivery === "1") {
      setShowCheckoutModal(true);
      router.setParams({ openDelivery: undefined as any });
    }
  }, [openDelivery, router, setShowCheckoutModal]);

  if (isLoading)
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#1877F2" />
        <Text className="text-gray-600 mt-4">Loading your cart...</Text>
      </View>
    );

  const isEmpty = !cart || !cart.items?.length;

  const handleProceedToPayment = () => {
    const canProceed = handleCheckout();
    if (!canProceed) return;

    setCheckoutData({
      address,
      total,
      itemCount: cart?.items?.length || 0,
      checkoutType: "cart",
      singlePayload: null,
    });
    router.push("/payment");
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">Shopping Cart</Text>
        {!isEmpty && (
          <Text className="text-gray-500 mt-1">{cart.items.length} items</Text>
        )}
      </View>

      {isEmpty ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-blue-50 rounded-full p-6 mb-6">
            <ShoppingBag size={64} color="#1877F2" />
          </View>
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Your cart is empty
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/home")}
            className="bg-blue-600 px-8 py-4 rounded-xl flex-row items-center"
          >
            <Text className="text-white font-semibold mr-2">
              Start Shopping
            </Text>
            <ArrowRight size={20} color="white" />
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={cart.items}
            extraData={cart}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
            refreshControl={<RefreshControl {...getRefreshControlProps()} />}
            onScroll={onScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <CartItem
                item={item}
                isUpdating={updatingItems.has(item._id)}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
                parseNumber={parseNumber}
                onOpenProduct={(productId: string) =>
                  router.push({
                    pathname: "/product/[id]",
                    params: { id: productId, returnTo: "cart" },
                  } as any)
                }
              />
            )}
          />
          <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">
                Total Amount
              </Text>
              <Text className="text-2xl font-bold text-blue-600">
                ₹{total.toFixed(2)}
              </Text>
            </View>
            <Pressable
              onPress={() => setShowCheckoutModal(true)}
              className="bg-blue-600 py-4 rounded-xl flex-row items-center justify-center"
            >
              <Text className="text-white font-bold text-lg mr-2">
                Proceed to Checkout
              </Text>
              <ArrowRight size={24} color="white" />
            </Pressable>
          </View>
        </>
      )}

      <CheckoutModal
        visible={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        address={address}
        setAddress={setAddress}
        onConfirm={handleProceedToPayment}
        isPending={false}
        total={total}
        itemSCount={cart?.items?.length}
      />
    </SafeAreaView>
  );
}
