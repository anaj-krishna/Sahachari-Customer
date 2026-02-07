// components/AuthLayout.tsx
import { View, Text } from "react-native";

export function AuthLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="text-3xl font-bold text-blue-600 text-center mb-8">
        {title}
      </Text>
      {children}
    </View>
  );
}
