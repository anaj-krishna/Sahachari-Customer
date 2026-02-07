import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { CheckCircle } from 'lucide-react-native';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SuccessModal({ visible, onClose }: SuccessModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-3xl p-8 items-center max-w-sm w-full">
          {/* Success Icon */}
          <View className="bg-green-100 rounded-full p-4 mb-6">
            <CheckCircle size={64} color="#22C55E" strokeWidth={2} />
          </View>

          {/* Success Message */}
          <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Order Placed Successfully!
          </Text>
          <Text className="text-gray-600 text-center mb-8">
            Your order has been placed and will be delivered soon.
          </Text>

          {/* Continue Shopping Button */}
          <Pressable
            onPress={onClose}
            className="bg-blue-600 py-4 rounded-xl w-full items-center active:bg-blue-700"
          >
            <Text className="text-white font-bold text-lg">
              Continue Shopping
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}