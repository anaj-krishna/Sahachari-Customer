import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, X } from 'lucide-react-native';
import { useEffect } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export function CheckoutModal({ visible, onClose, address, setAddress, onConfirm, isPending, total, itemSCount }: any) {
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
  
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  const updateField = (field: string, value: string) => setAddress({ ...address, [field]: value });
  
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
        street: prev.street || profile.address || '',
        phone: prev.phone || profile.mobileNumber || '',
        // Add any other mappings from your user profile to address fields
      }));
    }
  }, [profile, visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[85%]">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
            <Text className="text-2xl font-bold text-gray-800">Delivery Details</Text>
            <Pressable onPress={onClose} className="p-2 bg-gray-100 rounded-full">
              <X size={24} color="#374151" />
            </Pressable>
          </View>
          
          {isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="text-gray-500 mt-2">Loading your details...</Text>
            </View>
          ) : (
            <ScrollView className="px-6 py-4">
              {[
                { label: "Street Address *", key: "street", placeholder: "123 Main Street" },
                { label: "City *", key: "city", placeholder: "Mumbai" },
                { label: "Zip Code *", key: "zipCode", placeholder: "400001", keyboard: "numeric" },
                { label: "Phone Number *", key: "phone", placeholder: "+919876543210", keyboard: "phone-pad" }
              ].map((f) => (
                <View key={f.key} className="mb-4">
                  <Text className="text-gray-700 font-semibold mb-2">{f.label}</Text>
                  <TextInput 
                    value={address[f.key]} 
                    onChangeText={(v) => updateField(f.key, v)} 
                    placeholder={f.placeholder} 
                    keyboardType={f.keyboard as any} 
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800" 
                  />
                </View>
              ))}
              
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Delivery Notes (Optional)</Text>
                <TextInput 
                  value={address.notes} 
                  onChangeText={(v) => updateField('notes', v)} 
                  multiline 
                  numberOfLines={3} 
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800" 
                  textAlignVertical="top" 
                />
              </View>
              
              <View className="bg-blue-50 rounded-xl p-4 mb-6">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-600">{itemSCount} {itemSCount === 1 ? "item" : "items"}</Text>
                  <Text className="text-2xl font-bold text-blue-600">₹{total.toFixed(2)}</Text>
                </View>
              </View>
              
              <Pressable 
                onPress={onConfirm} 
                disabled={isPending} 
                className="bg-blue-600 py-4 rounded-xl flex-row items-center justify-center active:bg-blue-700 mb-6"
              >
                {isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text className="text-white font-bold text-lg mr-2">Place Order</Text>
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