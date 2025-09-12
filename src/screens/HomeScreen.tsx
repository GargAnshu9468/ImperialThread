// Native modules

import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useRef, useState } from "react";
import { View, Animated, StyleSheet } from "react-native";

// Custom components

import HeroHeader from "../components/home/HeroHeader";
import CartIconBadge from "../components/CartIconBadge";
import BannerCarousel from "../components/home/BannerCarousel";
import ActiveFiltersRow from "../components/home/ActiveFiltersRow";
import RecommendedCarousel from "../components/home/RecommendedCarousel";
import CategoriesAndToolbar from "../components/home/CategoriesAndToolbar";
import SortFilterSheet from "../components/home/SortFilterSheet";

// Data & Types

import type { Category, PriceKey } from "../types";
import { PRODUCTS } from "../data/products";
import { CATEGORIES } from "../data/categories";
import { PRICE_BUCKETS } from "../data/priceBuckets";

// Brand theme

const BRAND_ACCENT = "#2E4374";
const BRAND_GRADIENT = ["#2E4374", "#1E2749"];

const HomeScreen: React.FC<any> = ({ navigation }) => {

  {/* States */}

  const [query, setQuery] = useState("");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [category, setCategory] = useState<Category>("All");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sheetTab, setSheetTab] = useState<"sort" | "filter">("sort");
  const [selectedPriceKeys, setSelectedPriceKeys] = useState<PriceKey[]>([]);
  const [sortKey, setSortKey] = useState<"rel" | "plh" | "phl" | "name">("rel");

  {/* Animations */}

  const bannerX = useRef(new Animated.Value(0)).current;

  {/* Filtering + Sorting logic */}

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
        return [...list].sort((a, b) => a.price - b.price);

      case "phl":
        return [...list].sort((a, b) => b.price - a.price);

      case "name":
        return [...list].sort((a, b) => a.name.localeCompare(b.name));

      default:
        return list;
    }
  }, [query, category, selectedPriceKeys, selectedSizes, onlyInStock, sortKey]);

  {/* See all */}

  const handleSeeAll = () => {
    navigation.navigate("Products", { query, category, selectedPriceKeys, selectedSizes, onlyInStock, sortKey });
  };

  {/* Header */}

  const Header = (
    <LinearGradient
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      colors={BRAND_GRADIENT}
      style={styles.heroGradient}
    >
      <HeroHeader
        query={query}
        onQuery={setQuery}
        brand="Imperial Thread"
        onMenu={() => navigation.openDrawer()}
        right={<CartIconBadge color="#fff" onPress={() => navigation.navigate("Cart")} />}
      />
    </LinearGradient>
  );

  const ListHeader = (
    <View>

      {/* Banners */}

      <View style={styles.bannerWrap}>
        <BannerCarousel bannerX={bannerX} />
      </View>

      {/* Categories + Toolbar */}

      <CategoriesAndToolbar
        category={category}
        categories={CATEGORIES}
        gradient={BRAND_GRADIENT}
        setCategory={setCategory}
        onSort={() => setSheetTab("sort") || setSheetVisible(true)}
        onFilter={() => setSheetTab("filter") || setSheetVisible(true)}
      />

      {/* Active Filters */}

      <ActiveFiltersRow
        category={category}
        onlyInStock={onlyInStock}
        selectedSizes={selectedSizes}
        selectedPriceKeys={selectedPriceKeys}
        onClearAll={() => {
          setQuery("");
          setSortKey("rel");
          setCategory("All");
          setSelectedSizes([]);
          setOnlyInStock(false);
          setSelectedPriceKeys([]);
        }}
        onClearChip={(type, value) => {
          if (type === "category") setCategory("All");
          if (type === "price")
            setSelectedPriceKeys((arr) => arr.filter((k) => k !== value));
          if (type === "size")
            setSelectedSizes((arr) => arr.filter((s) => s !== value));
          if (type === "stock") setOnlyInStock(false);
        }}
      />

      {/* Recommended Products */}

      <RecommendedCarousel
        accentColor={BRAND_ACCENT}
        title="Recommended for you"
        onPressSeeAll={handleSeeAll}
        products={filtered.slice(0, 5)}
        onPressProduct={(product) => navigation.navigate("Product", { product })}
      />

    </View>
  );

  return (
    <View style={styles.container}>
      {Header}

      <Animated.ScrollView
        style={{ flex: 1 }}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: 176, paddingBottom: 90 }}
      >
        {ListHeader}
      </Animated.ScrollView>

      <SortFilterSheet
        allSizes={[]}
        tab={sheetTab}
        sortKey={sortKey}
        setTab={setSheetTab}
        visible={sheetVisible}
        setSortKey={setSortKey}
        onlyInStock={onlyInStock}
        selectedSizes={selectedSizes}
        setOnlyInStock={setOnlyInStock}
        setSelectedSizes={setSelectedSizes}
        selectedPriceKeys={selectedPriceKeys}
        onClose={() => setSheetVisible(false)}
        setSelectedPriceKeys={setSelectedPriceKeys}
      />

    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  heroGradient: {
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingBottom: 14,
    overflow: "hidden",
    position: "absolute",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  bannerWrap: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
});
