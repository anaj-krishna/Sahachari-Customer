import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text } from "react-native";
import { useLogin } from "../../hooks/useAuth";

import { AuthLayout } from "@/components/AuthLayout";
import { AuthInput } from "@/components/AuthInput";
import { AuthButton } from "@/components/AuthButton";
import { AuthError } from "@/components/AuthError";

export default function Login() {
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const submit = () => {
    login.mutate(
      { email, password },
      {
        onSuccess: () => router.replace("/(tabs)/home"),
        onError: (err: any) =>
          setErrorMsg(
            err?.response?.data?.message ||
              "Invalid credentials or server error"
          ),
      }
    );
  };

  return (
    <AuthLayout title="SAHACHARI">
      <AuthInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={(v:any) => {
          setEmail(v);
          setErrorMsg(null);
        }}
      />

      <AuthInput
        placeholder="Password"
        secureTextEntry
        onChangeText={(v:any) => {
          setPassword(v);
          setErrorMsg(null);
        }}
      />

      <AuthButton
        title="Log In"
        loading={login.isPending}
        onPress={submit}
      />

      <AuthError message={errorMsg} />

      <Pressable
        onPress={() => router.push("/(auth)/register")}
        className="mt-6"
      >
        <Text className="text-blue-600 text-center">
          No account yet? Create one!
        </Text>
      </Pressable>
    </AuthLayout>
  );
}
