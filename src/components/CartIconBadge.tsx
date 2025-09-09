import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native-paper";
import { useCart } from "../context/CartContext";

type Props = { color?: string; onPress?: () => void };

export default function CartIconBadge({ color = "#fff", onPress }: Props) {
    const { items } = useCart();
    return (
        <View style={{ marginRight: 8 }}>
            <Ionicons name="cart-outline" size={22} color={color} onPress={onPress} />
            {items.length > 0 && (
                <View
                    style={{
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
                    }}
                >
                    <Text style={{ color: "#fff", fontWeight: "800", fontSize: 11 }}>
                        {items.length}
                    </Text>
                </View>
            )}
        </View>
    );
}
