import React from "react";
import { FlatList, ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Wrench } from "lucide-react-native";
import { useServices } from "../../hooks/useServices";
import { ServiceCard } from "../../components/products/ServiceCard";

export default function Services() {
  const router = useRouter();
  const { products, isLoading, parseNumber } = useServices();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#1877F2" />
        <Text className="text-gray-600 mt-4">Loading services...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-6 border-b border-gray-200">
        <Text className="text-3xl font-bold text-gray-800">Services</Text>
        <Text className="text-gray-500 mt-1">Professional services near you</Text>
      </View>

      {products.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-blue-50 rounded-full p-6 mb-6">
            <Wrench size={64} color="#1877F2" strokeWidth={1.5} />
          </View>
          <Text className="text-2xl font-bold text-gray-800 mb-2">No Services Available</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <ServiceCard 
              item={item} 
              onPress={(id: string) => router.push(`/product/${id}`)} 
              parseNumber={parseNumber} 
            />
          )}
          ItemSeparatorComponent={() => <View className="h-3" />}
        />
      )}
    </SafeAreaView>
  );
}