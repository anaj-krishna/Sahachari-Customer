import { Redirect, Slot } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';
import { Role } from '../../types/user';
import { View, ActivityIndicator } from 'react-native';

export default function TabsLayout() {
  const { token, user, hydrated } = useAuthStore();

  // Wait for hydration to complete before making redirect decisions
  if (!hydrated) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (!token) return <Redirect href="/(auth)/login" />;
  if (user?.role !== Role.USER) return <Redirect href="/(auth)/login" />;
  return <Slot />;
}
