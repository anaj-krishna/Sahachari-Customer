import { useState } from "react";
import { TextInput, TextInputProps, View } from "react-native";

export type AuthInputProps = TextInputProps;

export function AuthInput(props: AuthInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={{
        marginBottom: 14,
        borderRadius: 14,
        backgroundColor: "#FAFAFA",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: focused ? "#6366F1" : "#E5E7EB",
      }}
    >
      <TextInput
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor="#9CA3AF"
        style={{
          paddingVertical: 14,
          paddingHorizontal: 16,
          fontSize: 16,
          color: "#111827",
        }}
      />
    </View>
  );
}
