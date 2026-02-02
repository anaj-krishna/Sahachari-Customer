import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useProduct } from "../../hooks/useProducts";
import { addToCart, placeSingleOrder } from "../../services/orders.api";
import { useState } from "react";

export default function ProductDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: product, isLoading } = useProduct(id);
  const [loading, setLoading] = useState(false);

  if (isLoading || !product) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
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
      router.push("/cart");
    } finally {
      setLoading(false);
    }
  };

  const onBuyNow = async () => {
    setLoading(true);
    try {
      await placeSingleOrder({
        productId: product.id,
        quantity: 1,
        deliveryAddress: {}, // you can pass address later
      });
      router.push("/orders");
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
            <Text className="mt-4 text-gray-700">
              {product.description}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom actions */}
      <View className="flex-row p-3 border-t">
        <Pressable
          disabled={loading}
          onPress={onAddToCart}
          className="flex-1 mr-2 bg-yellow-400 rounded-lg py-3"
        >
          <Text className="text-center font-bold">Add to Cart</Text>
        </Pressable>

        <Pressable
          disabled={loading}
          onPress={onBuyNow}
          className="flex-1 bg-orange-500 rounded-lg py-3"
        >
          <Text className="text-center font-bold text-white">
            Buy Now
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
