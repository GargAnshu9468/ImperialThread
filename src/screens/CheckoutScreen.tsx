// src/screens/CheckoutScreen.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
} from "react-native";
import {
  Appbar,
  Button,
  Text,
  TextInput,
  useTheme,
  RadioButton,
  Divider,
  Chip,
  Snackbar,
  Surface,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCart } from "../context/CartContext";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

/**
 * 🔧 CONFIG: Swap these to match your region/business rules
 */
const PRICING_CONFIG = {
  taxRate: 0.18,                         // 18% GST (example)
  freeShippingThreshold: 999,            // Free shipping from ₹999
  baseShippingFee: 79,                   // Otherwise, flat ₹79
  // Optional regional surcharges (example)
  regionSurcharges: {
    // "MH": 0, // Maharashtra
    // "DL": 15, // Delhi additional ₹15
  },
} as const;

type Promo = {
  code: string;
  label: string;
  // return the discount amount for a given subtotal (in ₹)
  compute: (subtotal: number) => number;
};

// 🎟️ Define all your promo codes here
const PROMOS: Promo[] = [
  {
    code: "IMPERIAL10",
    label: "10% off",
    compute: (subtotal) => Math.round(subtotal * 0.1),
  },
  {
    code: "FREESHIP",
    label: "Free Shipping",
    compute: () => 0, // discount applies by waiving shipping below
  },
  // Tiered example:
  {
    code: "SAVE1500",
    label: "₹200 off orders ₹1500+",
    compute: (subtotal) => (subtotal >= 1500 ? 200 : 0),
  },
];

/** Compute shipping (can use pincode/region if desired) */
const computeShipping = (subtotal: number, pin: string | undefined) => {
  const free = subtotal >= PRICING_CONFIG.freeShippingThreshold;
  const base = free ? 0 : PRICING_CONFIG.baseShippingFee;

  // Optional region surcharge based on PIN prefix, state, etc.
  if (pin && pin.length >= 2) {
    // Example: map first 2 digits -> stateCode, then surcharge if configured
    // const stateCode = toStateCode(pin); // your own mapping
    // const add = PRICING_CONFIG.regionSurcharges[stateCode] ?? 0;
    // return base + add;
  }

  return base;
};

