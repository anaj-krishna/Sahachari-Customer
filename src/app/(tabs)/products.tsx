import React from 'react';
import { View, Text, FlatList, Image, Pressable, ActivityIndicator } from 'react-native';
import { useProducts } from '../../hooks/useProducts';
import { Product } from '../../types/product';
import { useAuthStore } from '../../store/auth.store';

function ProductCard({ product }: { product: Product }) {
  const originalPrice = Number(String(product.price).replace(/[^0-9.]/g, '')) || 0;
  const finalPrice = product.finalPrice ?? originalPrice;
  const hasDiscount = finalPrice < originalPrice;
  const offer = product.offers?.[0];

  return (
    <Pressable className="w-1/2 p-2">
      <View className="bg-white rounded-lg shadow p-3">
        {product.images?.[0] ? (
          <Image source={{ uri: product.images[0] }} className="h-32 rounded mb-2" />
        ) : (
          <View className="h-32 bg-gray-100 rounded mb-2" />
        )}

        <Text className="font-semibold text-lg">{product.name}</Text>

        <View className="flex-row items-center">
          <Text className="font-semibold">₹{finalPrice.toFixed(2)}</Text>
          {hasDiscount && (
            <Text className="ml-2 text-gray-500 line-through">
              ₹{originalPrice.toFixed(2)}
            </Text>
          )}
        </View>
        {offer && (
          <View className="mt-2 bg-blue-100 px-2 py-1 rounded self-start">
            <Text className="text-blue-700 text-sm">
              {offer.type === 'PERCENTAGE'
                ? `${offer.value}% off`
                : `₹${offer.value} off`}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function Products() {
  const { token } = useAuthStore();
  const { data, isLoading, isError, error, refetch } = useProducts();

  if (!token || isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-blue-50">
        <ActivityIndicator />
      </View>
    );
  }
  if (isError) {
    return (
      <View className="flex-1 justify-center items-center bg-blue-50 p-4">
        <Text className="text-red-500 text-center">
          {(error as any)?.message || 'Failed to load products'}
        </Text>
        <Pressable onPress={() => refetch()} className="mt-4">
          <Text className="text-blue-600">Retry</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View className="flex-1 bg-blue-50 px-4 pt-4">
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        numColumns={2}
        renderItem={({ item }) => <ProductCard product={item} />}
      />
    </View>
  );
}
