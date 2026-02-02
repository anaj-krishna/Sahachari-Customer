import { View, Text, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SERVICES = [
  { id: '1', name: 'Electrician', icon: 'flash' },
  { id: '2', name: 'Plumber', icon: 'water' },
  { id: '3', name: 'Carpenter', icon: 'hammer' },
  { id: '4', name: 'AC Repair', icon: 'snow' },
  { id: '5', name: 'Painter', icon: 'color-palette' },
  { id: '6', name: 'Cleaning', icon: 'broom' },
];

export default function Services() {
  return (
    <View className="flex-1 bg-blue-50">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 shadow">
        <Text className="text-xl font-bold">Services</Text>
        <Text className="text-sm text-gray-500">
          Trusted professionals near you
        </Text>
      </View>

      {/* Grid */}
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={SERVICES}
        keyExtractor={(i) => i.id}
        numColumns={2}
        renderItem={({ item }) => (
          <Pressable className="w-1/2 p-2">
            <View className="bg-white rounded-xl p-4 shadow items-center">
              <Ionicons name={item.icon as any} size={32} color="#2563eb" />
              <Text className="mt-2 font-semibold">{item.name}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
