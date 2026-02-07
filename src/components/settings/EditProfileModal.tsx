import React from 'react';
import { Modal, View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { X, Save } from 'lucide-react-native';

const labels: Record<string, string> = {
  name: "Name",
  email: "Email",
  mobileNumber: "Mobile Number",
  address: "Address",
  address2: "Address Line 2",
};

export function EditProfileModal({ visible, field, value, onChange, onClose, onSave, isPending }: any) {
  const label = labels[field] || field;
  const isAddress = field.includes("address");

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-gray-800">Edit {label}</Text>
            <Pressable onPress={onClose} className="p-2 bg-gray-100 rounded-full"><X size={20} color="#374151" /></Pressable>
          </View>

          <Text className="text-gray-700 font-semibold mb-2">{label}</Text>
          <TextInput
            value={value}
            onChangeText={onChange}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 mb-6"
            multiline={isAddress}
            numberOfLines={isAddress ? 3 : 1}
            textAlignVertical={isAddress ? "top" : "center"}
            autoFocus
          />

          <Pressable onPress={onSave} disabled={isPending} className="bg-blue-600 py-4 rounded-xl flex-row items-center justify-center">
            {isPending ? <ActivityIndicator color="white" /> : (
              <><Save size={20} color="white" /><Text className="text-white font-bold ml-2">Save Changes</Text></>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}