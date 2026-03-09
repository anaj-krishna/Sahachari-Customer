import { Redirect, Tabs } from "expo-router";
import {
  Home as HomeIcon,
  Receipt as ReceiptIcon,
  Store as StoresIcon,
  ShoppingCart as CartIcon,
  Wrench as ServicesIcon,
} from "lucide-react-native";
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../store/auth.store";
import { Role } from "../../types/user";

export default function TabsLayout() {
  const { token, user, hydrated } = useAuthStore();
  const insets = useSafeAreaInsets();

  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!token || user?.role !== Role.USER) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          headerLeft: () => null,
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 64 + Math.min(insets.bottom, 30),
            paddingBottom: Math.min(insets.bottom, 30),
            paddingTop: 6,
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
            backgroundColor: "#fff",
            elevation: 8,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ focused }) => (
              <View className="items-center justify-center w-[64px] mt-2">
                <HomeIcon
                  size={24}
                  strokeWidth={focused ? 2.6 : 2}
                  color={focused ? "#2563eb" : "#6b7280"}
                />
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className={`text-[11px] mt-1 ${
                    focused ? "text-blue-600 font-semibold" : "text-gray-500"
                  }`}
                >
                  Home
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="products"
          options={{
            tabBarIcon: ({ focused }) => (
              <View className="items-center justify-center w-[64px] mt-2">
                <StoresIcon
                  size={24}
                  strokeWidth={focused ? 2.6 : 2}
                  color={focused ? "#2563eb" : "#6b7280"}
                />
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className={`text-[11px] mt-1 ${
                    focused ? "text-blue-600 font-semibold" : "text-gray-500"
                  }`}
                >
                  Stores
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            tabBarIcon: ({ focused }) => (
              <View className="items-center justify-center w-[64px] mt-2">
                <CartIcon
                  size={24}
                  strokeWidth={focused ? 2.6 : 2}
                  color={focused ? "#2563eb" : "#6b7280"}
                />
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className={`text-[11px] mt-1 ${
                    focused ? "text-blue-600 font-semibold" : "text-gray-500"
                  }`}
                >
                  Cart
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            tabBarIcon: ({ focused }) => (
              <View className="items-center justify-center w-[64px] mt-2">
                <ReceiptIcon
                  size={24}
                  strokeWidth={focused ? 2.6 : 2}
                  color={focused ? "#2563eb" : "#6b7280"}
                />
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className={`text-[11px] mt-1 ${
                    focused ? "text-blue-600 font-semibold" : "text-gray-500"
                  }`}
                >
                  Orders
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="services"
          options={{
            tabBarIcon: ({ focused }) => (
              <View className="items-center justify-center w-[64px] mt-2">
                <ServicesIcon
                  size={24}
                  strokeWidth={focused ? 2.6 : 2}
                  color={focused ? "#2563eb" : "#6b7280"}
                />
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className={`text-[11px] mt-1 ${
                    focused ? "text-blue-600 font-semibold" : "text-gray-500"
                  }`}
                >
                  Services
                </Text>
              </View>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
