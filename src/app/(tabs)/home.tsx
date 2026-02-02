import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  View,
} from "react-native";
import { useState } from "react";
import { ProductCard } from "../../components/ProductCard";
import { useProducts } from "../../hooks/useProducts";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useProducts(
    searchQuery ? { search: searchQuery } : undefined
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-4 pt-12 pb-4">
        <Text className="text-lg font-bold text-white mb-3">
          Sahachari
        </Text>

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
            <ProductCard product={item} />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
