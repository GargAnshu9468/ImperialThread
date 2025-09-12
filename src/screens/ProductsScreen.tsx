// src/screens/ProductsScreen.tsx
import React, { useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import {
  Appbar,
  Text,
  useTheme,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { PRODUCTS } from "../data/products";
import { CATEGORIES } from "../data/categories";
import { PRICE_BUCKETS } from "../data/priceBuckets";
import type { Category, Product, PriceKey } from "../utils/types";

import ProductCard from "../components/ProductCard";
import CartIconBadge from "../components/CartIconBadge";
import CategoriesAndToolbar from "../components/home/CategoriesAndToolbar";
import ActiveFiltersRow from "../components/home/ActiveFiltersRow";
import SortFilterSheet from "../components/home/SortFilterSheet";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 24 - 12) / 2;

const ProductsScreen: React.FC<any> = ({ route, navigation }) => {
  const theme = useTheme();

  // initial params (from HomeScreen "See all")
  const initialCategory: Category = route.params?.category ?? "All";
  const initialQuery: string = route.params?.query ?? "";

  // State
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<Category>(initialCategory);
  const [sortKey, setSortKey] = useState<"rel" | "plh" | "phl" | "name">(
    route.params?.sortKey ?? "rel"
  );
  const [onlyInStock, setOnlyInStock] = useState(route.params?.onlyInStock ?? false);
  const [selectedPriceKeys, setSelectedPriceKeys] = useState<PriceKey[]>(route.params?.selectedPriceKeys ?? []);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(route.params?.selectedSizes ?? []);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetTab, setSheetTab] = useState<"sort" | "filter">("sort");

  const listRef = useRef<Animated.FlatList<any>>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Filtered + sorted products
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = PRODUCTS.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (q === "" ||
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q))
    );

    if (selectedPriceKeys.length) {
      list = list.filter((p) =>
        selectedPriceKeys.some((k) =>
          PRICE_BUCKETS.find((b) => b.key === k)?.isIn(p.price)
        )
      );
    }

    if (selectedSizes.length) {
      list = list.filter((p) => {
        const sizes = p.sizes || [];
        return selectedSizes.some((s) => sizes.includes(s));
      });
    }

    if (onlyInStock) {
      list = list.filter((p) =>
        p.variants?.some((v) =>
          Object.values(v.stockBySize || {}).some((n) => (n as number) > 0)
        )
      );
    }

    switch (sortKey) {
      case "plh":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "phl":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "name":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return list;
  }, [query, category, selectedPriceKeys, selectedSizes, onlyInStock, sortKey]);

  const clearAllFilters = () => {
    setCategory("All");
    setSelectedPriceKeys([]);
    setSelectedSizes([]);
    setOnlyInStock(false);
    setSortKey("rel");
    setQuery("");
  };

  return (
    <View style={styles.container}>
      {/* Appbar */}
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
        <Appbar.Content
          title="All Products"
          titleStyle={{ color: "#fff", fontWeight: "700" }}
        />
        <CartIconBadge color="#fff" onPress={() => navigation.navigate("Cart")} />
      </Appbar.Header>

      {/* Toolbar (categories + sort/filter) */}
      <CategoriesAndToolbar
        categories={CATEGORIES}
        category={category}
        setCategory={(c) => {
          setCategory(c);
          listRef.current?.scrollToOffset({ offset: 0, animated: true });
        }}
        onSort={() => (setSheetTab("sort"), setSheetVisible(true))}
        onFilter={() => (setSheetTab("filter"), setSheetVisible(true))}
        gradient={["#2E4374", "#1E2749"]}
      />

      {/* Active filters row */}
      <ActiveFiltersRow
        category={category}
        selectedPriceKeys={selectedPriceKeys}
        selectedSizes={selectedSizes}
        onlyInStock={onlyInStock}
        onClearChip={(type, value) => {
          if (type === "category") setCategory("All");
          if (type === "price")
            setSelectedPriceKeys((arr) => arr.filter((k) => k !== value));
          if (type === "size")
            setSelectedSizes((arr) => arr.filter((s) => s !== value));
          if (type === "stock") setOnlyInStock(false);
        }}
        onClearAll={clearAllFilters}
      />

      {/* Product Grid */}
      <Animated.FlatList
        ref={listRef}
        data={filtered}
        keyExtractor={(i: Product) => i.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 24, paddingBottom: 90 }}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
        renderItem={({ item, index }) => (
          <Animated.View
            style={[
              styles.cardSlot,
              {
                transform: [
                  {
                    scale: scrollY.interpolate({
                      inputRange: [0, 60 + index * 40],
                      outputRange: [1, 0.98],
                      extrapolate: "clamp",
                    }),
                  },
                ],
                opacity: scrollY.interpolate({
                  inputRange: [0, 90 + index * 40],
                  outputRange: [1, 0.92],
                  extrapolate: "clamp",
                }),
              },
            ]}
          >
            <ProductCard
              product={item}
              onPress={() => navigation.navigate("Product", { product: item })}
            />
          </Animated.View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyWrap}>
            <Icon name="text-search" size={28} color="#9aa0a6" />
            <Text style={styles.emptyText}>No products match your filters</Text>
          </View>
        )}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      />

      {/* Sort & Filter bottom sheet */}
      <SortFilterSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        tab={sheetTab}
        setTab={setSheetTab}
        sortKey={sortKey}
        setSortKey={setSortKey}
        onlyInStock={onlyInStock}
        setOnlyInStock={setOnlyInStock}
        selectedPriceKeys={selectedPriceKeys}
        setSelectedPriceKeys={setSelectedPriceKeys}
        allSizes={Array.from(new Set(PRODUCTS.flatMap((p) => p.sizes || [])))}
        selectedSizes={selectedSizes}
        setSelectedSizes={setSelectedSizes}
      />
    </View>
  );
};

export default ProductsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  cardSlot: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  emptyWrap: { alignItems: "center", padding: 40 },
  emptyText: { color: "#666", marginTop: 8, fontWeight: "600" },
});
