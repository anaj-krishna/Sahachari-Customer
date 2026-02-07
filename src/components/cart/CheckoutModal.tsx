import React from 'react';
import { Modal, View, Text, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { X, ArrowRight } from 'lucide-react-native';

export function CheckoutModal({ visible, onClose, address, setAddress, onConfirm, isPending, total, itemSCount }: any) {
  const updateField = (field: string, value: string) => setAddress({ ...address, [field]: value });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[85%]">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
            <Text className="text-2xl font-bold text-gray-800">Delivery Details</Text>
            <Pressable onPress={onClose} className="p-2 bg-gray-100 rounded-full"><X size={24} color="#374151" /></Pressable>
          </View>
          <ScrollView className="px-6 py-4">
            {[
              { label: "Street Address *", key: "street", placeholder: "123 Main Street" },
              { label: "City *", key: "city", placeholder: "Mumbai" },
              { label: "Zip Code *", key: "zipCode", placeholder: "400001", keyboard: "numeric" },
              { label: "Phone Number *", key: "phone", placeholder: "+919876543210", keyboard: "phone-pad" }
            ].map((f) => (
              <View key={f.key} className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">{f.label}</Text>
                <TextInput value={address[f.key]} onChangeText={(v) => updateField(f.key, v)} placeholder={f.placeholder} keyboardType={f.keyboard as any} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800" />
              </View>
            ))}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Delivery Notes (Optional)</Text>
              <TextInput value={address.notes} onChangeText={(v) => updateField('notes', v)} multiline numberOfLines={3} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800" textAlignVertical="top" />
            </View>
            <View className="bg-blue-50 rounded-xl p-4 mb-6">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">{itemSCount} {itemSCount === 1 ? "item" : "items"}</Text>
                <Text className="text-2xl font-bold text-blue-600">₹{total.toFixed(2)}</Text>
              </View>
            </View>
            <Pressable onPress={onConfirm} disabled={isPending} className="bg-blue-600 py-4 rounded-xl flex-row items-center justify-center active:bg-blue-700 mb-6">
              {isPending ? <ActivityIndicator color="white" /> : <><Text className="text-white font-bold text-lg mr-2">Place Order</Text><ArrowRight size={24} color="white" /></>}
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}