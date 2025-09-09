import React, { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Card, Text, Button } from "react-native-paper";
import { MotiView } from "moti";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useWishlist } from "../context/WishlistContext"; // import context
import { useNavigation } from "@react-navigation/native";
import { Asset } from "expo-asset";

export default function ProductCard({ product, onPress, delay = 0, onAddToCart }: any) {
    const [favorite, setFavorite] = useState(false);
    const [assetsLoaded, setAssetsLoaded] = useState(false);

    const image = product.variants?.[0]?.images?.[0];

    const { addToWishlist, removeFromWishlist, wishlist } = useWishlist();
    const navigation = useNavigation();

    const isFav = wishlist.some((p: { id: any; }) => p.id === product.id);

    // Preload bundled avatar so it shows instantly
      useEffect(() => {
        let mounted = true;
        const load = async () => {
          try {
            await Asset.loadAsync([image]);
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
      }, [image]);

    // While assets load show a centered spinner (prevents flicker)
          if (!assetsLoaded) {
            return (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color="#2E4374" />
              </View>
            );
          }

    return (
        // <View ></View>
        <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay }}
            style={{ backgroundColor: "#fff" }}
        >
            <Card style={styles.card} mode="elevated" onPress={onPress}>
                {/* Image + Wishlist */}
                <View style={styles.imageWrapper}>
                    {image && (
                        <Card.Cover
                            source={ image }
                            style={styles.image}
                            resizeMode="cover"
                        />
                    )}

                    {/* Wishlist Button */}
                    <TouchableOpacity
                        style={styles.wishlistBtn}
                        onPress={() => {
                            if (isFav) removeFromWishlist(product.id);
                            else addToWishlist(product);
                        }}
                    >
                        <Icon
                            name={isFav ? "heart" : "heart-outline"}
                            size={22}
                            color={isFav ? "#e63946" : "#fff"}
                        />
                    </TouchableOpacity>
                </View>

                <View style={{ backgroundColor: "#fff" }}>
                    {/* Product Info */}
                    <Card.Content style={styles.content}>
                        <Text variant="titleMedium" style={styles.title} numberOfLines={1}>
                            {product.name}
                        </Text>
                        <Text variant="titleSmall" style={styles.price}>
                            ₹{product.price}
                        </Text>
                    </Card.Content>
                </View>
            </Card>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
    card: {
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#fff",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        minHeight: 280,   // ✅ keeps uniform size but no clipping
    },
    imageWrapper: {
        position: "relative",
    },
    image: {
        height: 200,
        resizeMode: 'contain',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    wishlistBtn: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "rgba(0,0,0,0.45)",
        borderRadius: 20,
        padding: 6,
    },
    content: {
        paddingVertical: 12,
    },
    title: {
        fontWeight: "600",
        fontSize: 15,
        color: "#333",
        marginBottom: 2,
    },
    price: {
        fontWeight: "bold",
        fontSize: 14,
        color: "#2E4374",
        marginBottom: 0,
    },
});
