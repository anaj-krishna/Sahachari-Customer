import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';

export default function Home() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-xl font-bold">Home</Text>

      <Pressable
        className="mt-4 bg-red-500 px-4 py-2 rounded"
        onPress={async () => {
          await logout();
          router.replace('/(auth)/login');
        }}
      >
        <Text className="text-white">Logout</Text>
      </Pressable>
    </View>
  );
}
