import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProduct } from "../../hooks/useProducts";
import { useProductActions } from "../../hooks/useProductActions";
import { CheckoutModal } from "../../components/cart/CheckoutModal";
import { SuccessModal } from "../../components/cart/SuccessModal";

export default function ProductDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { data: product, isLoading, error, refetch } = useProduct(id);
  const {
    loading, address, setAddress, showAddressModal, setShowAddressModal,
    showSuccessModal, setShowSuccessModal, handleAddToCart, handleBuyNow
  } = useProductActions(product);

  if (isLoading) return <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" /></View>;

  if (error || !product) return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="text-lg font-semibold mb-4 text-center">Unable to load product</Text>
      <Pressable onPress={() => refetch()} className="bg-blue-600 px-6 py-2 rounded-lg">
        <Text className="text-white font-bold">Retry</Text>
      </Pressable>
    </View>
  );

  const originalPrice = Number(product.price);
  const finalPrice = product.finalPrice ?? originalPrice;

  return (
    <View className="flex-1 bg-white">
      <ScrollView>
        <Image source={{ uri: product.images?.[0] }} className="w-full h-80 bg-gray-100" resizeMode="cover" />
        <View className="p-5">
          <Text className="text-2xl font-bold text-gray-800">{product.name}</Text>
          <View className="flex-row items-center mt-2">
            <Text className="text-2xl font-bold text-blue-600">₹{finalPrice}</Text>
            {finalPrice < originalPrice && (
              <Text className="ml-3 text-gray-400 line-through text-lg">₹{originalPrice}</Text>
            )}
          </View>
          <Text className="mt-6 text-gray-600 leading-6 text-base">{product.description}</Text>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View className="flex-row p-4 border-t border-gray-100" style={{ paddingBottom: insets.bottom + 12 }}>
        <Pressable 
          disabled={loading} 
          onPress={handleAddToCart}
          className="flex-1 mr-2 bg-gray-100 py-4 rounded-xl active:bg-gray-200"
        >
          <Text className="text-center font-bold text-gray-800">Add to Cart</Text>
        </Pressable>
        <Pressable 
          disabled={loading} 
          onPress={() => setShowAddressModal(true)}
          className="flex-1 ml-2 bg-orange-500 py-4 rounded-xl active:bg-orange-600"
        >
          <Text className="text-center font-bold text-white">Buy Now</Text>
        </Pressable>
      </View>

      {/* Reusable Modals */}
      <CheckoutModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        address={address}
        setAddress={setAddress}
        onConfirm={handleBuyNow}
        isPending={loading}
        total={finalPrice}
        itemSCount={1}
      />

      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/orders");
        }}
      />
    </View>
  );
}