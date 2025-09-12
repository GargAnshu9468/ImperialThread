import React, { useMemo, useState } from "react";
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  Pressable,
} from "react-native";
import {
  Appbar,
  Button,
  Text,
  useTheme,
  Divider,
  Chip,
  Snackbar,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import CartIconBadge from "../components/CartIconBadge";
import { SafeAreaView } from "react-native-safe-area-context";

const FREE_SHIPPING_THRESHOLD = 1499;
const SHIPPING_FEE = 99;

const CartScreen: React.FC<any> = ({ navigation }) => {
  const theme = useTheme();
  const { items, updateQty, remove, add } = useCart();
  const { addToWishlist } =
    useWishlist?.() || { addToWishlist: () => {} };

  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [lastRemoved, setLastRemoved] = useState<any | null>(null);
  const [lastAction, setLastAction] =
    useState<"delete" | "wishlist" | null>(null);

  const subtotal = useMemo(
    () => items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0),
    [items]
  );

  const qualifiesFreeShipThreshold = subtotal >= FREE_SHIPPING_THRESHOLD;
  const freeShipping = qualifiesFreeShipThreshold;
  const shipping = items.length === 0 ? 0 : freeShipping ? 0 : SHIPPING_FEE;
  const grandTotal = subtotal + shipping;

  // Build a minimal Product from a CartItem so we can undo via CartContext.add()
  const buildProductFromCartItem = (ci: any) => {
    const sizes = Object.keys(ci?.stockBySize || {});
    return {
      id: ci.id,
      name: ci.name,
      price: ci.price,
      description: "",
      sizes,
      category: "Shirts",
      variants: [
        {
          color: ci.color || "Default",
          hex: ci.hex || "#999",
          images: ci.images || [],
          stockBySize: ci.stockBySize || {},
        },
      ],
    };
  };

  const handleDelete = (item: any) => {
    setLastRemoved(item);
    setLastAction("delete");
    remove(item.id, item.selectedSize, item.variantIndex);
    setSnackMsg("Removed from cart");
    setSnackVisible(true);
  };

  const handleUndo = () => {
    if (lastAction !== "delete" || !lastRemoved) return;
    const fakeProduct = buildProductFromCartItem(lastRemoved);
    add(
      fakeProduct,
      lastRemoved.quantity,
      lastRemoved.selectedSize,
      lastRemoved.variantIndex || 0
    );
    setLastRemoved(null);
    setLastAction(null);
    setSnackVisible(false);
  };

  const handleSaveToWishlist = (item: any) => {
    addToWishlist?.({
      id: item.id,
      name: item.name,
      price: item.price,
      variants: [
        {
          color: item.color || "Default",
          hex: item.hex || "#999",
          images: item.images || [],
          stockBySize: item.stockBySize || {},
        },
      ],
      sizes: Object.keys(item?.stockBySize || {}),
      description: "",
      category: "Shirts",
    });

    // if you want "save" to also remove from cart, uncomment:
    // remove(item.id, item.selectedSize, item.variantIndex);

    setSnackMsg("Saved to wishlist");
    setLastAction("wishlist");
    setLastRemoved(null); // important: avoid restoring an old delete
    setSnackVisible(true);
  };

  const renderLeftActions = (item: any) => {
    return (
      <View style={styles.swipeLeftWrap}>
        <Pressable
          onPress={() => handleSaveToWishlist(item)}
          style={({ pressed }) => [
            styles.swipeLeftBtn,
            pressed && { opacity: 0.9 },
          ]}
        >
          <Ionicons name="heart-outline" size={20} color="#fff" />
          <Text style={styles.swipeText}>Save</Text>
        </Pressable>
      </View>
    );
  };

  const renderRightActions = (item: any) => {
    return (
      <View style={styles.swipeRightWrap}>
        <Pressable
          onPress={() => handleDelete(item)}
          style={({ pressed }) => [
            styles.swipeRightBtn,
            pressed && { opacity: 0.9 },
          ]}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.swipeText}>Delete</Text>
        </Pressable>
      </View>
    );
  };

  const renderItem = ({ item }: any) => {
    const img = item?.images?.[0];

    return (
      <Swipeable
        renderLeftActions={() => renderLeftActions(item)}
        renderRightActions={() => renderRightActions(item)}
        leftThreshold={40}
        rightThreshold={40}
        overshootLeft={false}
        overshootRight={false}
      >
        <View style={styles.itemCard}>
          {/* Image */}
          <Pressable
            onPress={() => {
              // CHANGED: navigate to nested Product inside Home stack
              const productForNav = buildProductFromCartItem(item);
              navigation.navigate("Home", {
                screen: "Product",
                params: { product: productForNav },
              });
            }}
            style={styles.imageWrap}
          >
            {img ? (
              <Image source={ img } style={styles.image} />
            ) : (
              <View style={[styles.image, { backgroundColor: "#f2f2f2" }]} />
            )}
          </Pressable>

          {/* Details */}
          <View style={styles.itemBody}>
            <Text variant="titleMedium" style={styles.itemTitle} numberOfLines={2}>
              {item.name}
            </Text>

            <View style={styles.metaRow}>
              {item.hex ? (
                <View style={styles.colorRow}>
                  <View style={[styles.swatch, { backgroundColor: item.hex }]} />
                  <Text style={styles.metaText}>{item.color}</Text>
                </View>
              ) : null}
              {item.selectedSize ? (
                <Chip compact style={styles.sizeChip}>
                  Size {item.selectedSize}
                </Chip>
              ) : null}
            </View>

            <Text
              variant="titleSmall"
              style={[styles.price, { color: theme.colors.primary }]}
            >
              ₹{item.price}
            </Text>

            {/* Stepper + Remove quick */}
            <View style={styles.actionRow}>
              <View style={styles.stepper}>
                <Pressable
                  onPress={() =>
                    updateQty(
                      item.id,
                      Math.max(1, item.quantity - 1),
                      item.selectedSize,
                      item.variantIndex
                    )
                  }
                  style={({ pressed }) => [styles.stepBtn, pressed && styles.stepPressed]}
                >
                  <Ionicons name="remove" size={18} color="#222" />
                </Pressable>

                <Text style={styles.qtyText}>{item.quantity}</Text>

                <Pressable
                  onPress={() =>
                    updateQty(
                      item.id,
                      item.quantity + 1,
                      item.selectedSize,
                      item.variantIndex
                    )
                  }
                  style={({ pressed }) => [styles.stepBtn, pressed && styles.stepPressed]}
                >
                  <Ionicons name="add" size={18} color="#222" />
                </Pressable>
              </View>

              <Pressable
                onPress={() => handleDelete(item)}
                style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.7 }]}
              >
                <Ionicons name="trash-outline" size={16} color="#e63946" />
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Swipeable>
    );
  };

  if (!items.length) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#fafafa" }]}>
        <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
          <Appbar.Content title="Imperial Thread" color="#fff" />
          <CartIconBadge color="#fff" onPress={() => navigation.navigate("Cart")} />
        </Appbar.Header>

        <View style={styles.emptyWrap}>
          <Ionicons name="cart-outline" size={72} color="#c5c5c5" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add something you love from Imperial Thread
          </Text>
          <Button
            mode="contained"
            style={{ marginTop: 16, borderRadius: 10 }}
            onPress={() => navigation.navigate("Home")}
          >
            Continue Shopping
          </Button>

          <Snackbar
            visible={snackVisible}
            onDismiss={() => setSnackVisible(false)}
            action={
              lastAction === "delete"
                ? { label: "UNDO", onPress: handleUndo, textColor: "#fff" }
                : undefined
            }
            duration={2500}
            style={{ backgroundColor: "#333" }}
          >
            <Text style={{ color: "#fff" }}>{snackMsg}</Text>
          </Snackbar>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#f7f7f7" }]}>
      {/* Header with cart badge */}
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
        <Appbar.Content
          title="Your Cart"
          titleStyle={{ color: "#fff", fontWeight: "bold" }}
        />
        <View style={{ marginRight: 8 }}>
          <Ionicons name="cart-outline" size={22} color="#fff" />
          {items.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{items.length}</Text>
            </View>
          )}
        </View>
      </Appbar.Header>

      {/* Items */}
      <FlatList
        data={items}
        keyExtractor={(i: any, idx) =>
          `${i.id}-${i.variantIndex}-${i.selectedSize ?? "na"}-${idx}`
        }
        renderItem={renderItem}
        ItemSeparatorComponent={() => <Divider style={{ opacity: 0.08 }} />}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* Sticky footer: subtotal + checkout */}
      <LinearGradient
        colors={["#ffffff", "#f8f8f8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.footer}
      >
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.footerLabel}>Subtotal</Text>
            <Text style={styles.footerValue}>₹{subtotal.toFixed(0)}</Text>
            <Text style={styles.footerShipping}>
              {freeShipping ? "Free Shipping" : `Shipping ₹${shipping}`}
            </Text>
          </View>
          <Button
            mode="contained"
            style={styles.checkoutBtn}
            contentStyle={{ height: 46 }}
            onPress={() =>
              // CHANGED: navigate to nested Checkout inside Home stack
              navigation.navigate("Home", { screen: "Checkout" })
            }
          >
            Proceed to Checkout
          </Button>
        </View>
      </LinearGradient>

      {/* Undo snackbar */}
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        action={
          lastRemoved
            ? { label: "UNDO", onPress: handleUndo, textColor: "#fff" }
            : undefined
        }
        duration={2500}
        style={{ backgroundColor: "#333" }}
      >
        <Text style={{ color: "#fff" }}>{snackMsg}</Text>
      </Snackbar>
    </SafeAreaView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Swipe actions
  swipeLeftWrap: {
    width: 96,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
    marginLeft: 12,
    borderRadius: 14,
    overflow: "hidden",
  },
  swipeLeftBtn: {
    backgroundColor: "#F39C12",
    width: 96,
    height: "90%",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  swipeRightWrap: {
    width: 96,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
    marginRight: 12,
    borderRadius: 14,
    overflow: "hidden",
  },
  swipeRightBtn: {
    backgroundColor: "#e63946",
    width: 96,
    height: "90%",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  swipeText: { color: "#fff", marginTop: 4, fontWeight: "700" },

  itemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 14,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  imageWrap: {
    width: 90,
    height: 90,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f2f2f2",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", height: "100%", resizeMode: "cover" },

  itemBody: { flex: 1 },
  itemTitle: { color: "#222", fontWeight: "700" },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 10,
  },
  colorRow: { flexDirection: "row", alignItems: "center" },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.15)",
  },
  metaText: { color: "#555", fontSize: 12.5 },
  sizeChip: { backgroundColor: "#f4f6ff" },

  price: { marginTop: 6, fontWeight: "700" },

  actionRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f7",
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  stepPressed: { transform: [{ scale: 0.96 }] },
  qtyText: { marginHorizontal: 10, fontWeight: "700", fontSize: 14 },

  removeBtn: { flexDirection: "row", alignItems: "center" },
  removeText: { color: "#e63946", marginLeft: 6, fontWeight: "600" },

  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "800",
    color: "#222",
  },
  emptySubtitle: { color: "#666", marginTop: 6, textAlign: "center" },

  // Footer (sticky)
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "#fff",
    elevation: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 10,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  footerLabel: { color: "#777", fontSize: 12 },
  footerValue: { color: "#111", fontWeight: "800", fontSize: 16, marginTop: 2 },
  footerShipping: { color: "#0B8457", fontSize: 12, marginTop: 2 },
  checkoutBtn: { borderRadius: 12, minWidth: 180 },

  // Small badge for header icon
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontWeight: "800", fontSize: 11 },
});
