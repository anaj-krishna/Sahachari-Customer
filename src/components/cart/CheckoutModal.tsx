import { useAuthStore } from "@/store/auth.store";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, X } from "lucide-react-native";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export function CheckoutModal({
  visible,
  onClose,
  address,
  setAddress,
  onConfirm,
  isPending,
  total,
  itemSCount,
}: any) {
  interface UserProfile {
    _id: string;
    name: string;
    email: string;
    role?: string;
    address?: string;
    address2?: string;
    mobileNumber?: string;
    serviceablePincodes?: string[];
    image?: string;
  }

  const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_URL || "http://192.168.2.66:3000";
  const updateField = (field: string, value: string) =>
    setAddress({ ...address, [field]: value });

  const { data: profile, isLoading } = useQuery<UserProfile, Error>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const authToken = await useAuthStore.getState().token;
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch user data");
      return response.json();
    },
  });

  // Pre-fill form fields when profile data is loaded
  useEffect(() => {
    if (profile && visible) {
      setAddress((prev: any) => ({
        ...prev,
        street: prev.street || profile.address || "",
        phone: prev.phone || profile.mobileNumber || "",
        // Add any other mappings from your user profile to address fields
      }));
    }
  }, [profile, setAddress, visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="flex-1 bg-white rounded-t-3xl max-h-[90%]">
          <View className="items-center py-3 bg-white">
            <View className="w-12 h-1.5 rounded-full bg-gray-200" />
          </View>
          <View className="bg-blue-600 px-6 py-5">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-white">
                  Delivery Details
                </Text>
                <Text className="text-blue-100 mt-1">
                  Confirm your address to place the order
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                className="p-2 bg-white/20 rounded-full"
              >
                <X size={22} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          {isLoading ? (
            <View className="flex-1 py-8 items-center justify-center">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="text-gray-500 mt-2">
                Loading your details...
              </Text>
            </View>
          ) : (
            <ScrollView
              className="flex-1 px-6 py-5"
              showsVerticalScrollIndicator={true}
            >
              <View className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-blue-800 font-semibold">
                    Items Subtotal
                  </Text>
                  <Text className="text-blue-900 text-xl font-bold">
                    ₹{total.toFixed(2)}
                  </Text>
                </View>
                <Text className="text-blue-700 mt-1">
                  {itemSCount} {itemSCount === 1 ? "item" : "items"}
                </Text>

                <View className="mt-3 pt-3 border-t border-blue-200">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-blue-700 font-medium text-sm">
                      Delivery Charge
                    </Text>
                    <Text className="text-orange-600 font-semibold text-sm">
                      Will be calculated
                    </Text>
                  </View>
                  <Text className="text-blue-600 text-xs mt-1">
                    Based on your delivery location
                  </Text>
                </View>
              </View>

              <View className="bg-white border border-gray-200 rounded-2xl p-4 mb-5">
                <Text className="text-gray-800 font-bold mb-3">
                  Shipping Address
                </Text>
                {[
                  {
                    label: "Street Address *",
                    key: "street",
                    placeholder: "123 Main Street",
                  },
                  { label: "City *", key: "city", placeholder: "Mumbai" },
                  {
                    label: "Zip Code *",
                    key: "zipCode",
                    placeholder: "400001",
                    keyboard: "numeric",
                  },
                  {
                    label: "Phone Number *",
                    key: "phone",
                    placeholder: "+919876543210",
                    keyboard: "phone-pad",
                  },
                ].map((f) => (
                  <View key={f.key} className="mb-4">
                    <Text className="text-gray-600 font-semibold mb-2">
                      {f.label}
                    </Text>
                    <TextInput
                      value={address[f.key]}
                      onChangeText={(v) => updateField(f.key, v)}
                      placeholder={f.placeholder}
                      keyboardType={f.keyboard as any}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                ))}
              </View>

              <View className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
                <Text className="text-gray-800 font-bold mb-3">
                  Delivery Notes (Optional)
                </Text>
                <TextInput
                  value={address.notes}
                  onChangeText={(v) => updateField("notes", v)}
                  multiline
                  numberOfLines={3}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  textAlignVertical="top"
                  placeholder="Leave instructions for the delivery partner"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <Pressable
                onPress={onConfirm}
                disabled={isPending}
                className="bg-blue-600 py-4 rounded-2xl flex-row items-center justify-center active:bg-blue-700 mb-6"
              >
                {isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text className="text-white font-bold text-lg mr-2">
                      Continue to Payment
                    </Text>
                    <ArrowRight size={24} color="white" />
                  </>
                )}
              </Pressable>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
