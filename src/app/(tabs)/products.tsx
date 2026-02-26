import { useAuthStore } from "@/store/auth.store";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ShoppingBag, Store as StoreIcon } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { useCategoryStores } from "../../hooks/Usecategorystores";
import { useProducts } from "../../hooks/useProducts";
import { useStoreProducts } from "../../hooks/useStoreProducts";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSmartRefresh } from "../../hooks/useSmartRefresh";

interface Store {
  _id: string;
  name: string;
  email: string;
  address: string;
  status: string;
  isVerified: boolean;
  image: string;
}

interface Product {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  category: string;
  price: string;
  finalPrice?: number;
  images: string[];
  quantity: number;
  offers: any[];
  storeId?: string;
}

export default function ProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoryFilter =
    typeof params.category === "string" ? params.category : undefined;
  const storeId =
    typeof params.storeId === "string" ? params.storeId : undefined;

  const searchQuery = "";
  const { token } = useAuthStore();
  const AUTH_TOKEN = token ?? undefined;
  const S3_BASE_URL = process.env.EXPO_PUBLIC_S3_BASE_URL;
  // Fetch category stores when category is provided but no storeId
  const {
    data: stores = [],
    isLoading: isLoadingStores,
    refetch: refetchStores,
  } = useCategoryStores(
    !storeId ? categoryFilter ?? undefined : undefined,
    AUTH_TOKEN,
  );

  // Fetch products by storeId if provided, otherwise fetch all products
  const {
    data: allProducts,
    isLoading: isLoadingAllProducts,
    refetch: refetchAllProducts,
  } = useProducts(
    searchQuery ? { search: searchQuery } : undefined,
  );

  const {
    data: storeProducts,
    isLoading: isLoadingStoreProducts,
    refetch: refetchStoreProducts,
  } = useStoreProducts(storeId);

  // Determine which products to show
  const displayProducts = storeId ? storeProducts : allProducts;
  const isLoadingProducts = storeId
    ? isLoadingStoreProducts
    : isLoadingAllProducts;
  const products = Array.isArray(displayProducts) ? displayProducts : [];

  // Determine what to show based on params
  const showingStores = Boolean(categoryFilter && !storeId);

  const listData = showingStores ? stores : products;

  const listKeyExtractor = (item: any, index: number) => {
    if (showingStores) {
      return item?._id?.toString?.() ?? String(index);
    }
    return item?._id?.toString?.() ?? item?.id?.toString?.() ?? String(index);
  };

  const renderListItem = ({ item }: { item: any }) => {
    return showingStores ? renderStore({ item }) : renderProduct({ item });
  };

  const handleStorePress = (selectedStoreId: string) => {
    router.push({
      pathname: "/products",
      params: {
        category: categoryFilter,
        storeId: selectedStoreId,
      },
    } as any);
  };

  const handleProductPress = (product: any) => {
    // Use _id if available, fallback to id
    const productId = product._id || product.id;
    router.push(`/product/${productId}` as any);
  };

  const renderStore = ({ item }: { item: Store }) => {
    return (
      <Pressable
        onPress={() => handleStorePress(item._id)}
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
          {/* Store Image */}
          <View className="w-32 h-32 relative">
            {item.image ? (
              <>
                <Image
                  source={{ uri: `${S3_BASE_URL}/${item.image}` }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
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
              </>
            ) : (
              <View className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center">
                <StoreIcon size={32} color="#D1D5DB" strokeWidth={1.5} />
              </View>
            )}

            {/* Verified Badge */}
            {item.isVerified && (
              <View className="absolute top-2 left-2">
                <LinearGradient
                  colors={["#10B981", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text className="text-white text-xs font-bold">
                    ✓ Verified
                  </Text>
                </LinearGradient>
              </View>
            )}

            {/* Status Badge */}
            <View className="absolute bottom-2 right-2">
              <View
                className={`px-2 py-1 rounded-full ${
                  item.status === "ACTIVE" ? "bg-green-500" : "bg-gray-500"
                }`}
              >
                <Text className="text-white text-xs font-semibold">
                  {item.status}
                </Text>
              </View>
            </View>
          </View>

          {/* Store Details */}
          <View className="flex-1 p-4 justify-between">
            {/* Name and Address */}
            <View>
              <Text
                className="text-lg font-bold text-gray-900"
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
                📍 {item.address}
              </Text>
              <Text className="text-sm text-gray-400 mt-1" numberOfLines={1}>
                ✉️ {item.email}
              </Text>
            </View>

            {/* View Products Button */}
            <View className="mt-3">
              <View className="bg-blue-50 self-start px-4 py-2 rounded-full">
                <Text className="text-xs text-blue-700 font-semibold">
                  View Products →
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const isService = item.category === "Service";
    const hasDiscount = item.offers && item.offers.length > 0;

    // Calculate final price - use finalPrice if it exists, otherwise use price
    const displayPrice = item.finalPrice || parseFloat(item.price);
    const originalPrice = parseFloat(item.price);

    const discountPercent =
      hasDiscount && item.finalPrice
        ? Math.round(((originalPrice - item.finalPrice) / originalPrice) * 100)
        : 0;

    return (
      <Pressable
        onPress={() => handleProductPress(item)}
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
                  <Text className="text-white text-xs font-bold">Service</Text>
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
              <Text
                className="text-lg font-bold text-gray-900"
                numberOfLines={1}
              >
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
                  ₹{displayPrice}
                </Text>
                {isService && (
                  <Text className="text-xs text-gray-600 ml-1">/hr</Text>
                )}
                {!isService && hasDiscount && item.finalPrice && (
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

  const { onScroll, getRefreshControlProps } = useSmartRefresh(async () => {
    if (showingStores) {
      await refetchStores();
      return;
    }
    if (storeId) {
      await refetchStoreProducts();
      return;
    }
    await refetchAllProducts();
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        style={styles.container}
        data={listData}
        renderItem={renderListItem}
        keyExtractor={listKeyExtractor}
        refreshControl={<RefreshControl {...getRefreshControlProps()} />}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text className="text-3xl font-bold text-gray-800 mb-1">
              {showingStores ? "Stores" : "All Products"}
            </Text>
            <Text className="text-gray-500 font-medium">
              {listData.length} {showingStores ? "stores" : "items"}
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoadingStores || isLoadingProducts ? (
            <View className="py-10 items-center">
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : (
            <View className="py-10 items-center">
              <Text className="text-gray-500">No items found</Text>
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16 },
});
