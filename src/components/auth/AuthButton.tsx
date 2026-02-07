// components/AuthButton.tsx
import { Pressable, Text } from "react-native";

export function AuthButton({
  title,
  loading,
  onPress,
}: {
  title: string;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      className={`bg-blue-600 py-3 rounded-md ${
        loading ? "opacity-50" : ""
      }`}
      onPress={onPress}
      disabled={loading}
    >
      <Text className="text-white text-center font-semibold text-lg">
        {loading ? "Please wait..." : title}
      </Text>
    </Pressable>
  );
}
