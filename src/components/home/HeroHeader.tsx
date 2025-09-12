import React from "react";
import { View, StyleSheet } from "react-native";
import { Appbar, Searchbar, Text } from "react-native-paper";
import type { HeroHeaderProps } from "../../types";

const HeroHeader: React.FC<HeroHeaderProps> = ({ brand, query, onQuery, onMenu, right }) => {
    return (
        <>
            <Appbar.Header style={styles.header}>
                <Appbar.Action icon="menu" color="#fff" onPress={onMenu} />
                <Text numberOfLines={1} style={styles.brand}>{brand}</Text>
                {right}
            </Appbar.Header>

            <View style={styles.searchWrap}>
                <Searchbar
                    placeholder="Search shirts, tees, polos…"
                    value={query}
                    onChangeText={onQuery}
                    style={styles.searchbar}
                    inputStyle={{ fontSize: 14 }}
                />
            </View>
        </>
    );
};

export default HeroHeader;

const styles = StyleSheet.create({
    header: { backgroundColor: "transparent", elevation: 0 },
    brand: { flex: 1, textAlign: "center", color: "#fff", fontSize: 18, fontWeight: "800", letterSpacing: 0.5 },
    searchWrap: { marginHorizontal: 14, marginTop: -8, marginBottom: 6 },
    searchbar: { borderRadius: 28, backgroundColor: "rgba(255,255,255,0.92)", elevation: 5 },
});
