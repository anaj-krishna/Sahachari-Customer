import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/ProductCard';

export default function Home() {
  const { data, isLoading } = useProducts();

  return (
    <View className="flex-1 bg-blue-50">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 shadow">
        <Text className="text-xl font-bold">Sahachari</Text>
        <Text className="text-sm text-gray-500">
          Fresh items delivered fast
        </Text>
      </View>

      {/* Product list */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 12 }}
          data={data?.slice(0, 6)} // show few on home
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => <ProductCard product={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
