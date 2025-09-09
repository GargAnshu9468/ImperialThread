import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Chip, Text } from "react-native-paper";
import { PRICE_BUCKETS, PriceKey } from "./SortFilterSheet";
import type { Category } from "../../types";

type Props = {
    category: Category;
    selectedPriceKeys: PriceKey[];
    selectedSizes: string[];
    onlyInStock: boolean;
    onClearChip: (type: "category" | "price" | "size" | "stock", value?: any) => void;
    onClearAll: () => void;
};

const ActiveFiltersRow: React.FC<Props> = ({
    category,
    selectedPriceKeys,
    selectedSizes,
    onlyInStock,
    onClearChip,
    onClearAll,
}) => {
    const hasFilters =
        (category !== "All") ||
        selectedPriceKeys.length > 0 ||
        selectedSizes.length > 0 ||
        onlyInStock;

    if (!hasFilters) return null;

    return (
        <View style={styles.activeChipsRow}>
            {category !== "All" && (
                <Chip icon="tag" onClose={() => onClearChip("category")} style={styles.activeChip}>
                    {category}
                </Chip>
            )}

            {selectedPriceKeys.map((k) => {
                const label = PRICE_BUCKETS.find((b) => b.key === k)?.label || "Price";
                return (
                    <Chip key={k} icon="cash" onClose={() => onClearChip("price", k)} style={styles.activeChip}>
                        {label}
                    </Chip>
                );
            })}

            {selectedSizes.map((s) => (
                <Chip key={s} icon="ruler" onClose={() => onClearChip("size", s)} style={styles.activeChip}>
                    {s}
                </Chip>
            ))}

            {onlyInStock && (
                <Chip icon="check" onClose={() => onClearChip("stock")} style={styles.activeChip}>
                    In stock
                </Chip>
            )}

            <Pressable onPress={onClearAll} style={styles.clearAllBtn}>
                <Text style={styles.clearAllText}>Clear all</Text>
            </Pressable>
        </View>
    );
};

export default ActiveFiltersRow;

const styles = StyleSheet.create({
    activeChipsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    activeChip: {
        backgroundColor: "#fff",
        borderColor: "rgba(0,0,0,0.08)",
    },
    clearAllBtn: { paddingHorizontal: 8, paddingVertical: 6 },
    clearAllText: { color: "#ff5a5f", fontWeight: "700" },
});