const CheckoutScreen: React.FC<any> = ({ navigation }) => {
  const theme = useTheme();
  const { items, clear } = useCart();

  // Address (skeleton)
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [pin, setPin] = useState("");

  // Payment + Promo
  const [payMethod, setPayMethod] = useState<"UPI" | "CARD" | "COD">("UPI");
  const [promo, setPromo] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<Promo | null>(null);
  const [snack, setSnack] = useState<{ visible: boolean; msg: string }>({
    visible: false,
    msg: "",
  });

  // Cart math
  const itemsCount = items.reduce((n: number, i: any) => n + i.quantity, 0);
  const subtotal = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);

  const shipping = items.length === 0 ? 0 : computeShipping(subtotal, pin);
  // Promo discount (pre-tax)
  const promoDiscount = appliedPromo ? appliedPromo.compute(subtotal) : 0;
  const taxableBase = Math.max(0, subtotal - promoDiscount);
  const tax = Math.round(taxableBase * PRICING_CONFIG.taxRate);

  // If promo is FREESHIP, override shipping to zero
  const isFreeShipPromo = appliedPromo?.code === "FREESHIP";
  const finalShipping = isFreeShipPromo ? 0 : shipping;

  const grandTotal = Math.max(0, taxableBase + tax + finalShipping);

  const totals = useMemo(
    () => ({
      itemsCount,
      subtotal,
      promoDiscount,
      shipping: finalShipping,
      tax,
      grandTotal,
    }),
    [itemsCount, subtotal, promoDiscount, finalShipping, tax, grandTotal]
  );

  const applyPromo = () => {
    if (!promo.trim()) {
      setSnack({ visible: true, msg: "Enter a promo code" });
      return;
    }
    const found = PROMOS.find(
      (p) => p.code === promo.trim().toUpperCase()
    );
    if (found) {
      setAppliedPromo(found);
      setSnack({ visible: true, msg: `Applied: ${found.label}` });
    } else {
      setAppliedPromo(null);
      setSnack({ visible: true, msg: "Invalid promo code" });
    }
  };

  const handlePay = () => {
    if (!name || !phone || !line1 || !city || !pin) {
      setSnack({ visible: true, msg: "Please fill all required address fields" });
      return;
    }

    // You would integrate Stripe/Razorpay here.
    // After successful payment or COD confirm, navigate to success.
    const orderId = "IT-" + Math.random().toString(36).slice(2, 8).toUpperCase();

    clear();

    navigation.replace("OrderSuccess", {
      orderId,
      amount: totals.grandTotal,
      itemsCount: totals.itemsCount,
    });
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
        <Appbar.Content
          title="Checkout"
          titleStyle={{ color: "#fff", fontWeight: "800" }}
        />
        <Text style={{ color: "#fff", marginRight: 12, opacity: 0.85 }}>
          {itemsCount} item{itemsCount === 1 ? "" : "s"}
        </Text>
      </Appbar.Header>

      <ScrollView
        style={{ flex: 1, backgroundColor: "#f7f7f7" }}
        contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
      >
        {/* Address Card */}
        <Surface style={styles.card} elevation={2}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Delivery Address</Text>
            <Chip compact style={styles.reqChip}>Required</Chip>
          </View>
          <View style={{ gap: 10 }}>
            <TextInput mode="outlined" label="Full name" value={name} onChangeText={setName} />
            <TextInput mode="outlined" label="Phone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            <TextInput mode="outlined" label="Address line 1" value={line1} onChangeText={setLine1} />
            <TextInput mode="outlined" label="Address line 2 (optional)" value={line2} onChangeText={setLine2} />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TextInput mode="outlined" label="City" style={{ flex: 1 }} value={city} onChangeText={setCity} />
              <TextInput mode="outlined" label="PIN / ZIP" keyboardType="number-pad" style={{ flex: 1 }} value={pin} onChangeText={setPin} />
            </View>
          </View>
        </Surface>

        {/* Payment Method */}
        <Surface style={styles.card} elevation={2}>
          <View style={styles.cardHeader}>
            <Ionicons name="card-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Payment Method</Text>
          </View>

          <RadioButton.Group onValueChange={(v) => setPayMethod(v as any)} value={payMethod}>
            <Pressable style={styles.radioRow} onPress={() => setPayMethod("UPI")}>
              <RadioButton value="UPI" />
              <MaterialCommunityIcons
                name="currency-inr"
                size={18}
                color="#555"
                style={{ marginRight: 8 }}
              />
              <Text>UPI (Google Pay, PhonePe, etc.)</Text>
            </Pressable>
            <Divider style={styles.sep} />
            <Pressable style={styles.radioRow} onPress={() => setPayMethod("CARD")}>
              <RadioButton value="CARD" />
              <Ionicons name="card-outline" size={18} color="#555" style={{ marginRight: 8 }} />
              <Text>Credit / Debit Card</Text>
            </Pressable>
            <Divider style={styles.sep} />
            <Pressable style={styles.radioRow} onPress={() => setPayMethod("COD")}>
              <RadioButton value="COD" />
              <Ionicons name="cash-outline" size={18} color="#555" style={{ marginRight: 8 }} />
              <Text>Cash on Delivery</Text>
            </Pressable>
          </RadioButton.Group>

          {payMethod === "CARD" && (
            <View style={{ marginTop: 10, gap: 10 }}>
              <TextInput mode="outlined" label="Card Number" keyboardType="number-pad" />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TextInput mode="outlined" label="MM/YY" style={{ flex: 1 }} />
                <TextInput mode="outlined" label="CVV" secureTextEntry style={{ flex: 1 }} />
              </View>
              <TextInput mode="outlined" label="Card Holder Name" />
            </View>
          )}
        </Surface>

        {/* Promo Code */}
        <Surface style={styles.card} elevation={2}>
          <View style={styles.cardHeader}>
            <Ionicons name="pricetags-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Promo Code</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TextInput
              mode="outlined"
              placeholder="Enter code"
              value={promo}
              onChangeText={setPromo}
              autoCapitalize="characters"
              style={{ flex: 1 }}
            />
            <Button mode="contained" onPress={applyPromo} style={{ borderRadius: 8 }}>
              Apply
            </Button>
          </View>
          {appliedPromo && (
            <Chip icon="check" style={{ marginTop: 10 }} selectedColor="#2e7d32">
              {appliedPromo.code} — {appliedPromo.label}
            </Chip>
          )}
        </Surface>

        {/* Order Summary */}
        <Surface style={styles.card} elevation={2}>
          <View style={styles.cardHeader}>
            <Ionicons name="reader-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Order Summary</Text>
            {itemsCount > 0 && (
              <Chip compact style={{ marginLeft: "auto" }}>
                {itemsCount} item{itemsCount === 1 ? "" : "s"}
              </Chip>
            )}
          </View>

          <View style={styles.row}>
            <Text style={styles.muted}>Subtotal</Text>
            <Text style={styles.value}>₹{subtotal.toFixed(0)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.muted}>Promo Discount</Text>
            <Text style={[styles.value, { color: appliedPromo ? "#2e7d32" : "#999" }]}>
              {appliedPromo ? `-₹${promoDiscount.toFixed(0)}` : "—"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.muted}>Shipping</Text>
            <Text style={styles.value}>
              {finalShipping === 0 ? "Free" : `₹${finalShipping.toFixed(0)}`}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.muted}>Estimated Tax ({Math.round(PRICING_CONFIG.taxRate * 100)}%)</Text>
            <Text style={styles.value}>₹{tax.toFixed(0)}</Text>
          </View>

          <Divider style={{ marginVertical: 8, opacity: 0.2 }} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{grandTotal.toFixed(0)}</Text>
          </View>
        </Surface>
      </ScrollView>

      {/* Sticky footer */}
      <LinearGradient
        colors={["#ffffff", "#f2f2f2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.footer}
      >
        <View style={styles.footerLeft}>
          <Text style={styles.footerSub}>Payable</Text>
          <Text style={styles.footerAmount}>₹{grandTotal.toFixed(0)}</Text>
        </View>
        <Button
          mode="contained"
          onPress={handlePay}
          style={styles.payNow}
          contentStyle={{ height: 50 }}
          icon="lock"
        >
          Pay Now
        </Button>
      </LinearGradient>

      <Snackbar
        visible={snack.visible}
        onDismiss={() => setSnack({ visible: false, msg: "" })}
        duration={2200}
      >
        {snack.msg}
      </Snackbar>
    </SafeAreaView>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f7f7f7" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  cardTitle: { fontWeight: "800", fontSize: 16, color: "#111" },
  reqChip: { marginLeft: "auto", backgroundColor: "#fff4e0" },
  radioRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  sep: { opacity: 0.08 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  muted: { color: "#666" },
  value: { color: "#111", fontWeight: "700" },
  totalLabel: { fontSize: 15, fontWeight: "800", color: "#111" },
  totalValue: { fontSize: 18, fontWeight: "900", color: "#111" },
  footer: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    padding: 12, flexDirection: "row", alignItems: "center", gap: 12,
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    elevation: 18, shadowColor: "#000", shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: -3 }, shadowRadius: 12, backgroundColor: "#fff",
  },
  footerLeft: { flex: 1 },
  footerSub: { color: "#777", fontSize: 12 },
  footerAmount: { color: "#111", fontWeight: "900", fontSize: 18, marginTop: 2 },
  payNow: { borderRadius: 12, minWidth: 170 },
});
