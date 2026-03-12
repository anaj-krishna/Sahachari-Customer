import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Clock3, MapPin, Wrench } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useServices } from "../../hooks/useServices";
import { useSmartRefresh } from "../../hooks/useSmartRefresh";
import { Product } from "../../types/product";

export default function ServicesScreen() {
  const router = useRouter();
  const { products: services, isLoading, refetch, parseNumber } = useServices();
  const insets = useSafeAreaInsets();

  const { onScroll, getRefreshControlProps } = useSmartRefresh(async () => {
    await refetch();
  });

  const renderService = ({ item }: { item: Product }) => {
    const rate = parseNumber(item.finalPrice ?? item.price);
    const image = item.images?.[0];
    const serviceId = (item as any)._id?.toString?.() ?? item.id;

    return (
      <Pressable
        onPress={() => router.push(`/product/${serviceId}` as any)}
        className="mb-4 mx-4 rounded-3xl overflow-hidden bg-white active:scale-[0.98]"
        style={styles.cardShadow}
      >
        <View className="h-40 w-full relative">
          {image ? (
            <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center">
              <Wrench size={32} color="#9CA3AF" strokeWidth={1.5} />
            </View>
          )}

          <LinearGradient
            colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.45)"]}
            style={styles.imageOverlay}
          />

          <View style={styles.badgeWrapper}>
            <LinearGradient
              colors={["#3B82F6", "#1D4ED8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badge}
            >
              <Text className="text-white text-xs font-semibold">Service</Text>
            </LinearGradient>
          </View>
        </View>

        <View className="p-4 gap-3">
          <View className="gap-1">
            <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
              {item.name}
            </Text>
            <Text className="text-sm text-gray-600" numberOfLines={2}>
              {item.description || "Professional service tailored for you."}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-baseline">
              <Text className="text-2xl font-bold text-blue-600">₹{rate}</Text>
              <Text className="text-xs text-gray-500 ml-1">/hour</Text>
            </View>
            <View className="flex-row items-center gap-2 bg-blue-50 px-3 py-2 rounded-full">
              <Clock3 size={16} color="#2563EB" strokeWidth={2.4} />
              <Text className="text-xs font-semibold text-blue-700">Quick response</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <MapPin size={16} color="#6B7280" strokeWidth={2.2} />
              <Text className="text-sm text-gray-600">Local provider</Text>
            </View>
            <Text className="text-xs font-semibold text-blue-600">View details →</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <FlatList
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 12 }}
        data={services}
        keyExtractor={(item, index) => item.id?.toString?.() ?? String(index)}
        renderItem={renderService}
        refreshControl={<RefreshControl {...getRefreshControlProps()} />}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <View className="px-4 pt-4 pb-3">
            <Text className="text-3xl font-bold text-gray-800">Services</Text>
            <Text className="text-gray-500 font-medium mt-1">
              {services.length} options near you
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="py-10 items-center">
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : (
            <View className="py-10 items-center">
              <Text className="text-gray-500">No services available yet</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  badgeWrapper: {
    position: "absolute",
    top: 12,
    left: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
});
