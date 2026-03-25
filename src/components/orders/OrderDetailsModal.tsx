import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Check,
  ChevronLeft,
  CircleHelp,
  CircleX,
  Copy,
  Package,
  X,
} from "lucide-react-native";
import { useAuthStore } from "@/store/auth.store";

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

const money = (value: any) => {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
};

const formatDateTime = (dateString?: string) => {
  if (!dateString) return "--";
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const ORDER_TIMELINE = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

const getTimelineIndex = (status?: string) => {
  if (!status) return 0;
  if (status === "CANCELLED") return 1;
  if (status === "FAILED") return 1;
  const idx = ORDER_TIMELINE.indexOf(status);
  return idx === -1 ? 0 : idx;
};

const formatStep = (step: string) => {
  if (step === "PLACED") return "Placed";
  if (step === "CONFIRMED") return "Confirmed";
  if (step === "SHIPPED") return "In Transit";
  if (step === "DELIVERED") return "Delivered";
  return step;
};

export function OrderDetailsModal({
  visible,
  order,
  isLoading,
  onClose,
  onCancel,
  isCancelling,
  isOrderingAgain,
  onOrderAgain,
  onOpenProduct,
}: any) {
  const currentUserName = useAuthStore((s) => s.user?.name);
  const items = order?.items || [];
  const status = String(order?.status || "").toUpperCase();
  const canCancel = status === "PLACED";
  const isPlaced = status === "PLACED";
  const isDelivered = status === "DELIVERED";
  const isFailed = status === "FAILED";
  const isCancelled = status === "CANCELLED";
  const isAcceptedOrUpdated = ["READY", "CONFIRMED", "SHIPPED", "DELIVERED"].includes(status);
  const timelineIndex = getTimelineIndex(status);

  const receiverName =
    order?.deliveryAddress?.name ||
    order?.userId?.name ||
    order?.user?.name ||
    currentUserName ||
    "Customer";

  const receiverPhone = order?.deliveryAddress?.phone || "--";

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        {!order || isLoading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loaderText}>Loading details...</Text>
          </View>
        ) : (
          <>
            <View style={styles.topHeader}>
              <Pressable style={styles.iconBtn} onPress={onClose}>
                <ChevronLeft size={22} color="#1D2A24" strokeWidth={2.5} />
              </Pressable>

              <View style={styles.headerTextWrap}>
                <Text style={styles.orderIdText} numberOfLines={1}>
                  Order #{order.checkoutId || "--"}
                </Text>
                <Text style={styles.itemCountText}>
                  {items.length} {items.length === 1 ? "item" : "items"}
                </Text>
              </View>

              <Pressable
                style={styles.helpBtn}
                onPress={() => Alert.alert("Help", "Support flow coming soon")}
              >
                <CircleHelp size={16} color="#2563EB" strokeWidth={2.2} />
                <Text style={styles.helpBtnText}>Get Help</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.sectionCard}>
                <View style={styles.statusRow}>
                  {!isPlaced && (
                    <View
                      style={[
                        styles.statusIconBox,
                        isDelivered
                          ? styles.statusIconBoxDelivered
                          : isFailed || isCancelled
                          ? styles.statusIconBoxFailed
                          : styles.statusIconBoxDefault,
                      ]}
                    >
                      {isFailed || isCancelled ? (
                        <CircleX size={30} color="#DC2626" strokeWidth={2.8} />
                      ) : isAcceptedOrUpdated ? (
                        <Check size={30} color={isDelivered ? "#16A34A" : "#2563EB"} strokeWidth={2.8} />
                      ) : null}
                    </View>
                  )}

                  <View style={[styles.statusTextWrap, isPlaced && styles.statusTextWrapNoIcon]}>
                    <Text
                      style={[
                        styles.statusTitle,
                        isDelivered
                          ? styles.statusTitleDelivered
                          : isFailed || isCancelled
                          ? styles.statusTitleFailed
                          : null,
                      ]}
                    >
                      {isDelivered ? "Delivered" : status}
                    </Text>
                    <Text style={styles.statusSubText}>{formatDateTime(order.createdAt)}</Text>
                  </View>
                </View>

                <View style={styles.timelineWrap}>
                  {ORDER_TIMELINE.map((step, idx) => {
                    const isActive = idx <= timelineIndex;
                    return (
                      <View key={step} style={styles.timelineStep}>
                        <View
                          style={[
                            styles.timelineDot,
                            isActive ? styles.timelineDotActive : styles.timelineDotIdle,
                          ]}
                        />
                        <Text
                          style={[
                            styles.timelineText,
                            isActive ? styles.timelineTextActive : styles.timelineTextIdle,
                          ]}
                        >
                          {formatStep(step)}
                        </Text>
                        {idx < ORDER_TIMELINE.length - 1 && (
                          <View
                            style={[
                              styles.timelineLine,
                              idx < timelineIndex
                                ? styles.timelineLineActive
                                : styles.timelineLineIdle,
                            ]}
                          />
                        )}
                      </View>
                    );
                  })}
                </View>

                <Text style={styles.sectionTitle}>
                  Basket Snapshot • {items.length} {items.length === 1 ? "item" : "items"}
                </Text>

                {items.map((item: any, idx: number) => {
                  const imageUri =
                    resolveImageUri(item?.productId?.images?.[0]) ||
                    resolveImageUri(item?.productId?.image) ||
                    resolveImageUri(item?.image);

                  const qty = Number(item?.quantity || 0);
                  const price = Number(item?.price || 0);

                  const productId =
                    item?.productId?._id ||
                    item?.productId?.id ||
                    (typeof item?.productId === "string" ? item.productId : undefined);

                  return (
                    <Pressable
                      key={idx}
                      style={styles.itemRow}
                      onPress={() => productId && onOpenProduct?.(productId)}
                      disabled={!productId}
                    >
                      <View style={styles.itemThumbBox}>
                        {imageUri ? (
                          <Image source={{ uri: imageUri }} style={styles.itemThumb} />
                        ) : (
                          <View style={styles.itemThumbFallback}>
                            <Package size={16} color="#7C8E84" strokeWidth={2.2} />
                          </View>
                        )}
                      </View>

                      <View style={styles.itemInfoCol}>
                        <Text style={styles.itemName} numberOfLines={2}>
                          {item?.productId?.name || "Item"}
                        </Text>
                        <Text style={styles.itemMeta}>₹{money(price)} x {qty}</Text>
                      </View>

                      <Text style={styles.itemPrice}>₹{money(price * qty)}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Spend Breakdown</Text>

                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Item Total</Text>
                  <Text style={styles.billValue}>₹{money(order.itemsSubtotal)}</Text>
                </View>

                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Delivery Fee</Text>
                  <Text style={styles.billValue}>₹{money(order.deliveryCharge)}</Text>
                </View>

                <View style={styles.billDivider} />

                <View style={styles.billRow}>
                  <Text style={styles.billTotalLabel}>Total Bill</Text>
                  <Text style={styles.billTotalValue}>₹{money(order.totalAmount)}</Text>
                </View>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Delivery Profile</Text>

                <Text style={styles.detailLabel}>Order ID</Text>
                <View style={styles.detailValueRow}>
                  <Text style={styles.detailValue}>#{order.checkoutId || "--"}</Text>
                  <Copy size={16} color="#8A9B92" strokeWidth={2.3} />
                </View>

                <Text style={styles.detailLabel}>Receiver Details</Text>
                <Text style={styles.detailValue}>{`${receiverName}, ${receiverPhone}`}</Text>

                <Text style={[styles.detailLabel, styles.detailGap]}>Delivery Address</Text>
                <Text style={styles.detailValue}>{order?.deliveryAddress?.street || "--"}</Text>

                <Text style={[styles.detailLabel, styles.detailGap]}>Order Placed at</Text>
                <Text style={styles.detailValue}>{formatDateTime(order.createdAt)}</Text>
              </View>
            </ScrollView>

            <View style={styles.bottomActions}>
              {isDelivered && (
                <Pressable
                  style={[styles.actionBtn, styles.secondaryBtn]}
                  onPress={() => Alert.alert("Coming Soon", "Rate order feature will be available soon")}
                >
                  <Text style={styles.secondaryBtnText}>Rate Order</Text>
                </Pressable>
              )}

              {canCancel ? (
                <Pressable
                  style={[styles.actionBtn, styles.cancelBtn]}
                  disabled={isCancelling}
                  onPress={() => onCancel(order._id)}
                >
                  <Text style={styles.primaryBtnText}>
                    {isCancelling ? "Cancelling..." : "Cancel Order"}
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.actionBtn, styles.primaryBtn]}
                  disabled={isOrderingAgain}
                  onPress={onOrderAgain}
                >
                  <Text style={styles.primaryBtnText}>
                    {isOrderingAgain ? "Adding..." : "Order Again"}
                  </Text>
                </Pressable>
              )}
            </View>
          </>
        )}

        <Pressable style={styles.closeFab} onPress={onClose}>
          <X size={20} color="#0F172A" strokeWidth={2.4} />
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EEF4FF",
  },
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loaderText: {
    marginTop: 10,
    color: "#607FA8",
    fontSize: 15,
    fontWeight: "500",
  },
  topHeader: {
    backgroundColor: "#F5F8FF",
    borderBottomWidth: 1,
    borderBottomColor: "#D6E4FF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#D6E4FF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFF",
  },
  headerTextWrap: {
    flex: 1,
    marginHorizontal: 10,
  },
  orderIdText: {
    color: "#123C7A",
    fontSize: 20,
    fontWeight: "800",
  },
  itemCountText: {
    color: "#5F7EA8",
    fontSize: 14,
    marginTop: 1,
    fontWeight: "500",
  },
  helpBtn: {
    flexDirection: "row",
    alignItems: "center",
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#BFD6FF",
    paddingHorizontal: 12,
    backgroundColor: "#EEF4FF",
  },
  helpBtnText: {
    marginLeft: 6,
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 110,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E6FF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 24,
    padding: 14,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#D9E6FF",
    paddingBottom: 12,
    marginBottom: 12,
  },
  statusIconBox: {
    width: 58,
    height: 58,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statusIconBoxDefault: {
    backgroundColor: "#EAF2FF",
  },
  statusIconBoxDelivered: {
    backgroundColor: "#EAF8EF",
  },
  statusIconBoxFailed: {
    backgroundColor: "#FFECEF",
  },
  statusTextWrap: {
    marginLeft: 10,
    flex: 1,
  },
  statusTextWrapNoIcon: {
    marginLeft: 0,
  },
  timelineWrap: {
    flexDirection: "row",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#DFE9FF",
  },
  timelineStep: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  timelineDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginBottom: 6,
  },
  timelineDotActive: {
    backgroundColor: "#2F7FF7",
  },
  timelineDotIdle: {
    backgroundColor: "#C9D8F1",
  },
  timelineText: {
    fontSize: 10,
    fontWeight: "700",
  },
  timelineTextActive: {
    color: "#245AAE",
  },
  timelineTextIdle: {
    color: "#8AA1C5",
  },
  timelineLine: {
    position: "absolute",
    top: 4,
    right: -34,
    width: 68,
    height: 1.2,
  },
  timelineLineActive: {
    backgroundColor: "#7EB0FF",
  },
  timelineLineIdle: {
    backgroundColor: "#D8E4F5",
  },
  statusTitle: {
    color: "#123C7A",
    fontSize: 23,
    fontWeight: "800",
  },
  statusTitleDelivered: {
    color: "#1E7A44",
  },
  statusTitleFailed: {
    color: "#B42338",
  },
  statusSubText: {
    color: "#607FA8",
    fontSize: 14,
    marginTop: 2,
  },
  sectionTitle: {
    color: "#184785",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  itemThumbBox: {
    width: 58,
    height: 58,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#EAF2FF",
  },
  itemThumb: {
    width: "100%",
    height: "100%",
  },
  itemThumbFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfoCol: {
    flex: 1,
    marginHorizontal: 10,
  },
  itemName: {
    color: "#1D4E94",
    fontSize: 15,
    fontWeight: "700",
  },
  itemMeta: {
    color: "#607FA8",
    fontSize: 12,
    marginTop: 2,
  },
  itemPrice: {
    color: "#123C7A",
    fontSize: 16,
    fontWeight: "800",
  },
  billRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  billLabel: {
    color: "#607FA8",
    fontSize: 15,
    fontWeight: "500",
  },
  billValue: {
    color: "#174B90",
    fontSize: 16,
    fontWeight: "700",
  },
  billDivider: {
    height: 1,
    backgroundColor: "#D9E6FF",
    marginVertical: 4,
  },
  billTotalLabel: {
    color: "#123C7A",
    fontSize: 20,
    fontWeight: "800",
  },
  billTotalValue: {
    color: "#123C7A",
    fontSize: 21,
    fontWeight: "800",
  },
  detailLabel: {
    color: "#607FA8",
    fontSize: 13,
    marginBottom: 2,
  },
  detailValueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailValue: {
    color: "#123C7A",
    fontSize: 17,
    fontWeight: "700",
    marginRight: 6,
  },
  detailGap: {
    marginTop: 10,
  },
  bottomActions: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#D9E6FF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
  },
  actionBtn: {
    flex: 1,
    height: 52,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: "#8CB6FF",
    backgroundColor: "#F2F7FF",
    marginRight: 8,
  },
  secondaryBtnText: {
    color: "#245BD6",
    fontSize: 18,
    fontWeight: "700",
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    marginLeft: 8,
  },
  cancelBtn: {
    backgroundColor: "#B23A48",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  closeFab: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(37,99,235,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
});
