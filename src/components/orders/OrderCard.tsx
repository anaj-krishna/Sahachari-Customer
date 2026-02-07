import { View, Text, Pressable } from "react-native";

export const getStatusColor = (status: string) => {
  switch (status) {
    case "PLACED": return "bg-blue-100 text-blue-700";
    case "CONFIRMED": return "bg-green-100 text-green-700";
    case "DELIVERED": return "bg-green-500 text-white";
    case "CANCELLED": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

export function OrderCard({ item, onPress }: { item: any; onPress: (id: string) => void }) {
  return (
    <Pressable onPress={() => onPress(item._id)} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-xs text-gray-500 mb-1">Order ID</Text>
          <Text className="font-bold text-gray-800">{item.checkoutId}</Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
          <Text className="text-xs font-semibold">{item.status}</Text>
        </View>
      </View>
      <View className="flex-row items-center mb-3 pb-3 border-b border-gray-100">
        <Text className="text-gray-600">🏪 {item.storeId?.name || "Store"}</Text>
      </View>
      <View className="mb-3">
        <Text className="text-gray-500 text-xs mb-2">{item.items?.length} item(s)</Text>
        {item.items?.slice(0, 2).map((oi: any, i: number) => (
          <Text key={i} className="text-gray-700 text-sm">• {oi.productId?.name} × {oi.quantity}</Text>
        ))}
      </View>
      <View className="flex-row justify-between items-center">
        <Text className="text-gray-500">Total Amount</Text>
        <Text className="text-xl font-bold text-blue-600">₹{item.totalAmount}</Text>
      </View>
    </Pressable>
  );
}