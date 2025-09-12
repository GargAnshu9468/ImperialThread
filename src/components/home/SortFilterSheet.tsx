import React from "react";
import type { SortFilterSheetProps } from "../../utils/types";
import { PRICE_BUCKETS } from "../../data/priceBuckets";
import { View, StyleSheet, Pressable, Animated } from "react-native";
import { Button, Checkbox, Divider, RadioButton, Text, Portal } from "react-native-paper";

const SortFilterSheet: React.FC<SortFilterSheetProps> = ({
    visible,
    onClose,
    tab,
    setTab,
    sortKey,
    setSortKey,
    onlyInStock,
    setOnlyInStock,
    selectedPriceKeys,
    setSelectedPriceKeys,
    allSizes,
    selectedSizes,
    setSelectedSizes,
}) => {
    const sheetY = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(sheetY, {
            toValue: visible ? 1 : 0,
            duration: visible ? 240 : 200,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    if (!visible) return null;

    return (
        <Portal>
            <Pressable style={styles.scrim} onPress={onClose} />

            <Animated.View
                style={[
                    styles.sheet,
                    {
                        transform: [
                            { translateY: sheetY.interpolate({ inputRange: [0, 1], outputRange: [360, 0] }) },
                        ],
                    },
                ]}
            >
                {/* Tabs */}
                <View style={styles.sheetTabs}>
                    <Pressable onPress={() => setTab("sort")} style={styles.tabBtn}>
                        <Text style={[styles.tabText, tab === "sort" && styles.tabTextActive]}>Sort</Text>
                        {tab === "sort" && <View style={styles.tabUnderline} />}
                    </Pressable>
                    <Pressable onPress={() => setTab("filter")} style={styles.tabBtn}>
                        <Text style={[styles.tabText, tab === "filter" && styles.tabTextActive]}>Filter</Text>
                        {tab === "filter" && <View style={styles.tabUnderline} />}
                    </Pressable>
                </View>

                <Divider />

                {tab === "sort" ? (
                    <View style={{ padding: 16 }}>
                        <RadioButton.Group onValueChange={(v) => setSortKey(v as any)} value={sortKey}>
                            <RowRadio value="rel" label="Relevance" />
                            <RowRadio value="plh" label="Price: Low to High" />
                            <RowRadio value="phl" label="Price: High to Low" />
                            <RowRadio value="name" label="Name: A–Z" />
                        </RadioButton.Group>
                    </View>
                ) : (
                    <View style={{ padding: 16 }}>
                        {/* Stock */}
                        <RowCheck
                            checked={onlyInStock}
                            onToggle={() => setOnlyInStock((s) => !s)}
                            label="Only show in-stock items"
                        />

                        {/* Price */}
                        <Text style={styles.groupTitle}>Price</Text>
                        {PRICE_BUCKETS.map((b) => {
                            const checked = selectedPriceKeys.includes(b.key);
                            return (
                                <RowCheck
                                    key={b.key}
                                    checked={checked}
                                    label={b.label}
                                    onToggle={() =>
                                        setSelectedPriceKeys((prev) =>
                                            checked ? prev.filter((k) => k !== b.key) : [...prev, b.key]
                                        )
                                    }
                                />
                            );
                        })}

                        {/* Sizes */}
                        {!!allSizes.length && (
                            <>
                                <Text style={[styles.groupTitle, { marginTop: 8 }]}>Sizes</Text>
                                <View style={styles.sizesWrap}>
                                    {allSizes.map((s) => {
                                        const on = selectedSizes.includes(s);
                                        return (
                                            <Pressable
                                                key={s}
                                                onPress={() =>
                                                    setSelectedSizes((prev) =>
                                                        on ? prev.filter((x) => x !== s) : [...prev, s]
                                                    )
                                                }
                                                style={[styles.sizeChip, on && styles.sizeChipOn]}
                                            >
                                                <Text style={[styles.sizeText, on && styles.sizeTextOn]}>{s}</Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </>
                        )}
                    </View>
                )}

                <View style={{ padding: 16, flexDirection: "row", gap: 10 }}>
                    <Button
                        mode="outlined"
                        style={{ flex: 1 }}
                        onPress={() => {
                            setSelectedPriceKeys([]);
                            setSelectedSizes([]);
                            setOnlyInStock(false);
                            setSortKey("rel");
                        }}
                    >
                        Reset
                    </Button>
                    <Button mode="contained" style={{ flex: 1 }} onPress={onClose}>
                        Apply
                    </Button>
                </View>
            </Animated.View>
        </Portal>
    );
};

export default SortFilterSheet;

const RowRadio = ({ value, label }: { value: string; label: string }) => (
    <View style={styles.radioRow}>
        <RadioButton value={value} />
        <Text style={{ fontSize: 15 }}>{label}</Text>
    </View>
);

const RowCheck = ({
    checked,
    onToggle,
    label,
}: {
    checked: boolean;
    onToggle: () => void;
    label: string;
}) => (
    <Pressable onPress={onToggle} style={styles.checkRow}>
        <Checkbox status={checked ? "checked" : "unchecked"} />
        <Text style={{ fontSize: 14 }}>{label}</Text>
    </Pressable>
);

const styles = StyleSheet.create({
    scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)" },
    sheet: {
        position: "absolute",
        left: 0, right: 0, bottom: 0,
        backgroundColor: "#fff",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        elevation: 8,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 12,
    },
    sheetTabs: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 24,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
    },
    tabBtn: { paddingVertical: 4 },
    tabText: { fontSize: 16, color: "#888", fontWeight: "700" },
    tabTextActive: { color: "#111" },
    tabUnderline: { height: 3, backgroundColor: "#2E4374", borderRadius: 2, marginTop: 6 },

    radioRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
    checkRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
    groupTitle: { marginTop: 10, marginBottom: 6, fontWeight: "800", color: "#111" },

    sizesWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
    sizeChip: {
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: "#f4f4f6",
    },
    sizeChipOn: { backgroundColor: "rgba(0,0,0,0.08)" },
    sizeText: { fontWeight: "700", color: "#333" },
    sizeTextOn: { color: "#111" },
});
