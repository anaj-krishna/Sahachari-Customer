import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  ShoppingBag,
  Store as StoreIcon,
} from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { useProducts, useStores } from "../../hooks/useProducts";
import { useStoreProducts } from "../../hooks/useStoreProducts";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSmartRefresh } from "../../hooks/useSmartRefresh";
import { Store } from "../../types/product";

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
  storeName?: string;
}

export default function ProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const storeId =
    typeof params.storeId === "string" ? params.storeId : undefined;

  const {
    data: stores = [],
    isLoading: isLoadingStores,
    refetch: refetchStores,
  } = useStores();

  const duplicateStoreNames = useMemo(() => {
    const counts = new Map<string, number>();

    stores.forEach((store) => {
      const key = (store.name || "").trim().toLowerCase();
      if (!key) return;
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    return counts;
  }, [stores]);

  const {
    data: allProducts = [],
    refetch: refetchAllProducts,
  } = useProducts();

  const {
    data: storeProducts = [],
    isLoading: isLoadingStoreProducts,
    refetch: refetchStoreProducts,
  } = useStoreProducts(storeId);

  const listData = storeId ? storeProducts : stores;
  const isLoadingList = storeId ? isLoadingStoreProducts : isLoadingStores;
  const screenTitle = storeId ? "Store Items" : "Stores";

  const listKeyExtractor = (item: any, index: number) => {
    if (storeId) {
      return item?._id?.toString?.() ?? item?.id?.toString?.() ?? String(index);
    }
    return item?.id?.toString?.() ?? String(index);
  };

  const renderListItem = ({ item }: { item: any }) => {
    return storeId ? renderProduct({ item }) : renderStore({ item });
  };

  const handleStoreItemsBack = useCallback(() => {
    router.replace("/products");
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      if (!storeId) return;

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          handleStoreItemsBack();
          return true;
        },
      );

      return () => subscription.remove();
    }, [storeId, handleStoreItemsBack]),
  );

  const handleStorePress = (selectedStoreId: string) => {
    router.push({
      pathname: "/products",
      params: {
        storeId: selectedStoreId,
      },
    } as any);
  };

  const handleProductPress = (product: any) => {
    // Use _id if available, fallback to id
    const productId = product._id || product.id;
    router.push({
      pathname: `/product/${productId}`,
      params: storeId
        ? {
            from: "store-items",
            storeId,
          }
        : undefined,
    } as any);
  };

  const renderStore = ({ item }: { item: Store }) => {
    const resolvedStoreId = item.id;
    const resolvedStoreName =
      item.name ||
      allProducts.find(
        (product) =>
          product.storeId === resolvedStoreId &&
          typeof product.storeName === "string" &&
          product.storeName.trim().length > 0,
      )?.storeName;
    const normalizedName = (resolvedStoreName || "").trim();
    const isNameDuplicate =
      !!normalizedName &&
      (duplicateStoreNames.get(normalizedName.toLowerCase()) || 0) > 1;
    const displayStoreTitle =
      normalizedName && !isNameDuplicate
        ? normalizedName
        : resolvedStoreId
        ? `Store ${resolvedStoreId.slice(-6).toUpperCase()}`
        : "Store";

    const storeProductsCount = allProducts.filter(
      (product) => product.storeId === resolvedStoreId,
    ).length;
    const productFallbackImage = allProducts.find(
      (product) => product.storeId === resolvedStoreId,
    )?.images?.[0];
    const storeImage = item.image || productFallbackImage;

    return (
      <Pressable
        onPress={() => handleStorePress(resolvedStoreId)}
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
            {storeImage ? (
              <>
                <Image
                  source={{ uri: storeImage }}
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
              <View className="w-full h-full bg-gray-100 items-center justify-center">
                <StoreIcon size={32} color="#D1D5DB" strokeWidth={1.5} />
              </View>
            )}

            <View className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded-full">
              <Text className="text-white text-xs font-semibold">
                {storeProductsCount} items
              </Text>
            </View>
          </View>

          {/* Store Details */}
          <View className="flex-1 p-4 justify-between">
            <View>
              <Text
                className="text-lg font-bold text-gray-900"
                numberOfLines={1}
              >
                {displayStoreTitle}
              </Text>
              <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
                Store ID: {resolvedStoreId || "N/A"}
              </Text>
            </View>

            <View className="mt-3">
              <View className="bg-blue-50 self-start px-4 py-2 rounded-full">
                <Text className="text-xs text-blue-700 font-semibold">
                  View Items →
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
              <View className="w-full h-full bg-gray-100 items-center justify-center">
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
    if (storeId) {
      await refetchStoreProducts();
      return;
    }
    await Promise.all([refetchStores(), refetchAllProducts()]);
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
          <View>
            <View style={styles.header}>
              {storeId && (
                <Pressable
                  onPress={handleStoreItemsBack}
                  className="bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg mb-3 self-start"
                >
                  <ArrowLeft size={24} color="#1F2937" strokeWidth={2.5} />
                </Pressable>
              )}
              <Text className="text-3xl font-bold text-gray-800 mb-1">
                {screenTitle}
              </Text>
              <Text className="text-gray-500 font-medium">
                {listData.length} {storeId ? "items" : "stores"}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoadingList ? (
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
