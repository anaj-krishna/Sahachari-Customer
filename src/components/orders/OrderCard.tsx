import {
  CheckCircle2,
  ChevronRight,
  CircleX,
  Package,
} from "lucide-react-native";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const S3_BASE = (process.env.EXPO_PUBLIC_S3_BASE_URL || "").replace(/\/$/, "");
const API_BASE = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");

const resolveImageUri = (image: any): string | undefined => {
  const base = S3_BASE || API_BASE;

  const toAbsolute = (value: any): string | undefined => {
    if (typeof value !== "string" || !value.trim()) return undefined;
    if (/^https?:\/\//i.test(value)) return value;
    if (!base) return undefined;
    return `${base}/${value.replace(/^\/+/, "")}`;
  };

  if (!image) return undefined;
  if (typeof image === "string") return toAbsolute(image);
  return toAbsolute(image.url || image.key || image.path);
};

const formatStatus = (status: string) => {
  const map: Record<string, string> = {
    PLACED: "Order placed",
    READY: "Order ready",
    CONFIRMED: "Order confirmed",
    SHIPPED: "Order shipped",
    DELIVERED: "Order delivered",
    FAILED: "Order failed",
    CANCELLED: "Order cancelled",
  };
  return map[status] || "Order updated";
};

const formatPlacedAt = (dateString?: string) => {
  if (!dateString) return "Placed recently";
  const date = new Date(dateString);

  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  const month = date.toLocaleString("en-IN", { month: "short" });
  const year = date.getFullYear();
  const time = date
    .toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();

  return `Placed at ${day}${suffix} ${month} ${year}, ${time}`;
};

const formatAmount = (value: any) => {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return "0";
  return amount.toFixed(0);
};

const getStatusTheme = (status: string) => {
  const theme: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    PLACED: { bg: "#EEF4FF", border: "#C9DBFF", text: "#245AAE", dot: "#2F7FF7" },
    READY: { bg: "#EAF2FF", border: "#BCD6FF", text: "#1F5AB1", dot: "#2A6FE8" },
    CONFIRMED: { bg: "#EDF3FF", border: "#C6D8FF", text: "#285FAF", dot: "#3B7BF0" },
    SHIPPED: { bg: "#EEF2FF", border: "#CBD5F5", text: "#3F5DB2", dot: "#5573D9" },
    DELIVERED: { bg: "#E9F8EF", border: "#BEE7CD", text: "#1E7A44", dot: "#16A34A" },
    FAILED: { bg: "#FFECEF", border: "#F4C5CC", text: "#C24153", dot: "#DC2626" },
    CANCELLED: { bg: "#FFECEF", border: "#F4C5CC", text: "#C24153", dot: "#DC2626" },
  };

  return theme[status] || theme.PLACED;
};

const getStatusTitleColor = (status: string) => {
  if (status === "DELIVERED") return "#1E7A44";
  if (status === "FAILED" || status === "CANCELLED") return "#B42338";
  return "#1D4E94";
};

