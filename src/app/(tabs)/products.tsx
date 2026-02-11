import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Search, ShoppingBag, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProducts } from "../../hooks/useProducts";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  finalPrice: number;
  images: string[];
  quantity: number;
  offers: any[];
}

export default function ProductsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const categoryFilter = params.category as string | undefined;

  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading } = useProducts(
    searchQuery ? { search: searchQuery } : undefined
  );

  // Filter products by category if category parameter is provided
  const filteredProducts = useMemo(() => {
    if (!data) return [];
    
    let products = data;

    // Filter by category if provided
    if (categoryFilter) {
      products = products.filter(
        (product: Product) => 
          product.category?.trim().toLowerCase() === categoryFilter.trim().toLowerCase()
      );
    }

    return products;
  }, [data, categoryFilter]);

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}` as any);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const clearCategoryFilter = () => {
    router.setParams({ category: undefined });
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const isService = item.category === "Service";
    const hasDiscount = item.offers && item.offers.length > 0;
    const discountPercent = hasDiscount
      ? Math.round(((parseFloat(item.price) - item.finalPrice) / parseFloat(item.price)) * 100)
      : 0;

    return (
      <Pressable
        onPress={() => handleProductPress(item.id)}
        className="mb-4 mx-4 rounded-3xl overflow-hidden bg-white active:scale-[0.98]"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        <View className="flex-row">
          {/* Product Image */}
          <View className="w-32 h-32 relative">
            {item.images && item.images.length > 0 ? (
              <>
                <Image
                  source={{ uri: item.images[0] }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                {/* Gradient Overlay on Image */}
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.3)"]}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 40,
                  }}
                />
                {/* Multiple Images Indicator */}
                {item.images.length > 1 && (
                  <View className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded-full">
                    <Text className="text-white text-xs font-semibold">
                      +{item.images.length - 1}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center">
                <ShoppingBag size={32} color="#D1D5DB" strokeWidth={1.5} />
              </View>
            )}
            
            {/* Service Badge */}
            {isService && (
              <View className="absolute top-2 left-2">
                <LinearGradient
                  colors={["#3B82F6", "#2563EB"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text className="text-white text-xs font-bold">
                    Service
                  </Text>
                </LinearGradient>
              </View>
            )}

            {/* Discount Badge - Only for Products */}
            {!isService && hasDiscount && discountPercent > 0 && (
              <View className="absolute top-2 left-2">
                <LinearGradient
                  colors={["#EF4444", "#DC2626"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text className="text-white text-xs font-bold">
                    -{discountPercent}%
                  </Text>
                </LinearGradient>
              </View>
            )}
          </View>

          {/* Product Details */}
          <View className="flex-1 p-4 justify-between">
            {/* Name and Description */}
            <View>
              <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
                {item.description}
              </Text>
            </View>

            {/* Price and Stock/Availability */}
            <View className="mt-3">
              <View className="flex-row items-baseline">
                <Text className="text-2xl font-bold text-blue-600">
                  ₹{item.finalPrice}
                </Text>
                {isService && (
                  <Text className="text-xs text-gray-600 ml-1">
                    /hr
                  </Text>
                )}
                {!isService && hasDiscount && (
                  <Text className="text-sm text-gray-400 line-through ml-2">
                    ₹{item.price}
                  </Text>
                )}
              </View>

              {/* Stock Status - Only for Products */}
              {!isService && (
                <View className="mt-2">
                  {item.quantity > 0 ? (
                    <View className="bg-green-50 self-start px-3 py-1 rounded-full">
                      <Text className="text-xs text-green-700 font-semibold">
                        ✓ In Stock ({item.quantity})
                      </Text>
                    </View>
                  ) : (
                    <View className="bg-red-50 self-start px-3 py-1 rounded-full">
                      <Text className="text-xs text-red-700 font-semibold">
                        ✗ Out of Stock
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Availability Badge - Only for Services */}
              {isService && (
                <View className="mt-2">
                  <View className="bg-blue-50 self-start px-3 py-1 rounded-full">
                    <Text className="text-xs text-blue-700 font-semibold">
                      ✓ Available
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Premium Header with Gradient */}
      <LinearGradient
        colors={["#2563EB", "#1D4ED8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 16, paddingBottom: 20 }}
      >
        <View className="px-6">
          <View className="flex-row items-center justify-between mb-4">
            <Pressable
              onPress={() => router.back()}
              className="bg-white/20 rounded-full p-2.5 backdrop-blur-sm"
            >
              <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-white">
                {categoryFilter || "All Products"}
              </Text>
              {filteredProducts.length > 0 && (
                <Text className="text-blue-100 text-sm mt-0.5">
                  {filteredProducts.length} items
                </Text>
              )}
            </View>
            <View className="w-12" />
          </View>

          {/* Premium Search Bar */}
          <View
            className="bg-white rounded-2xl flex-row items-center px-4 py-3.5"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Search size={20} color="#9CA3AF" strokeWidth={2} />
            <TextInput
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-gray-900 text-base"
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={clearSearch}
                className="bg-gray-100 rounded-full p-1"
              >
                <X size={16} color="#6B7280" strokeWidth={2.5} />
              </Pressable>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Active Filter Chip */}
      {categoryFilter && (
        <View className="px-4 pt-4 pb-2">
          <Pressable
            onPress={clearCategoryFilter}
            className="self-start flex-row items-center px-4 py-2.5 rounded-full"
            style={{
              backgroundColor: "#DBEAFE",
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text className="text-blue-700 font-semibold mr-2">
              {categoryFilter}
            </Text>
            <X size={16} color="#1D4ED8" strokeWidth={3} />
          </Pressable>
        </View>
      )}

      {/* Products List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-gray-500 mt-4 font-medium">Loading products...</Text>
        </View>
      ) : filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-white rounded-3xl p-8 items-center shadow-lg">
            <Text className="text-7xl mb-4">📦</Text>
            <Text className="text-xl font-bold text-gray-900 mb-2">
              No products found
            </Text>
            <Text className="text-gray-500 text-center text-base leading-6">
              {categoryFilter
                ? `No products available in "${categoryFilter}" category`
                : searchQuery
                ? "Try searching with different keywords"
                : "No products available at the moment"}
            </Text>
            {categoryFilter && (
              <Pressable
                onPress={clearCategoryFilter}
                className="mt-6 rounded-full overflow-hidden"
              >
                <LinearGradient
                  colors={["#2563EB", "#1D4ED8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ paddingHorizontal: 24, paddingVertical: 12 }}
                >
                  <Text className="text-white font-semibold text-base">
                    View All Products
                  </Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </View>
  );
}