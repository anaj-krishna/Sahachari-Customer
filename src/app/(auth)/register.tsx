import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Role } from "../../types/user";
import { useRegister } from "../../hooks/useAuth";

export default function Register() {
  const register = useRegister();
  const [form, setForm] = useState({
    name: "",
    email: "",
    shopAddress: "",
    password: "",
    pincodesInput: "", // temporary string input
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const submit = () => {
    // Basic validation
    if (!form.name || !form.email || !form.shopAddress || !form.password || !form.pincodesInput) {
      setErrorMsg("Please fill all fields");
      return;
    }

    const serviceablePincodes = form.pincodesInput
      .split(",")
      .map(p => p.trim())
      .filter(p => p.length === 6 && /^\d{6}$/.test(p)); // simple 6-digit pincode validation

    if (serviceablePincodes.length === 0) {
      setErrorMsg("Enter at least one valid 6-digit pincode (comma separated)");
      return;
    }

    register.mutate(
      {
        ...form,
        serviceablePincodes,
        role: Role.USER,
      },
      {
        onSuccess: () => router.replace("/(tabs)/home"),
        onError: (err) => {
          setErrorMsg(err?.response?.data?.message || "Registration failed. Try again.");
        },
      }
    );
  };

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="text-3xl font-bold text-blue-600 text-center mb-8">
        SAHACHARI - Register
      </Text>

      <TextInput
        className="border border-gray-300 rounded-md px-4 py-3 mb-3"
        placeholder="Full Name"
        onChangeText={(v) => setForm({ ...form, name: v })}
      />
      <TextInput
        className="border border-gray-300 rounded-md px-4 py-3 mb-3"
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={(v) => setForm({ ...form, email: v })}
      />
      <TextInput
        className="border border-gray-300 rounded-md px-4 py-3 mb-3"
        placeholder="Shop Address / Delivery Address"
        onChangeText={(v) => setForm({ ...form, shopAddress: v })}
      />
      <TextInput
        className="border border-gray-300 rounded-md px-4 py-3 mb-3"
        placeholder="Serviceable Pincodes (comma separated, e.g. 560001,560002)"
        keyboardType="numeric"
        onChangeText={(v) => setForm({ ...form, pincodesInput: v })}
      />
      <TextInput
        className="border border-gray-300 rounded-md px-4 py-3 mb-4"
        placeholder="Password"
        secureTextEntry
        onChangeText={(v) => setForm({ ...form, password: v })}
      />

      <Pressable 
        className={`bg-blue-600 py-3 rounded-md ${register.isPending ? 'opacity-50' : ''}`}
        onPress={submit}
        disabled={register.isPending}
      >
        <Text className="text-white text-center font-semibold text-lg">
          {register.isPending ? "Creating..." : "Create Account"}
        </Text>
      </Pressable>

      { (errorMsg || register.isError) && (
        <Text className="text-red-500 text-center mt-3">
          {errorMsg || register.error?.response?.data?.message || "Something went wrong"}
        </Text>
      )}

      {/* Optional: link back to login */}
      <Pressable 
        className="mt-6"
        onPress={() => router.push("/(auth)/login")}
      >
        <Text className="text-blue-600 text-center">
          Already have an account? Log In
        </Text>
      </Pressable>
    </View>
  );
}