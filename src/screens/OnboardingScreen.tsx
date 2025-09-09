// src/screens/OnboardingScreen.tsx
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Asset } from "expo-asset";
import { useAuth } from "../context/AuthContext";

const { width, height } = Dimensions.get("window");

// NOTE: require local assets so packager includes them.
// Adjust path if your assets are elsewhere.
const slides = [
  {
    id: "1",
    title: "Welcome to Imperial Thread",
    subtitle: "Discover premium clothing crafted for you.",
    image: require("../../assets/img/products/product_2.jpeg"),
  },
  {
    id: "2",
    title: "Modern Styles",
    subtitle: "Stay trendy with our latest collections.",
    image: require("../../assets/img/banners/banner_2.avif"),
  },
  {
    id: "3",
    title: "Comfort Redefined",
    subtitle: "Experience clothing that feels as good as it looks.",
    image: require("../../assets/img/products/product_1.jpeg"),
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const flatListRef = useRef<FlatList | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const auth = useAuth();

  // Preload bundled images for a smooth first render
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const assetModules = slides.map((s) => s.image);
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

  const onNext = () => {
    const nextIndex = Math.min(currentIndex + 1, slides.length - 1);
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setCurrentIndex(nextIndex);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / width);
    setCurrentIndex(idx);
  };

  const finishOnboarding = async () => {
    // Persist that user has completed onboarding (AuthContext.finishOnboarding writes onboardingSeen)
    await auth.finishOnboarding();
    // navigate to Login — Login is registered in the same root navigator
    navigation.replace("Login");
  };

  // While assets load show a centered spinner (prevents flicker)
  if (!assetsLoaded) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#2E4374" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <FlatList
        ref={(r) => (flatListRef.current = r)}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <View style={styles.slide}>
            {/* use the local image via require */}
            <Image source={item.image} style={styles.image} />
            <LinearGradient
              colors={["rgba(0,0,0,0.6)", "transparent"]}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>

              {index < slides.length - 1 ? (
                <Pressable
                  style={styles.button}
                  onPress={onNext}
                  android_ripple={{ color: "rgba(255,255,255,0.12)" }}
                >
                  <Text style={styles.buttonText}>Next</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={styles.button}
                  onPress={finishOnboarding}
                  android_ripple={{ color: "rgba(255,255,255,0.12)" }}
                >
                  <Text style={styles.buttonText}>Get Started</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      />

      {/* Page indicator */}
      <View style={styles.indicatorWrap}>
        {slides.map((s, i) => (
          <View
            key={s.id}
            style={[styles.indicator, i === currentIndex ? styles.indicatorActive : undefined]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  slide: { width, height, justifyContent: "flex-end" },
  image: { ...StyleSheet.absoluteFillObject, width, height, resizeMode: "cover" },
  textContainer: { padding: 24 },
  title: { fontSize: 28, fontWeight: "800", color: "#fff", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#eee", marginBottom: 20 },
  button: {
    backgroundColor: "#2E4374",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  indicatorWrap: {
    position: "absolute",
    bottom: 34,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  } as any,
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.28)",
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: "#fff",
    width: 18,
    borderRadius: 9,
  },
});
