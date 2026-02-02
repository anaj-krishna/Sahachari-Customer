import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../store/auth.store";
import { Role } from "../../types/user";

export default function TabsLayout() {
  const { token, user, hydrated } = useAuthStore();
  const insets = useSafeAreaInsets();
  const bottomPadding = (insets.bottom ?? 0) + 8;
  const tabBarHeight = 64 + (insets.bottom ?? 0);

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
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: tabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          backgroundColor: "#ffffff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 10,
        },
      }}
    >
      {TAB_CONFIG.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            tabBarIcon: ({ focused }) => (
              <View className="items-center justify-center">
                <Ionicons
                  name={focused ? t.activeIcon : t.icon}
                  size={22}
                  color={focused ? "#2563eb" : "#6b7280"}
                />
                <View className="mt-1">
                  <Text
                    className={`text-xs ${
                      focused ? "text-blue-600 font-semibold" : "text-gray-500"
                    }`}
                  >
                    {t.label}
                  </Text>
                </View>
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
const TAB_CONFIG = [
  { name: "home", label: "Home", icon: "home-outline", activeIcon: "home" },
  { name: "cart", label: "Cart", icon: "cart-outline", activeIcon: "cart" },
  {
    name: "orders",
    label: "Orders",
    icon: "receipt-outline",
    activeIcon: "receipt",
  },
  {
    name: "services",
    label: "Services",
    icon: "construct-outline",
    activeIcon: "construct",
  },
  {
    name: "settings",
    label: "Settings",
    icon: "settings-outline",
    activeIcon: "settings",
  },
] as const;
