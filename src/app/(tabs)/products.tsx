import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TextInput,
    View,
} from "react-native";
import { ProductCard } from "../../components/products/ProductCard";
import { useProducts } from "../../hooks/useProducts";
import { useAuthStore } from "../../store/auth.store";

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useProducts(
    searchQuery ? { search: searchQuery } : undefined,
  );

  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-4 pt-12 pb-4">
        <Text className="text-lg font-bold text-white mb-3">Products</Text>

        <View className="bg-white rounded-lg flex-row items-center px-4 py-3">
          <Text className="mr-2">🔍</Text>
          <TextInput
            className="flex-1"
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Product list */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 12 }}
          data={data}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={(id: string) => {
                if (!token) {
                  router.push("/(auth)/login");
                  return;
                }
                router.push(`/product/${id}`);
              }}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
