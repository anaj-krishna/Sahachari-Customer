import { useRouter } from "expo-router";
import {
  Droplet,
  Leaf,
  Milk,
  Phone,
  Sparkles,
  User,
  Wrench,
  Zap,
} from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProfile } from "../../hooks/useProfile";

const { width } = Dimensions.get("window");
const CAROUSEL_IMAGES = [
  require("../../../assets/logo.jpeg"),
  require("../../../assets/im4.jpg"),
  require("../../../assets/im3.jpg"),
];

const CATEGORIES = [
  {
    id: "1",
    name: "Milk",
    icon: Milk,
    color: "#DBEAFE",
    iconColor: "#1877F2",
    route: "/products",
  },
  {
    id: "2",
    name: "Vegetables",
    icon: Leaf,
    color: "#DCFCE7",
    iconColor: "#16A34A",
    route: "/products",
  },
  {
    id: "3",
    name: "Electrician",
    icon: Zap,
    color: "#FEF3C7",
    iconColor: "#F59E0B",
    route: "/(tabs)/services",
  },
  {
    id: "4",
    name: "Mechanic",
    icon: Wrench,
    color: "#E0E7FF",
    iconColor: "#6366F1",
    route: "/(tabs)/services",
  },
  {
    id: "5",
    name: "Plumber",
    icon: Droplet,
    color: "#FCE7F3",
    iconColor: "#EC4899",
    route: "/(tabs)/services",
  },
  {
    id: "6",
    name: "Cleaning",
    icon: Sparkles,
    color: "#FEF9C3",
    iconColor: "#EAB308",
    route: "/(tabs)/services",
  },
];

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const activeIndex = Math.round(offset / slideSize);
    setActiveSlide(activeIndex);
  };

  const handleCallHappy60 = () => {
    Linking.openURL("tel:9567771549");
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className="bg-blue-600 px-6"
        style={{ paddingTop: insets.top + 12, paddingBottom: 16 }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-white">Sahachari</Text>
            <Text className="text-blue-100 text-sm mt-1">
              Your trusted local partner for every need
            </Text>
          </View>

          {/* Profile Icon */}
          <Pressable
            onPress={() => router.push("/settings/settings")}
            className="bg-white rounded-full p-1.5"
          >
            {profile?.image ? (
              <Image
                source={{ uri: profile.image }}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                <User size={24} color="#1877F2" strokeWidth={2} />
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Carousel */}
        <View className="mt-4">
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingHorizontal: 1 }}
          >
            {CAROUSEL_IMAGES.map((image, index) => (
              <View key={index} style={{ width }} className="items-center">
                <Image
                  source={image}
                  style={{ width: width - 2, height: 192, borderRadius: 16 }}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View className="flex-row justify-center items-center mt-3">
            {CAROUSEL_IMAGES.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full mx-1 ${
                  activeSlide === index ? "bg-blue-600 w-8" : "bg-gray-300 w-2"
                }`}
              />
            ))}
          </View>
        </View>

        {/* Happy 60 Banner */}
        <Pressable
          onPress={handleCallHappy60}
          className="mx-4 mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 flex-row items-center justify-between shadow-sm border border-yellow-200 active:opacity-80"
        >
          <View className="flex-row items-center flex-1">
            <View className="bg-yellow-100 rounded-full p-3 mr-3">
              <Text className="text-3xl">😊</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-orange-900">
                Happy 60
              </Text>
              <Text className="text-orange-700 text-sm mt-0.5">
                Special offers for senior citizens
              </Text>
            </View>
          </View>
          <View className="bg-white rounded-full p-2">
            <Phone size={20} color="#EA580C" strokeWidth={2.5} />
          </View>
        </Pressable>

        {/* Categories Section */}
        <View className="mt-6 px-4">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Categories in Village
          </Text>

          {/* Categories Grid */}
          <View className="flex-row flex-wrap justify-between">
            {CATEGORIES.map((category) => {
              const IconComponent = category.icon;
              return (
                <Pressable
                  key={category.id}
                  onPress={() => router.push(category.route as any)}
                  className="w-[48%] mb-3 active:opacity-70"
                >
                  <View
                    className="rounded-2xl p-6 items-center shadow-sm"
                    style={{ backgroundColor: category.color }}
                  >
                    <IconComponent
                      size={40}
                      color={category.iconColor}
                      strokeWidth={1.5}
                    />
                    <Text
                      className="text-gray-800 font-semibold mt-3 text-center"
                      numberOfLines={1}
                    >
                      {category.name}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
