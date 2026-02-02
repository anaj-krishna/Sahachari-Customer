import { View, Text } from 'react-native';

export default function Orders() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-lg font-semibold">No orders yet</Text>
      <Text className="text-gray-500 mt-2">
        Your past orders will appear here
      </Text>
    </View>
  );
}
