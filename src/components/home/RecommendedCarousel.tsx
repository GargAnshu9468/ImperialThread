import React from "react";
import { View, FlatList, Dimensions, StyleSheet, Pressable } from "react-native";
import { Text } from "react-native-paper";
import ProductCard from "../ProductCard";
import type { Product } from "../../types";
import { RecommendedCarouselProps } from "../../interfaces";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.55;
const SPACING = 16;

const RecommendedCarousel: React.FC<RecommendedCarouselProps> = ({
    title,
    products,
    onPressSeeAll,
    onPressProduct,
    accentColor = "#2E4374",
}) => {
    return (
        <View>
            {/* Section header */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <Pressable onPress={onPressSeeAll} hitSlop={8}>
                    <Text style={[styles.sectionAction, { color: accentColor }]}>See all</Text>
                </Pressable>
            </View>

            {/* Horizontal product list */}
            <FlatList
                style={{ height: 320 }}
                data={products}
                keyExtractor={(item: Product) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: SPACING }}
                ItemSeparatorComponent={() => <View style={{ width: SPACING }} />}
                renderItem={({ item }) => (
                    <View style={{ width: CARD_WIDTH }}>
                        <ProductCard product={item} onPress={() => onPressProduct(item)} />
                    </View>
                )}
            />
        </View>
    );
};

export default RecommendedCarousel;

const styles = StyleSheet.create({
    sectionHeader: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 8,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
    },
    sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111" },
    sectionAction: { fontWeight: "700" },
});
