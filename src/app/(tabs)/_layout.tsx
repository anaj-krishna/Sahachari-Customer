import { Redirect, Slot } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';
import { Role } from '../../types/user';

export default function TabsLayout() {
  const { token, user } = useAuthStore();

  if (!token) return <Redirect href="/(auth)/login" />;
  if (user?.role !== Role.USER) return <Redirect href="/(auth)/login" />;
  return <Slot />;
}
