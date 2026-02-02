import { View, Text, Pressable } from 'react-native';
import { useAuthStore } from '../../store/auth.store';

export default function Settings() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <View className="flex-1 bg-blue-50 px-4 pt-12">
      <Text className="text-xl font-bold mb-6">Settings</Text>

      <Pressable
        onPress={logout}
        className="bg-white p-4 rounded-xl shadow"
      >
        <Text className="text-red-600 font-semibold">Logout</Text>
      </Pressable>
    </View>
  );
}
