import React, { useState, useEffect } from "react";
import { Animated, Dimensions, Image, Pressable, StyleSheet, View, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "react-native-paper";
import { Asset } from "expo-asset";

const { width } = Dimensions.get("window");
const CARD_W = width; 
const CARD_H = Math.round(CARD_W * 0.45);

const BANNERS = [
  {
    id: "b1",
    image: require("../../../assets/img/products/product_2.jpeg"),
    title: "Seasonal Picks",
    sub: "Curated looks. Limited time.",
  },
  {
    id: "b2",
    image: require("../../../assets/img/banners/banner_2.avif"),
    title: "Work. Weekend.",
    sub: "Essentials for every day.",
  },
  {
    id: "b3",
    image: require("../../../assets/img/products/product_1.jpeg"),
    title: "Premium Cotton",
    sub: "Breezy. Durable. Soft.",
  },
];

const BannerCarousel = ({ bannerX }: { bannerX: Animated.Value }) => {

  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Preload bundled images for a smooth first render
    useEffect(() => {
      let mounted = true;
      const load = async () => {
        try {
          const assetModules = BANNERS.map((banner) => banner.image);
          await Asset.loadAsync(assetModules);
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
    }, []);

    // While assets load show a centered spinner (prevents flicker)
      if (!assetsLoaded) {
        return (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#2E4374" />
          </View>
        );
      }

  return (
    <Animated.FlatList
      data={BANNERS}
      keyExtractor={(i) => i.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      pagingEnabled
      snapToInterval={CARD_W} // still full screen snapping
      decelerationRate="fast"
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { x: bannerX } } }],
        { useNativeDriver: true }
      )}
      renderItem={({ item }) => (
        <Pressable style={{ width: CARD_W }}>
          <Animated.View style={styles.bannerCard}>
            <Image source={ item.image } style={styles.bannerImg} />
            <LinearGradient
              colors={["rgba(0,0,0,0.55)", "transparent"]}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.bannerTextWrap}>
              {!!item.title && <Text style={styles.bannerTitle}>{item.title}</Text>}
              {!!item.sub && <Text style={styles.bannerSub}>{item.sub}</Text>}
            </View>
          </Animated.View>
        </Pressable>
      )}
    />
  );
};

export default BannerCarousel;

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  bannerCard: {
    width: "92%",
    height: CARD_H,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
    // alignSelf: "center", // ✅ ensure it's centered inside full width container
  },
  bannerImg: { width: "100%", height: "100%", resizeMode: "cover" },
  bannerTextWrap: { position: "absolute", left: 16, bottom: 14 },
  bannerTitle: { color: "#fff", fontSize: 18, fontWeight: "800", letterSpacing: 0.2 },
  bannerSub: { color: "#fff", marginTop: 2 },
});
