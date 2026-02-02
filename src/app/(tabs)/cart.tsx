import { View, Text, Pressable } from 'react-native';

export default function Cart() {
  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <Text className="text-lg font-semibold">Your cart is empty</Text>
      <Text className="text-gray-500 mt-2 text-center">
        Add items from home or products
      </Text>

      <Pressable className="mt-6 bg-blue-600 px-6 py-3 rounded-xl">
        <Text className="text-white font-semibold">Browse Products</Text>
      </Pressable>
    </View>
  );
}
