// src/screens/OrdersScreen.tsx
import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from "react-native";
import {
  Appbar,
  Text,
  Searchbar,
  Chip,
  Button,
  useTheme,
  Divider,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useCart } from "../context/CartContext";
import { Asset } from "expo-asset";
import type { OrderStatus, OrderItem, Order } from "../utils/types";
import { ORDERS } from "../data/orders";
import { FILTERS } from "../data/orderFilters";
import StatusBadge from "../components/StatusBadge";

const OrdersScreen: React.FC<any> = ({ navigation }) => {
  const theme = useTheme();
  const { add } = useCart();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | OrderStatus>("All");
  const [refreshing, setRefreshing] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  const [orders, setOrders] = useState<Order[]>(ORDERS);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const statusOk = status === "All" ? true : o.status === status;
      const qOk =
        q.length === 0 ||
        o.id.toLowerCase().includes(q) ||
        o.items.some((it) => it.name.toLowerCase().includes(q));
      return statusOk && qOk;
    });
  }, [orders, query, status]);

  // Preload bundled images for a smooth first render
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // flatten arrays and only keep numeric module ids (local require results)
        const assetModules = ORDERS.flatMap((order) => order.items.map((item) => item.image)).filter(Boolean);
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

  // While assets load show a centered spinner (prevents flicker)
  if (!assetsLoaded) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#2E4374" />
      </View>
    );
  }

  const handleReorder = (order: Order) => {
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
    // Drawer-level route – OK
    navigation.navigate("Cart");
  };

  const renderOrder = ({ item, index }: { item: Order; index: number }) => {
    return (
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: index * 60 }}
        style={styles.card}
      >
        {/* Header row */}
        <View style={styles.rowBetween}>
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.orderId}>Order {item.id}</Text>
            <Text style={styles.dateText}>
              {new Date(item.date).toDateString()}
            </Text>
          </View>
          <StatusBadge s={item.status} />
        </View>

        {/* Thumbnails */}
        <View style={styles.thumbRow}>
          {item.items.slice(0, 4).map((it, i) => (
            <View key={i} style={styles.thumbWrap}>
              {it.image ? (
                <Image source={it.image} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, { backgroundColor: "#f1f1f1" }]} />
              )}
              {it.quantity > 1 && (
                <View style={styles.qtyBubble}>
                  <Text style={styles.qtyBubbleText}>×{it.quantity}</Text>
                </View>
              )}
            </View>
          ))}
          {item.items.length > 4 && (
            <View style={[styles.thumb, styles.moreThumb]}>
              <Text style={{ color: "#333", fontWeight: "700" }}>
                +{item.items.length - 4}
              </Text>
            </View>
          )}
        </View>

        <Divider style={{ opacity: 0.08, marginVertical: 10 }} />

        {/* Total + actions */}
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{item.total.toFixed(0)}</Text>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Button
              mode="outlined"
              compact
              style={styles.outlineBtn}
              icon="eye-outline"
              onPress={() =>
                // ⬇️ navigate to nested Home stack -> OrderDetails
                navigation.navigate("Home", {
                  screen: "OrderDetails",
                  params: { order: item },
                })
              }
            >
              Details
            </Button>

            {/* Gradient “Reorder” */}
            <LinearGradient
              colors={["#1E2749", "#2E4374"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.reorderGrad}
            >
              <Pressable onPress={() => handleReorder(item)} style={styles.reorderBtn}>
                <Ionicons name="cart" size={18} color="#fff" />
                <Text style={styles.reorderText}>Reorder</Text>
              </Pressable>
            </LinearGradient>
          </View>
        </View>
      </MotiView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
        <Appbar.Content
          title="Your Orders"
          titleStyle={{ color: "#fff", fontWeight: "700" }}
        />
        <Appbar.Action
          icon="cart"
          color="#fff"
          onPress={() => navigation.navigate("Cart")}
        />
      </Appbar.Header>

      <FlatList
        data={filtered}
        keyExtractor={(o) => o.id}
        renderItem={renderOrder}
        ListEmptyComponent={() => (
          <View style={styles.emptyWrap}>
            <Ionicons name="cube-outline" size={64} color="#c8c8c8" />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>
              Your completed and in-progress orders will show up here.
            </Text>
            <Button
              mode="contained"
              style={{ marginTop: 16, borderRadius: 12 }}
              onPress={() =>
                // ⬇️ go to drawer Home -> stack HomeMain
                navigation.navigate("Home", { screen: "HomeMain" })
              }
            >
              Start shopping
            </Button>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 16 }}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <Searchbar
              placeholder="Search orders or products"
              value={query}
              onChangeText={setQuery}
              style={styles.search}
              inputStyle={{ fontSize: 15 }}
            />
            <View style={styles.filterRow}>
              {FILTERS.map((f) => {
                const selected = status === f;
                return (
                  <Chip
                    key={f}
                    selected={selected}
                    onPress={() => setStatus(f)}
                    style={[
                      styles.filterChip,
                      selected && { backgroundColor: theme.colors.primary },
                    ]}
                    textStyle={{
                      color: selected ? "#fff" : "#333",
                      fontWeight: "600",
                    }}
                    icon={
                      selected
                        ? (props) => (
                            <Ionicons
                              name="checkmark-circle"
                              size={16}
                              color="#fff"
                              style={{ marginRight: 4 }}
                            />
                          )
                        : undefined
                    }
                  >
                    {f}
                  </Chip>
                );
              })}
            </View>
          </View>
        }
        stickyHeaderIndices={[0]}
      />
    </View>
  );
};

export default OrdersScreen;

// ---- Styles ----
const styles = StyleSheet.create({
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },

  container: { flex: 1, backgroundColor: "#fafafa" },

  headerWrap: {
    padding: 12,
    backgroundColor: "#fafafa",
  },
  search: {
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    borderRadius: 20,
    backgroundColor: "#f0f1f5",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  orderId: { fontWeight: "800", fontSize: 15, color: "#1b1b1b" },
  dateText: { marginTop: 2, color: "#666", fontSize: 12.5 },

  thumbRow: { flexDirection: "row", marginTop: 12, gap: 8 },
  thumbWrap: { position: "relative" },
  thumb: { width: 56, height: 56, borderRadius: 8 },
  moreThumb: {
    backgroundColor: "#f1f2f6",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBubble: {
    position: "absolute",
    bottom: -6,
    right: -6,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  qtyBubbleText: { fontSize: 11, fontWeight: "800", color: "#333" },

  totalLabel: { color: "#666", fontSize: 12 },
  totalValue: { fontSize: 16, fontWeight: "800", color: "#111", marginTop: 2 },

  outlineBtn: { borderRadius: 10 },

  reorderGrad: {
    borderRadius: 10,
    overflow: "hidden",
  },
  reorderBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  reorderText: { color: "#fff", fontWeight: "800" },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  emptyTitle: { marginTop: 12, fontSize: 18, fontWeight: "800", color: "#222" },
  emptySubtitle: { color: "#666", marginTop: 6, textAlign: "center" },
});
