import React from "react";
import { FlatList, View, StyleSheet, Pressable } from "react-native";
import { Chip, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import type { CategoriesAndToolbarProps } from "../../types";

const CategoriesAndToolbar: React.FC<CategoriesAndToolbarProps> = ({
    categories,
    category,
    setCategory,
    onSort,
    onFilter,
    gradient,
}) => {
    return (
        <View>
            <FlatList
                data={categories}
                keyExtractor={(i) => i.label}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.catRow}
                renderItem={({ item }) => {
                    const selected = item.label === category;
                    const baseChip = (
                        <Chip
                            key={item.label}
                            selected={selected}
                            onPress={() => setCategory(item.label)}
                            mode="outlined"
                            style={[
                                styles.catChip,
                                selected && { backgroundColor: "transparent", borderColor: "transparent" },
                            ]}
                            textStyle={{ color: selected ? "#fff" : "#222", fontWeight: "700" }}
                            icon={() => (
                                <Icon name={item.icon} size={18} color={selected ? "#fff" : "#666"} />
                            )}
                        >
                            {item.label}
                        </Chip>
                    );

                    return selected ? (
                        <LinearGradient
                            key={item.label}
                            colors={gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.catChipGrad}
                        >
                            {baseChip}
                        </LinearGradient>
                    ) : (
                        baseChip
                    );
                }}
            />

            <View style={styles.toolbar}>
                <Pressable style={styles.toolbarBtn} onPress={onSort}>
                    <Icon name="sort" size={18} color="#222" />
                    <Text style={styles.toolbarText}>Sort</Text>
                </Pressable>
                <View style={styles.toolbarDivider} />
                <Pressable style={styles.toolbarBtn} onPress={onFilter}>
                    <Icon name="filter-variant" size={18} color="#222" />
                    <Text style={styles.toolbarText}>Filter</Text>
                </Pressable>
            </View>
        </View>
    );
};

export default CategoriesAndToolbar;

const styles = StyleSheet.create({
    catRow: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6 },
    catChip: {
        marginRight: 10,
        borderRadius: 20,
        backgroundColor: "#fff",
        borderColor: "rgba(0,0,0,0.08)",
    },
    catChipGrad: { borderRadius: 20, padding: 1, marginRight: 10 },
    toolbar: {
        marginTop: 6,
        marginHorizontal: 12,
        height: 40,
        borderRadius: 10,
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
    },
    toolbarBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 8 },
    toolbarText: { fontWeight: "700", color: "#222" },
    toolbarDivider: { width: 1, height: 18, backgroundColor: "rgba(0,0,0,0.08)", marginHorizontal: 6 },
});
