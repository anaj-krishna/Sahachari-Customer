import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Briefcase,
  ChevronRight,
  Droplet,
  Leaf,
  Milk,
  Package,
  Phone,
  Sparkles,
  User,
  Wrench,
  Zap,
} from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProducts } from "../../hooks/useProducts";
import { useProfile } from "../../hooks/useProfile";

const { width } = Dimensions.get("window");
const CAROUSEL_IMAGES = [
  require("../../../assets/im4.jpg"),
  require("../../../assets/im3.jpg"),
];

// Icon mapping for different categories
const CATEGORY_ICONS: Record<string, any> = {
  "Milk": Milk,
  "Vegetable": Leaf,
  "Vegetables": Leaf,
  "Electrician": Zap,
  "Mechanic": Wrench,
  "Plumber": Droplet,
  "Plumbing": Droplet,
  "Cleaning": Sparkles,
  "Service": Briefcase,
  "default": Package,
};

// Color gradients for different categories
const CATEGORY_GRADIENTS: Record<string, { gradient: string[], iconColor: string }> = {
  "Milk": {
    gradient: ["#E0F2FE", "#DBEAFE"],
    iconColor: "#0284C7",
  },
  "Vegetable": {
    gradient: ["#DCFCE7", "#D1FAE5"],
    iconColor: "#059669",
  },
  "Vegetables": {
    gradient: ["#DCFCE7", "#D1FAE5"],
    iconColor: "#059669",
  },
  "Electrician": {
    gradient: ["#FEF3C7", "#FDE68A"],
    iconColor: "#D97706",
  },
  "Mechanic": {
    gradient: ["#E0E7FF", "#C7D2FE"],
    iconColor: "#4F46E5",
  },
  "Plumber": {
    gradient: ["#FCE7F3", "#FBCFE8"],
    iconColor: "#DB2777",
  },
  "Plumbing": {
    gradient: ["#FCE7F3", "#FBCFE8"],
    iconColor: "#DB2777",
  },
  "Cleaning": {
    gradient: ["#FEF9C3", "#FEF08A"],
    iconColor: "#CA8A04",
  },
  "Service": {
    gradient: ["#E0E7FF", "#C7D2FE"],
    iconColor: "#4F46E5",
  },
  "default": {
    gradient: ["#F3F4F6", "#E5E7EB"],
    iconColor: "#6B7280",
  },
};

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading } = useProducts(
    searchQuery ? { search: searchQuery } : undefined,
  );

  // Extract unique categories from products data
  const categories = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const uniqueCategories = new Set<string>();
    data.forEach((product: any) => {
      if (product.category) {
        // Trim whitespace from category names
        const cleanCategory = product.category.trim();
        uniqueCategories.add(cleanCategory);
      }
    });

    return Array.from(uniqueCategories).map((category, index) => {
      const colors = CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS["default"];
      const icon = CATEGORY_ICONS[category] || CATEGORY_ICONS["default"];
      
      return {
        id: `category-${index}`,
        name: category,
        icon: icon,
        gradient: colors.gradient,
        iconColor: colors.iconColor,
      };
    });
  }, [data]);

  const scaleAnims = useRef(
    Array(10).fill(0).map(() => new Animated.Value(1))
  ).current;

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const activeIndex = Math.round(offset / slideSize);
    setActiveSlide(activeIndex);
  };

  const handleCallHappy60 = () => {
    Linking.openURL("tel:9567771549");
  };

  const handleCategoryPressIn = (index: number) => {
    if (scaleAnims[index]) {
      Animated.spring(scaleAnims[index], {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleCategoryPressOut = (index: number) => {
    if (scaleAnims[index]) {
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleCategoryPress = (categoryName: string) => {
    // Navigate to products page with category filter
    router.push({
      pathname: "/products",
      params: { category: categoryName },
    });
  };
const S3_BASE_URL =
  process.env.EXPO_PUBLIC_S3_BASE_URL 
  return (
    <View className="flex-1 bg-gray-50">
      {/* Premium Header with Gradient */}
      <LinearGradient
        colors={["#2563EB", "#1D4ED8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 16, paddingBottom: 24 }}
      >
        <View className="px-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white tracking-tight">
                Sahachari
              </Text>
              <Text className="text-blue-100 text-sm mt-1.5 opacity-90">
                Your trusted local partner ✨
              </Text>
            </View>

            {/* Premium Profile Icon with Ring */}
            <Pressable
              onPress={() => router.push("/settings/settings")}
              className="relative"
            >
              <View className="bg-white/20 rounded-full p-1 backdrop-blur-sm">
                {profile?.image ? (
                  <Image
                     source={{ uri: `${S3_BASE_URL}/${profile.image}` }}
                    className="w-12 h-12 rounded-full border-2 border-white"
                  />
                ) : (
                  <View className="w-12 h-12 rounded-full bg-white items-center justify-center shadow-lg">
                    <User size={24} color="#2563EB" strokeWidth={2} />
                  </View>
                )}
              </View>
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Premium Carousel with Shadow */}
        <View className="mt-6">
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {CAROUSEL_IMAGES.map((image, index) => (
              <View
                key={index}
                style={{ width }}
                className="items-center px-4"
              >
                <View className="rounded-3xl overflow-hidden shadow-2xl bg-white">
                  <Image
                    source={image}
                    style={{ width: width - 32, height: 200 }}
                    resizeMode="cover"
                  />
                  {/* Gradient Overlay */}
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.1)"]}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: 60,
                    }}
                  />
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Modern Pagination Dots */}
          <View className="flex-row justify-center items-center mt-4">
            {CAROUSEL_IMAGES.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full mx-1 transition-all ${
                  activeSlide === index
                    ? "bg-blue-600 w-8 shadow-sm"
                    : "bg-gray-300 w-2"
                }`}
              />
            ))}
          </View>
        </View>

        {/* Premium Happy 60 Banner */}
        <Pressable
          onPress={handleCallHappy60}
          className="mx-4 mt-8 rounded-3xl overflow-hidden shadow-lg active:scale-[0.98]"
        >
          <LinearGradient
            colors={["#FFFBEB", "#FEF3C7", "#FDE68A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 20 }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-white rounded-2xl p-3 mr-4 shadow-sm">
                  <Text className="text-3xl">😊</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-orange-900">
                    Happy 60
                  </Text>
                  <Text className="text-orange-700 text-sm mt-1">
                    Special offers for senior citizens
                  </Text>
                </View>
              </View>
              <View className="bg-orange-600 rounded-full p-3 shadow-md">
                <Phone size={20} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </View>
          </LinearGradient>
        </Pressable>

        {/* Categories Section with Premium Header */}
        <View className="mt-8 px-4">
          <View className="flex-row items-center justify-between mb-5">
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                Categories
              </Text>
              <Text className="text-gray-500 text-sm mt-1">
                Explore our services
              </Text>
            </View>
            <ChevronRight size={24} color="#9CA3AF" strokeWidth={2} />
          </View>

          {/* Loading State */}
          {isLoading && (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color="#2563EB" />
              <Text className="text-gray-500 mt-4">Loading categories...</Text>
            </View>
          )}

          {/* Premium Categories Grid */}
          {!isLoading && categories.length > 0 && (
            <View className="flex-row flex-wrap justify-between">
              {categories.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <Animated.View
                    key={category.id}
                    style={{
                      transform: [{ scale: scaleAnims[index] || 1 }],
                      width: "48%",
                      marginBottom: 16,
                    }}
                  >
                    <Pressable
                      onPress={() => handleCategoryPress(category.name)}
                      onPressIn={() => handleCategoryPressIn(index)}
                      onPressOut={() => handleCategoryPressOut(index)}
                    >
                      <View className="rounded-3xl overflow-hidden shadow-lg bg-white">
                        <LinearGradient
                          colors={category.gradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{ padding: 24 }}
                        >
                          <View className="items-center">
                            <View className="bg-white rounded-2xl p-3 shadow-sm mb-3">
                              <IconComponent
                                size={32}
                                color={category.iconColor}
                                strokeWidth={2}
                              />
                            </View>
                            <Text
                              className="text-gray-800 font-bold text-base text-center"
                              numberOfLines={1}
                            >
                              {category.name}
                            </Text>
                          </View>
                        </LinearGradient>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          )}

          {/* Empty State */}
          {!isLoading && categories.length === 0 && (
            <View className="py-12 items-center">
              <Package size={48} color="#9CA3AF" strokeWidth={1.5} />
              <Text className="text-gray-500 mt-4 text-center">
                No categories available yet
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View className="h-12" />
      </ScrollView>
    </View>
  );
}