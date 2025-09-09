import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Appbar, Button, Text, useTheme } from "react-native-paper";
import ConfettiCannon from "react-native-confetti-cannon";
import { Ionicons } from "@expo/vector-icons";

const OrderSuccessScreen: React.FC<any> = ({ route, navigation }) => {
    const { orderId, amount, itemsCount } = route.params || {};
    const theme = useTheme();
    const confetti = useRef<any>(null);

    return (
        <View style={styles.root}>
            <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
                <Appbar.Content
                    title="Order Placed"
                    titleStyle={{ color: "#fff", fontWeight: "800" }}
                />
            </Appbar.Header>

            <View style={styles.center}>
                <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
                <Text style={styles.title}>Thank you!</Text>
                <Text style={styles.sub}>Your order has been placed successfully.</Text>

                <Button
                    mode="contained"
                    style={{ marginTop: 18, borderRadius: 10 }}
                    onPress={() =>
                        navigation.navigate("Home", {
                            screen: "HomeMain",
                        })
                    }
                >
                    Continue Shopping
                </Button>

            </View>

            <ConfettiCannon
                count={120}
                origin={{ x: 0, y: 0 }}
                fadeOut
                autoStart
                ref={confetti}
            />
        </View>
    );
};

export default OrderSuccessScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#f7f7f7" },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
    title: { fontSize: 24, fontWeight: "900", marginTop: 10, color: "#111" },
    sub: { color: "#555", marginTop: 6, textAlign: "center" },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        marginTop: 16,
        width: "100%",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
    },
    row: { fontSize: 14, marginBottom: 6, color: "#111" },
    label: { color: "#666" },
    value: { fontWeight: "800", color: "#111" },
});
