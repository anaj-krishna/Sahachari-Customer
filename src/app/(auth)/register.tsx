import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text } from "react-native";

import { useRegister } from "../../hooks/useAuth";
import { Role } from "../../types/user";

import { AuthButton } from "@/components/AuthButton";
import { AuthError } from "@/components/AuthError";
import { AuthInput } from "@/components/AuthInput";
import { AuthLayout } from "@/components/AuthLayout";
export default function Register() {
  const register = useRegister();

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    address2: "",
    mobileNumber: "",
    password: "",
    pincodesInput: "",
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const submit = () => {
    if (
      !form.name ||
      !form.email ||
      !form.address ||
      !form.password ||
      !form.pincodesInput
    ) {
      setErrorMsg("Please fill all fields");
      return;
    }

    const serviceablePincodes = form.pincodesInput
      .split(",")
      .map((p) => p.trim())
      .filter((p) => /^\d{6}$/.test(p));

    if (serviceablePincodes.length === 0) {
      setErrorMsg("Enter at least one valid 6-digit pincode (comma separated)");
      return;
    }

    register.mutate(
      {
        name: form.name,
        email: form.email,
        address: form.address,
        address2: form.address2 || undefined,
        mobileNumber: form.mobileNumber || undefined,
        serviceablePincodes,
        password: form.password,
        role: Role.USER,
      },
      {
        onSuccess: () => router.replace("/(auth)/login"),
        onError: (err: any) =>
          setErrorMsg(
            err?.response?.data?.message || "Registration failed. Try again.",
          ),
      },
    );
  };

  return (
    <AuthLayout title="SAHACHARI - Register">
      <AuthInput
        placeholder="Full Name"
        onChangeText={(v) => setForm({ ...form, name: v })}
      />

      <AuthInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={(v) => setForm({ ...form, email: v })}
      />

      <AuthInput
        placeholder="Address / Delivery Address"
        onChangeText={(v) => setForm({ ...form, address: v })}
      />

      <AuthInput
        placeholder="Address Line 2 (optional)"
        onChangeText={(v) => setForm({ ...form, address2: v })}
      />

      <AuthInput
        placeholder="Mobile Number (optional)"
        keyboardType="phone-pad"
        onChangeText={(v) => setForm({ ...form, mobileNumber: v })}
      />

      <AuthInput
        placeholder="Serviceable Pincodes (comma separated)"
        keyboardType="numeric"
        onChangeText={(v) => setForm({ ...form, pincodesInput: v })}
      />

      <AuthInput
        placeholder="Password"
        secureTextEntry
        onChangeText={(v) => setForm({ ...form, password: v })}
      />

      <AuthButton
        title="Create Account"
        loading={register.isPending}
        onPress={submit}
      />

      <AuthError message={errorMsg} />

      <Pressable className="mt-6" onPress={() => router.push("/(auth)/login")}>
        <Text className="text-blue-600 text-center">
          Already have an account? Log In
        </Text>
      </Pressable>
    </AuthLayout>
  );
}
