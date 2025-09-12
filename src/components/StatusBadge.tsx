import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { OrderStatus } from "../utils/types";
import { Text } from "react-native-paper";
import React from "react";

export default function StatusBadge({ s }: { s: OrderStatus }) {
  const map: Record<OrderStatus, { bg: string; fg: string; icon: any }> = {
    Processing: { bg: "#FFF4E5", fg: "#C76A00", icon: "time-outline" },
    Shipped: { bg: "#E9F5FF", fg: "#1273EB", icon: "cube-outline" },
    Delivered: { bg: "#EAF8EF", fg: "#228B22", icon: "checkmark-done-outline" },
    Cancelled: { bg: "#FDECEE", fg: "#D7263D", icon: "close-circle-outline" },
    "Out for delivery": { bg: "#FFF7E6", fg: "#D97706", icon: "bicycle-outline" }
  };

  const c = map[s];

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Ionicons name={c.icon} size={14} color={c.fg} />
      <Text style={[styles.badgeText, { color: c.fg }]}>{s}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 6,
  },
  badgeText: {
    fontWeight: "700",
    fontSize: 12,
  },
});
