// components/orders/OrderCard.tsx
import { Calendar, CreditCard, Package } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PLACED: 'bg-yellow-100',
    CONFIRMED: 'bg-blue-100',
    SHIPPED: 'bg-purple-100',
    DELIVERED: 'bg-green-100',
    CANCELLED: 'bg-red-100',
  };
  return colors[status] || 'bg-gray-100';
};

const getStatusTextColor = (status: string) => {
  const colors: Record<string, string> = {
    PLACED: 'text-yellow-800',
    CONFIRMED: 'text-blue-800',
    SHIPPED: 'text-purple-800',
    DELIVERED: 'text-green-800',
    CANCELLED: 'text-red-800',
  };
  return colors[status] || 'text-gray-800';
};

const getStatusEmoji = (status: string) => {
  const emojis: Record<string, string> = {
    PLACED: '📦',
    CONFIRMED: '✅',
    SHIPPED: '🚚',
    DELIVERED: '🎉',
    CANCELLED: '❌',
  };
  return emojis[status] || '📋';
};

export const OrderCard = ({ order, onPress, isCancelling }: Props) => {
  if (!order) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Pressable onPress={onPress} className="bg-white rounded-2xl mx-4 overflow-hidden shadow-sm active:opacity-90">
      {/* Header with gradient */}
      <View className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Order ID
            </Text>
            <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
              #{order.checkoutId}
            </Text>
          </View>
          <View className={`px-4 py-2 rounded-full flex-row items-center ${getStatusColor(order.status)} shadow-sm`}>
            <Text className="text-xl mr-1">{getStatusEmoji(order.status)}</Text>
            <Text className={`font-bold text-xs uppercase ${getStatusTextColor(order.status)}`}>
              {order.status}
            </Text>
          </View>
        </View>
      </View>

      <View className="p-5">
        {/* Items Preview */}
        <View className="mb-4">
          <View className="flex-row items-center mb-3">
            <View className="bg-green-100 p-2 rounded-lg mr-2">
              <Package size={16} color="#10B981" />
            </View>
            <Text className="text-base font-bold text-gray-800">
              {order.items?.length} {order.items?.length === 1 ? 'Item' : 'Items'}
            </Text>
          </View>
          
          {order.items?.slice(0, 2).map((orderItem: any, idx: number) => (
            <View key={idx} className="flex-row items-center mb-2">
              <View className="flex-1 ml-3">
                <View className="flex-row items-center">
                  <Image
                    source={{ uri: orderItem.productId?.images?.[0] }}
                    className="w-5 h-5 rounded-md bg-gray-100 mr-2"
                  />
                  <Text className="text-sm font-semibold text-gray-800 flex-1" numberOfLines={1}>
                    {orderItem.productId?.name}
                  </Text>
                </View>
                <Text className="text-xs text-gray-500">
                  Qty: {orderItem.quantity}
                </Text>
              </View>
              <Text className="text-sm font-bold text-blue-600">
                ₹{(orderItem.quantity * orderItem.price).toFixed(2)}
              </Text>
            </View>
          ))}
          
          {order.items?.length > 2 && (
            <Text className="text-xs text-blue-600 font-semibold text-center mt-1">
              +{order.items.length - 2} more items
            </Text>
          )}
        </View>

        {/* Footer Info */}
        <View className="pt-4 border-t border-gray-100 space-y-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-blue-100 p-2 rounded-lg mr-2">
                <CreditCard size={14} color="#3B82F6" />
              </View>
              <Text className="text-sm text-gray-600">Total Amount</Text>
            </View>
            <Text className="text-xl font-bold text-blue-600">
              ₹{order.totalAmount?.toFixed(2)}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-purple-100 p-2 rounded-lg mr-2">
                <Calendar size={14} color="#8B5CF6" />
              </View>
              <Text className="text-sm text-gray-600">Order Date</Text>
            </View>
            <Text className="text-sm font-semibold text-gray-700">
              {formatDate(order.createdAt)}
            </Text>
          </View>

          {/* View Details Button
          <Pressable className="bg-blue-600 py-3 rounded-xl flex-row items-center justify-center mt-2 active:bg-blue-700">
            <Text className="text-white font-bold text-sm mr-1">View Details</Text>
            <ChevronRight size={16} color="white" />
          </Pressable> */}
        </View>
      </View>
    </Pressable>
  );
};

type Props = {
  order: any;
  onPress: () => void;
  isCancelling: boolean;
};