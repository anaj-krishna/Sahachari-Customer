import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/auth.store';

export default function Index() {
  const { token, hydrated } = useAuthStore();

  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (token) {
    return <Redirect href="/(tabs)/home" />;
  }
  return <Redirect href="/(auth)/login" />;
}
