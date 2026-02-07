// components/auth/AuthError.tsx
import { Text } from "react-native";

export function AuthError({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <Text className="text-red-500 text-center mt-3">
      {message}
    </Text>
  );
}
