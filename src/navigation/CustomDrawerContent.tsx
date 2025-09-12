// src/navigation/CustomDrawerContent.tsx
import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  Platform,
  Linking,
  ActivityIndicator,
} from "react-native";
import {
  Text,
  useTheme,
  Switch,
  Divider,
  Badge,
  TouchableRipple,
} from "react-native-paper";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { Asset } from "expo-asset";
import { CustomDrawerContentProps } from "../types";

export default function CustomDrawerContent({
  navigation,
  onToggleTheme,
  isDark,
}: CustomDrawerContentProps) {
  const theme = useTheme();
  const { items } = useCart();
  const { wishlist } = useWishlist();
  const auth = useAuth();

  const cartCount = items.length;
  const wishlistCount = wishlist?.length || 0;

  // Static user profile for now
  const user = useMemo(
    () => ({
      name: "Hello, Anshu",
      avatar: require("../../assets/img/profile.png"),
    }),
    []
  );

  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Preload bundled avatar so it shows instantly
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        await Asset.loadAsync([user.avatar]);
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
  }, [user.avatar]);

  const go = (route: string, params?: any) => {
    navigation.closeDrawer();
    navigation.navigate(route as never, params as never);
  };

  const DrawerItemRow = ({
    icon,
    label,
    onPress,
    badge,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    badge?: number | string;
  }) => (
    <TouchableRipple onPress={onPress} rippleColor="rgba(0,0,0,0.08)">
      <View style={styles.row}>
        <Ionicons
          name={icon}
          size={22}
          color={theme.colors.primary}
          style={{ width: 28 }}
        />
        <Text style={styles.rowText}>{label}</Text>
        {!!badge && (
          <Badge style={{ marginLeft: "auto" }} size={20}>
            {badge}
          </Badge>
        )}
      </View>
    </TouchableRipple>
  );

  const handleLogout = async () => {
    await auth.logout();
    navigation.closeDrawer();
    navigation.replace("Login");
  };

  if (!assetsLoaded) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#2E4374" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* HERO HEADER */}
      <LinearGradient
        colors={["#1E2749", "#2E4374"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroUser}>
          <Image source={user.avatar} style={styles.avatar} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.hello}>{user.name}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* SCROLLABLE CONTENT */}
      <DrawerContentScrollView
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
      >
        {/* Shop */}
        <Text style={styles.sectionTitle}>Shop</Text>
        <View style={styles.card}>
          <DrawerItemRow icon="home-outline" label="Home" onPress={() => go("Home")} />
          <Divider />
          <DrawerItemRow
            icon="heart-outline"
            label="Wishlist"
            onPress={() => go("Wishlist")}
            badge={wishlistCount || undefined}
          />
          <Divider />
          <DrawerItemRow
            icon="cart-outline"
            label="Cart"
            onPress={() => go("Cart")}
            badge={cartCount || undefined}
          />
          <Divider />
          <DrawerItemRow
            icon="cube-outline"
            label="Orders"
            onPress={() => go("Orders")}
          />
        </View>

        {/* Support */}
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.card}>
          <DrawerItemRow
            icon="chatbubbles-outline"
            label="Help & Support"
            onPress={() => Linking.openURL("mailto:support@imperialthread.com")}
          />
          <Divider />
          <DrawerItemRow
            icon="information-circle-outline"
            label="About Imperial Thread"
            onPress={() => Linking.openURL("https://example.com/about")}
          />
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <View style={[styles.row, { alignItems: "center" }]}>
            <Ionicons
              name="moon-outline"
              size={22}
              color={theme.colors.primary}
              style={{ width: 28 }}
            />
            <Text style={styles.rowText}>Dark Mode</Text>
            <Switch
              style={{ marginLeft: "auto" }}
              value={!!isDark}
              onValueChange={onToggleTheme}
            />
          </View>
        </View>

        {/* Sign out */}
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#e74c3c" />
          <Text style={styles.logoutText}>Sign out</Text>
        </Pressable>
      </DrawerContentScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  hero: {
    paddingTop: Platform.select({ ios: 18, android: 18 }),
    paddingBottom: 16,
  },
  heroUser: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 24,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  hello: { color: "#fff", fontWeight: "700", fontSize: 16, marginBottom: 6 },
  sectionTitle: {
    fontWeight: "800",
    color: "#222",
    fontSize: 13,
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  card: {
    marginHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  rowText: { marginLeft: 8, color: "#222", fontWeight: "600", fontSize: 14 },
  logoutBtn: {
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  logoutText: { color: "#e74c3c", fontWeight: "800", marginLeft: 8 },
});
