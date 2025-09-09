import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Text, Appbar, useTheme, Button } from "react-native-paper";
import ProductCard from "../components/ProductCard";
import { useWishlist } from "../context/WishlistContext";

export default function WishlistScreen({ navigation }: any) {
  const { wishlist } = useWishlist();
  const theme = useTheme();

  const goToProduct = (product: any) => {
    // Product lives in HomeStack -> navigate via drawer route "Home"
    navigation.navigate("Home", {
      screen: "Product",
      params: { product },
    });
  };

  const goHome = () => {
    // Go to Home stack’s main screen
    navigation.navigate("Home", { screen: "HomeMain" });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Appbar.Header style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
        <Appbar.Content
          title="Wishlist"
          titleStyle={{ color: "#fff", fontWeight: "bold", fontSize: 20 }}
        />
      </Appbar.Header>

      {/* Wishlist Content */}
      {wishlist.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <Text style={styles.emptyText}>Your wishlist is empty.</Text>
          <Button mode="contained" style={{ marginTop: 12, borderRadius: 10 }} onPress={goHome}>
            Start shopping
          </Button>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={() => goToProduct(item)} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  header: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyWrapper: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  emptyText: { fontSize: 16, color: "#666", fontWeight: "500" },
  listContent: { padding: 16, paddingBottom: 32 },
  columnWrapper: { justifyContent: "space-between", marginBottom: 16 },
});
