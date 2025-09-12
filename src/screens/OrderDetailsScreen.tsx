// src/screens/OrderDetailsScreen.tsx
import React, { useMemo, useState, useEffect } from "react";
import { View, Image, StyleSheet, Pressable, FlatList, ActivityIndicator } from "react-native";
import { Appbar, Text, useTheme, Divider, Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useCart } from "../context/CartContext";
import { Asset } from "expo-asset";
import type { OrderStatus, OrderItem, Order } from "../types";
import { ORDER } from "../data/order";
import { STATUS_STEPS } from "../data/statusSteps";
import { getCurrentStepIndex, currency, buildInvoiceHTML } from "../utils/format";

const OrderDetailsScreen: React.FC<any> = ({ route, navigation }) => {
  // --- Hooks: always call hooks first (no conditional hooks) ---
  const theme = useTheme();
  const { add } = useCart();

  const passedOrder: Order | undefined = route.params?.order;
  const orderId: string | undefined = route.params?.orderId;

  // compute the resolved order (useMemo is a hook — keep up here)
  const order: Order | undefined = useMemo(() => {
    if (passedOrder) return passedOrder;
    if (orderId) return ORDER.find((o) => o.id === orderId);
    return undefined;
  }, [passedOrder, orderId]);

  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Preload bundled images (flatten the arrays properly)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // collect all local images from demo orders
        const assetModules = ORDER.flatMap((o) => o.items.map((it) => it.image)).filter(Boolean);
        // only call loadAsync if we have local module ids (numbers)
        const moduleIds = assetModules.filter((m) => typeof m === "number") as any[];
        if (moduleIds.length > 0) {
          await Asset.loadAsync(moduleIds);
        }
      } catch (e) {
        console.warn("Asset preload failed", e);
      } finally {
        if (mounted) setAssetsLoaded(true);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // keep this early-return only for rendering — hooks already settled above
  if (!assetsLoaded) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#2E4374" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Order not found</Text>
      </View>
    );
  }

  // derived values (not hooks)
  const stepIndex = getCurrentStepIndex(order.status);
  const subtotal = order.subtotal ?? order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = order.shipping ?? 0;
  const tax = order.tax ?? 0;
  const total = order.total ?? subtotal + shipping + tax;

  const onDownloadInvoice = async () => {
    try {
      const html = buildInvoiceHTML(order);
      const file = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(file.uri, { mimeType: "application/pdf" });
    } catch (e) {
      console.warn("Invoice error:", e);
    }
  };

  const onReorder = () => {
    order.items.forEach((i) => {
      const fakeProduct = {
        id: i.id,
        name: i.name,
        price: i.price,
        description: "",
        sizes: [],
        category: "Shirts",
        variants: [
          {
            color: "Default",
            hex: "#333",
            images: i.image ? [i.image] : [],
            stockBySize: {},
          },
        ],
      };
      add(fakeProduct, i.quantity, undefined, 0);
    });
    navigation.navigate("Cart");
  };

  // ---------- List header / footer ----------
  const ListHeader = () => (
    <View>
      {/* Tracking / Status */}
      <LinearGradient colors={["#1E2749", "#2E4374"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.trackCard}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.trackTitle}>Package Tracking</Text>
            <Text style={styles.trackSub}>
              {order.courier ?? "Courier"} • {order.trackingId ?? "-"}
            </Text>
          </View>
          <View style={styles.statusPill}>
            <Ionicons name="ellipse" size={10} color="#4ef08a" />
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineWrap}>
          {STATUS_STEPS.map((label, i) => {
            const active = i <= stepIndex;
            const nextActive = i < stepIndex;
            return (
              <View key={label} style={styles.timelineStep}>
                <View style={styles.lineWrap}>
                  <View style={[styles.dot, { backgroundColor: active ? "#4ef08a" : "rgba(255,255,255,0.4)" }]} />
                  {i < STATUS_STEPS.length - 1 && (
                    <View style={[styles.line, { backgroundColor: nextActive ? "#4ef08a" : "rgba(255,255,255,0.25)" }]} />
                  )}
                </View>
                <Text style={[styles.stepLabel, { color: active ? "#fff" : "rgba(255,255,255,0.7)" }]}>{label}</Text>
              </View>
            );
          })}
        </View>

        {order.eta ? <Text style={styles.trackEta}>Est. delivery {order.eta}</Text> : null}
      </LinearGradient>

      {/* Address */}
      <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 350 }} style={styles.card}>
        <Text style={styles.cardTitle}>Delivery Address</Text>
        <Text style={styles.addrLine}>{order.address?.name ?? "-"}</Text>
        <Text style={styles.addrLine}>{order.address?.line1 ?? "-"}</Text>
        <Text style={styles.addrLine}>{(order.address?.city ?? "-") + " " + (order.address?.zip ?? "")}</Text>
        {!!order.address?.phone && <Text style={styles.addrLine}>{order.address.phone}</Text>}
      </MotiView>

      {/* Items title */}
      <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 60, type: "timing", duration: 350 }} style={[styles.card, { paddingBottom: 8 }]}>
        <Text style={styles.cardTitle}>Items</Text>
      </MotiView>
    </View>
  );

  const ListFooter = () => (
    <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 100, type: "timing", duration: 350 }} style={styles.card}>
      <Text style={styles.cardTitle}>Payment Summary</Text>
      <View style={styles.rowBetween}>
        <Text style={styles.muted}>Subtotal</Text>
        <Text style={styles.bold}>{currency(subtotal)}</Text>
      </View>
      <View style={styles.rowBetween}>
        <Text style={styles.muted}>Shipping</Text>
        <Text style={styles.bold}>{currency(shipping)}</Text>
      </View>
      <View style={styles.rowBetween}>
        <Text style={styles.muted}>Tax</Text>
        <Text style={styles.bold}>{currency(tax)}</Text>
      </View>
      <Divider style={{ opacity: 0.08, marginVertical: 10 }} />
      <View style={styles.rowBetween}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{currency(total)}</Text>
      </View>

      <View style={styles.actionsRow}>
        <Pressable onPress={onDownloadInvoice} style={styles.outlinedBtn}>
          <Ionicons name="download-outline" size={18} color="#1E2749" />
          <Text style={styles.outlinedText}>Download Invoice</Text>
        </Pressable>

        <LinearGradient colors={["#1E2749", "#2E4374"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.reorderGrad}>
          <Pressable onPress={onReorder} style={styles.reorderBtn}>
            <Ionicons name="cart" size={18} color="#fff" />
            <Text style={styles.reorderText}>Reorder</Text>
          </Pressable>
        </LinearGradient>
      </View>

      {order.trackingId && (
        <View style={{ marginTop: 8 }}>
          <Button icon="open-in-new" mode="text" onPress={() => { /* Linking.openURL(...) */ }}>
            Track on carrier site
          </Button>
        </View>
      )}
    </MotiView>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
        <Appbar.Content
          title={`Order ${order.id}`}
          titleStyle={{ color: "#fff", fontWeight: "700" }}
          subtitle={new Date(order.date).toDateString()}
          subtitleStyle={{ color: "#e9e9e9" }}
        />
        <Appbar.Action icon="download" color="#fff" onPress={onDownloadInvoice} />
      </Appbar.Header>

      <FlatList
        data={order.items}
        keyExtractor={(i) => i.id}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ItemSeparatorComponent={() => <Divider style={{ opacity: 0.08 }} />}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { paddingVertical: 10 }]}>
            <View style={styles.itemRow}>
              <View style={styles.thumbWrap}>
                {item.image ? (
                  // PASS local require(...) directly
                  <Image source={item.image} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, { backgroundColor: "#f1f1f1" }]} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={2} style={styles.itemName}>
                  {item.name}
                </Text>
                <Text style={styles.itemMeta}>Qty {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default OrderDetailsScreen;

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },

  container: { flex: 1, backgroundColor: "#fafafa" },

  trackCard: { margin: 12, padding: 14, borderRadius: 14 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  trackTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },
  trackSub: { color: "rgba(255,255,255,0.85)", marginTop: 4 },

  statusPill: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
  },
  statusText: { color: "#fff", fontWeight: "700" },

  timelineWrap: { marginTop: 12, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  timelineStep: { alignItems: "center", flex: 1 },
  lineWrap: { width: "100%", flexDirection: "row", alignItems: "center", marginBottom: 6 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  line: { height: 3, flex: 1, marginHorizontal: 6, borderRadius: 2 },
  stepLabel: { fontSize: 12, fontWeight: "700", color: "#fff" },
  trackEta: { color: "rgba(255,255,255,0.9)", marginTop: 8 },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { fontWeight: "800", color: "#111", marginBottom: 8 },

  addrLine: { color: "#333", marginTop: 2 },

  itemRow: { flexDirection: "row", alignItems: "center" },
  thumbWrap: { width: 54, height: 54, borderRadius: 8, overflow: "hidden", backgroundColor: "#f1f1f1" },
  thumb: { width: "100%", height: "100%", resizeMode: "cover" },
  itemName: { fontWeight: "700", color: "#222" },
  itemMeta: { color: "#666", marginTop: 2, fontSize: 12 },
  itemPrice: { fontWeight: "800", color: "#111" },

  muted: { color: "#666" },
  bold: { fontWeight: "700", color: "#111" },
  totalLabel: { fontSize: 14, fontWeight: "800", color: "#111" },
  totalValue: { fontSize: 16, fontWeight: "900", color: "#111" },

  actionsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },

  outlinedBtn: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: "#d9d9e3", backgroundColor: "#fff",
  },
  outlinedText: { color: "#1E2749", fontWeight: "800" },

  reorderGrad: { borderRadius: 10, overflow: "hidden" },
  reorderBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10 },
  reorderText: { color: "#fff", fontWeight: "800" },
});
