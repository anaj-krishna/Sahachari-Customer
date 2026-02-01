import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useLogin } from "../../hooks/useAuth";

// ... existing imports

export default function Login() {
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const submit = () => {
    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          setErrorMsg(null);
          router.replace("/(tabs)/products");
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message || "Invalid credentials or server error";
          setErrorMsg(msg);
        },
      }
    );
  };

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="text-3xl font-bold text-blue-600 text-center mb-8">
        SAHACHARI
      </Text>

      <TextInput
        className="border border-gray-300 rounded-md px-4 py-3 mb-3"
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={(v) => {
          setEmail(v);
          setErrorMsg(null);
        }}
      />

      <TextInput
        className="border border-gray-300 rounded-md px-4 py-3 mb-4"
        placeholder="Password"
        secureTextEntry
        onChangeText={(v) => {
          setPassword(v);
          setErrorMsg(null);
        }}
      />

      <Pressable 
        className={`bg-blue-600 py-3 rounded-md ${login.isPending ? 'opacity-50' : ''}`}
        onPress={submit}
        disabled={login.isPending}
      >
        <Text className="text-white text-center font-semibold text-lg">
          {login.isPending ? "Logging in..." : "Log In"}
        </Text>
      </Pressable>

      {errorMsg && (
        <Text className="text-red-500 text-center mt-3">
          {errorMsg}
        </Text>
      )}

      {/* Add this link to register */}
      <Pressable 
        className="mt-6"
        onPress={() => router.push("/(auth)/register")}
      >
        <Text className="text-blue-600 text-center">
          No account yet ? Create one !
        </Text>
      </Pressable>
    </View>
  );
}