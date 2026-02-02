// This file shows one product, 
// lets user:
//        view details
//        add to cart
//        buy immediately
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    ToastAndroid,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProduct } from "../../hooks/useProducts";
import { addToCart, placeSingleOrder } from "../../services/orders.api";

export default function ProductDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: product, isLoading, error, refetch } = useProduct(id);
  const [loading, setLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    zipCode: "",
    phone: "",
    notes: "",
  });

  const insets = useSafeAreaInsets();
  const bottomPadding = (insets.bottom ?? 0) + 12;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !product) {
    const status = (error as any)?.response?.status;

    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-lg font-semibold mb-2">
          Unable to load product
        </Text>
        {status === 401 ? (
          <Text className="text-gray-500 mb-4">
            Unauthorized. Please log in again.
          </Text>
        ) : (
          <Text className="text-gray-500 mb-4">
            Something went wrong. Try again.
          </Text>
        )}

        <View className="flex-row">
          <Pressable
            onPress={() => refetch()}
            className="bg-blue-600 px-4 py-2 rounded mr-3"
          >
            <Text className="text-white">Retry</Text>
          </Pressable>
          {status === 401 && (
            <Pressable
              onPress={() => router.push("/(auth)/login")}
              className="bg-gray-600 px-4 py-2 rounded"
            >
              <Text className="text-white">Go to Login</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  const originalPrice = Number(product.price);
  const finalPrice = product.finalPrice ?? originalPrice;

  const onAddToCart = async () => {
    setLoading(true);
    try {
      await addToCart({
        productId: product.id,
        quantity: 1,
      });

      await queryClient.invalidateQueries({ queryKey: ["cart"] });

      if (Platform.OS === "android" && ToastAndroid) {
        ToastAndroid.show("Added to cart", ToastAndroid.SHORT);
      } else {
        Alert.alert("Added to cart");
      }
    } catch (err) {
      console.error("Add to cart failed", err);
      Alert.alert("Add to cart failed");
    } finally {
      setLoading(false);
    }
  };

  const onBuyNow = async () => {
  // Validate address with detailed checks
  if (!address.street || address.street.trim().length < 5) {
    Alert.alert("Invalid Address", "Street address must be at least 5 characters long");
    return;
  }
  
  if (!address.city || address.city.trim().length < 2) {
    Alert.alert("Invalid Address", "Please enter a valid city name");
    return;
  }
  
  if (!address.zipCode || address.zipCode.trim().length < 5) {
    Alert.alert("Invalid Address", "Please enter a valid ZIP code");
    return;
  }
  
  if (!address.phone || address.phone.trim().length < 10) {
    Alert.alert("Invalid Address", "Please enter a valid 10-digit phone number");
    return;
  }

  setLoading(true);
  try {
    await placeSingleOrder({
      productId: product.id,
      quantity: 1,
      deliveryAddress: {
        street: address.street.trim(),
        city: address.city.trim(),
        zipCode: address.zipCode.trim(),
        phone: address.phone.trim(),
        notes: address.notes.trim(),
      },
    });

    await queryClient.invalidateQueries({ queryKey: ["orders"] });
    await queryClient.invalidateQueries({ queryKey: ["cart"] });
    
    // ✅ Show success modal instead of immediate redirect
    setShowAddressModal(false);
    setShowSuccessModal(true);
  } catch (err: any) {
    console.error("placeSingleOrder error:", err?.response ?? err);
    
    // Better error handling
    let errorMessage = "Unable to place order";
    
    if (err?.response?.data?.message) {
      // If message is an array (validation errors), show first one
      const msg = err.response.data.message;
      errorMessage = Array.isArray(msg) ? msg[0] : msg;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    Alert.alert("Order Failed", errorMessage);
  } finally {
    setLoading(false);
  }
};
  return (
    <View className="flex-1 bg-white">
      <ScrollView>
        <Image
          source={{ uri: product.images?.[0] }}
          style={{ width: "100%", height: 280 }}
          resizeMode="cover"
        />

        <View className="p-4">
          <Text className="text-xl font-bold">{product.name}</Text>

          <View className="flex-row items-center mt-2">
            <Text className="text-xl font-bold">₹{finalPrice}</Text>
            {finalPrice < originalPrice && (
              <Text className="ml-2 text-gray-500 line-through">
                ₹{originalPrice}
              </Text>
            )}
          </View>

          {product.description && (
            <Text className="mt-4 text-gray-700">{product.description}</Text>
          )}
        </View>
      </ScrollView>

      <View
        className="flex-row p-3 border-t"
        style={{ paddingBottom: bottomPadding }}
      >
        <Pressable
          disabled={loading}
          onPress={onAddToCart}
          className="flex-1 mr-2 bg-yellow-400 rounded-lg py-3"
        >
          <Text className="text-center font-bold">Add to Cart</Text>
        </Pressable>

        <Pressable
          disabled={loading}
          onPress={() => setShowAddressModal(true)}
          className="flex-1 bg-orange-500 rounded-lg py-3"
        >
          <Text className="text-center font-bold text-white">Buy Now</Text>
        </Pressable>
      </View>

      {/* Address Modal */}
      <Modal
        visible={showAddressModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6" style={{ paddingBottom: bottomPadding }}>
            <Text className="text-xl font-bold mb-4">Delivery Address</Text>

            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-3"
              placeholder="Street Address *"
              value={address.street}
              onChangeText={(text) => setAddress({ ...address, street: text })}
            />

            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-3"
              placeholder="City *"
              value={address.city}
              onChangeText={(text) => setAddress({ ...address, city: text })}
            />

            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-3"
              placeholder="ZIP Code *"
              value={address.zipCode}
              onChangeText={(text) => setAddress({ ...address, zipCode: text })}
              keyboardType="numeric"
            />

            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-3"
              placeholder="Phone Number *"
              value={address.phone}
              onChangeText={(text) => setAddress({ ...address, phone: text })}
              keyboardType="phone-pad"
            />

            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-4"
              placeholder="Delivery Notes (Optional)"
              value={address.notes}
              onChangeText={(text) => setAddress({ ...address, notes: text })}
              multiline
            />

            <View className="flex-row">
              <Pressable
                onPress={() => setShowAddressModal(false)}
                className="flex-1 mr-2 bg-gray-200 rounded-lg py-3"
              >
                <Text className="text-center font-bold">Cancel</Text>
              </Pressable>

              <Pressable
                disabled={loading}
                onPress={onBuyNow}
                className="flex-1 bg-orange-500 rounded-lg py-3"
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-center font-bold text-white">
                    Confirm Order
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white rounded-2xl p-6 w-[85%]">
            <Text className="text-xl font-bold text-center mb-2">
              Order Placed 🎉
            </Text>

            <Text className="text-gray-600 text-center mb-6">
              Your order has been placed successfully.
            </Text>

            <Pressable
              className="bg-blue-600 rounded-lg py-3"
              onPress={() => {
                setShowSuccessModal(false);
                router.push("/orders");
              }}
            >
              <Text className="text-white text-center font-bold">
                View Orders
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}