import React from "react";
import { Text, View } from "react-native";

export function AuthLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-1 bg-[#F9FAFB] justify-center px-6">
      <View className="bg-white rounded-2xl p-8 shadow-lg">
        <Text className="text-4xl font-extrabold text-indigo-600 text-center mb-2">
          {title}
        </Text>

        {children}
      </View>
    </View>
  );
}
