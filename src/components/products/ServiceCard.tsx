import { Wrench } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

export function ServiceCard({ item, onPress, parseNumber }: any) {
  const imgUrl = item.images?.[0] || null;
  const [imgSrc, setImgSrc] = useState<any>(null);

  useEffect(() => {
    if (!imgUrl) {
      setImgSrc(null);
      return;
    }
    setImgSrc(null);
    const t = setTimeout(() => setImgSrc({ uri: imgUrl }), 30);
    return () => clearTimeout(t);
  }, [imgUrl]);

  const basePrice = parseNumber(item.price);
  const finalPrice =
    typeof item.finalPrice === "number"
      ? item.finalPrice
      : parseNumber(item.finalPrice) || basePrice;

  const hasDiscount = basePrice > 0 && finalPrice < basePrice;

  return (
    <Pressable
      onPress={() => onPress(item.id)}
      className="flex-1 bg-white rounded-2xl overflow-hidden shadow-sm active:opacity-70"
    >
      <View className="relative">
        {imgSrc ? (
          <Image
            source={imgSrc}
            style={{ width: "100%", height: 160 }}
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-40 bg-blue-50 items-center justify-center">
            <Wrench size={48} color="#1877F2" strokeWidth={1.5} />
          </View>
        )}

        {hasDiscount && (
          <View className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded-lg">
            <Text className="text-white text-xs font-bold">
              {Math.round(((basePrice - finalPrice) / basePrice) * 100)}% OFF
            </Text>
          </View>
        )}
      </View>

      <View className="p-3">
        <Text
          className="text-gray-800 font-semibold text-base"
          numberOfLines={2}
        >
          {item.name}
        </Text>

        <Text className="text-gray-500 text-xs mt-1" numberOfLines={2}>
          {item.description || "Professional Service"}
        </Text>

        <View className="mt-2">
          <Text className="text-blue-600 font-bold text-lg">
            ₹{finalPrice.toFixed(2)}
          </Text>
          {hasDiscount && (
            <Text className="text-gray-400 text-sm line-through">
              ₹{basePrice.toFixed(2)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