export const OrderCard = ({
  order,
  onPress,
  isCancelling,
  onRateOrder,
  onOrderAgain,
  onProductPress,
}: Props) => {
  if (!order) return null;

  const status = String(order.status || "").toUpperCase();
  const isPlaced = status === "PLACED";
  const isDelivered = status === "DELIVERED";
  const isFailed = status === "FAILED";
  const isCancelled = status === "CANCELLED";
  const isAcceptedOrUpdated = ["READY", "CONFIRMED", "SHIPPED", "DELIVERED"].includes(status);
  const previewItems = order.items?.slice(0, 5) || [];
  const statusTheme = getStatusTheme(status);

  return (
    <Pressable
      onPress={onPress}
      disabled={isCancelling}
      style={styles.card}
      android_ripple={{ color: "#EAF2EC" }}
    >
      <View style={styles.contentWrap}>
        <View style={styles.thumbRow}>
          {previewItems.map((item: any, idx: number) => {
            const imageUri =
              resolveImageUri(item?.productId?.images?.[0]) ||
              resolveImageUri(item?.productId?.image) ||
              resolveImageUri(item?.image);

            return (
              <Pressable
                key={idx}
                style={styles.thumbBox}
                onPress={() => {
                  const productId =
                    item?.productId?._id ||
                    item?.productId?.id ||
                    (typeof item?.productId === "string" ? item.productId : undefined);

                  if (productId) {
                    onProductPress(productId);
                  }
                }}
              >
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.thumbImg} />
                ) : (
                  <View style={styles.thumbFallback}>
                    <Package size={18} color="#7C8E84" strokeWidth={2.3} />
                  </View>
                )}
              </Pressable>
            );
          })}

          {order.items?.length > 5 && (
            <View style={styles.extraThumb}>
              <Text style={styles.extraThumbText}>+{order.items.length - 5}</Text>
            </View>
          )}

          <View
            style={[
              styles.statusChip,
              {
                backgroundColor: statusTheme.bg,
                borderColor: statusTheme.border,
              },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: statusTheme.dot }]} />
            <Text style={[styles.statusChipText, { color: statusTheme.text }]}>
              {status}
            </Text>
          </View>
        </View>

        <View style={styles.mainRow}>
          <View style={styles.leftCol}>
            <View style={styles.statusRow}>
              <Text style={[styles.statusText, { color: getStatusTitleColor(status) }]} numberOfLines={1}>
                {formatStatus(status)}
              </Text>
              {isFailed || isCancelled ? (
                <CircleX size={21} color="#DC2626" strokeWidth={2.8} />
              ) : isAcceptedOrUpdated ? (
                <CheckCircle2 size={21} color="#16A34A" strokeWidth={2.8} />
              ) : (
                !isPlaced && <CheckCircle2 size={21} color="#3B82F6" strokeWidth={2.8} />
              )}
            </View>
            <Text style={styles.timeText} numberOfLines={1}>
              {formatPlacedAt(order.createdAt)}
            </Text>
            <Text style={styles.metaText} numberOfLines={1}>
              Repeat-ready basket • {order.items?.length || 0} items
            </Text>
          </View>

          <View style={styles.amountWrap}>
            <Text style={styles.amountText}>₹{formatAmount(order.totalAmount)}</Text>
            <ChevronRight size={22} color="#1D2A24" strokeWidth={2.8} />
          </View>
        </View>
      </View>

      <View style={styles.footerRow}>
        {isDelivered && (
          <Pressable
            style={[styles.footerBtn, styles.footerDivider]}
            onPress={onRateOrder}
          >
            <Text style={styles.rateText}>Rate Order</Text>
          </Pressable>
        )}

        <Pressable
          style={[styles.footerBtn, !isDelivered && styles.footerBtnFull]}
          onPress={onOrderAgain}
        >
          <Text style={styles.againText}>Order Again</Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

type Props = {
  order: any;
  onPress: () => void;
  isCancelling: boolean;
  onRateOrder: () => void;
  onOrderAgain: () => void;
  onProductPress: (productId: string) => void;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 30,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#DCE3D8",
    overflow: "hidden",
    shadowColor: "#0F1B16",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  contentWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
  },
  thumbRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  thumbBox: {
    width: 62,
    height: 62,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#E8EEE6",
    marginRight: 8,
  },
  thumbImg: {
    width: "100%",
    height: "100%",
  },
  thumbFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  extraThumb: {
    width: 62,
    height: 62,
    borderRadius: 14,
    backgroundColor: "#DCE6D9",
    alignItems: "center",
    justifyContent: "center",
  },
  extraThumbText: {
    color: "#2E4438",
    fontSize: 13,
    fontWeight: "700",
  },
  statusChip: {
    marginLeft: "auto",
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 7,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  mainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftCol: {
    flex: 1,
    paddingRight: 10,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  statusText: {
    color: "#1D4E94",
    fontSize: 20,
    fontWeight: "800",
    marginRight: 8,
  },
  timeText: {
    color: "#607FA8",
    fontSize: 14,
    fontWeight: "500",
  },
  metaText: {
    color: "#8EA7CC",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "600",
  },
  amountWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  amountText: {
    color: "#123C7A",
    fontSize: 43,
    fontWeight: "800",
    marginRight: 2,
    letterSpacing: -0.6,
  },
  footerRow: {
    borderTopWidth: 1,
    borderTopColor: "#DCE3D8",
    flexDirection: "row",
    height: 68,
  },
  footerBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footerDivider: {
    borderRightWidth: 1,
    borderRightColor: "#DCE3D8",
  },
  footerBtnFull: {
    flex: 1,
  },
  rateText: {
    color: "#2563EB",
    fontSize: 18,
    fontWeight: "700",
  },
  againText: {
    color: "#2563EB",
    fontSize: 18,
    fontWeight: "800",
  },
});
