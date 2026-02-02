import { useQuery } from "@tanstack/react-query";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { getCart } from "../../services/orders.api";

export default function Cart() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });

  const cart = data;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading cart...</Text>
      </View>
    );
  }

  if (!cart || !cart.items?.length) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-lg font-semibold">Your cart is empty</Text>
        <Text className="text-gray-500 mt-2 text-center">
          Add items from home or products
        </Text>

        <Pressable
          onPress={() => refetch()}
          className="mt-6 bg-blue-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Refresh</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View className="flex-row items-center bg-white p-3 rounded-lg mb-3 shadow">
            {(() => {
              const rawImg = item.productId?.images?.[0];
              const s3Base = (
                process.env.EXPO_PUBLIC_S3_BASE_URL || ""
              ).replace(/\/$/, "");
              const imgUrl = rawImg
                ? /^https?:\/\//.test(rawImg)
                  ? rawImg
                  : `${s3Base}/${String(rawImg).replace(/^\/+/, "")}`
                : undefined;
              return (
                <Image
                  source={{ uri: imgUrl }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    marginRight: 12,
                  }}
                  resizeMode="cover"
                />
              );
            })()}
            <View style={{ flex: 1 }}>
              <Text className="font-semibold">{item.productId?.name}</Text>
              <Text className="text-gray-500">Qty: {item.quantity}</Text>
            </View>
            <View>
              <Text className="font-semibold">₹{item.productId?.price}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
