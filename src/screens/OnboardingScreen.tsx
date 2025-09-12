// src/screens/OnboardingScreen.tsx
import React, { useRef, useState, useEffect, useCallback } from "react";
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
  Animated,
  Platform,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Asset } from "expo-asset";
import { useAuth } from "../context/AuthContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { SLIDES } from "../data/slides";

const { width, height } = Dimensions.get("window");
const PARALLAX_FACTOR = 0.7;
const INDICATOR_WIDTH = 30;

// Animated particle component for background effect
const AnimatedParticle = ({ delay }: { delay: number }) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const translateX = useRef(new Animated.Value(Math.random() * width)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(height);
      translateX.setValue(Math.random() * width);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -50,
          duration: 15000 + Math.random() * 10000,
          delay,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 2000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 2000,
            delay: 11000,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animate());
    };

    animate();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          transform: [{ translateY }, { translateX }],
          opacity,
        },
      ]}
    />
  );
};

export default function OnboardingScreen({ navigation }: any) {
  const flatListRef = useRef<FlatList | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const auth = useAuth();

  // Animation values
  const scrollX = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const buttonRotate = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(50)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const statsScale = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;

  // Preload assets
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const assetModules = SLIDES.map((s) => s.image);
        await Asset.loadAsync(assetModules);
      } catch (e) {
        console.warn("Asset preload failed", e);
      } finally {
        if (mounted) {
          setAssetsLoaded(true);
          // Animate entrance
          Animated.parallel([
            Animated.spring(titleTranslateY, {
              toValue: 0,
              tension: 20,
              friction: 7,
              useNativeDriver: true,
            }),
            Animated.timing(titleOpacity, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.spring(statsScale, {
              toValue: 1,
              tension: 20,
              friction: 7,
              delay: 300,
              useNativeDriver: true,
            }),
          ]).start();

          // Glow pulse animation
          Animated.loop(
            Animated.sequence([
              Animated.timing(glowOpacity, {
                toValue: 0.8,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(glowOpacity, {
                toValue: 0.3,
                duration: 2000,
                useNativeDriver: true,
              }),
            ])
          ).start();
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Button press animation
  const animateButtonPress = useCallback(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(buttonRotate, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(buttonRotate, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [buttonScale, buttonRotate]);

  const onNext = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    animateButtonPress();
    const nextIndex = Math.min(currentIndex + 1, SLIDES.length - 1);
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setCurrentIndex(nextIndex);
  };

  const onSkip = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const lastIndex = SLIDES.length - 1;
    flatListRef.current?.scrollToIndex({ index: lastIndex, animated: true });
    setCurrentIndex(lastIndex);
  };

  const finishOnboarding = async () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    animateButtonPress();
    await auth.finishOnboarding();
    navigation.replace("Login");
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = e.nativeEvent.contentOffset.x;
        const idx = Math.round(x / width);
        setCurrentIndex(idx);
      },
    }
  );

  if (!assetsLoaded) {
    return (
      <View style={styles.loadingWrap}>
        <LinearGradient
          colors={["#1a1a2e", "#0f3460"]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContent}>
          <MaterialCommunityIcons
            name="diamond-stone"
            size={60}
            color="#e94560"
            style={styles.loadingIcon}
          />
          <ActivityIndicator size="large" color="#e94560" />
          <Text style={styles.loadingText}>Imperial Thread</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated particles background */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {[...Array(5)].map((_, i) => (
          <AnimatedParticle key={i} delay={i * 2000} />
        ))}
      </View>

      {/* Skip button */}
      {currentIndex < SLIDES.length - 1 && (
        <Pressable style={styles.skipButton} onPress={onSkip}>
          <BlurView intensity={80} tint="dark" style={styles.skipBlur}>
            <Text style={styles.skipText}>Skip</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </BlurView>
        </Pressable>
      )}

      <Animated.FlatList
        ref={(r) => (flatListRef.current = r)}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const imageTranslateX = scrollX.interpolate({
            inputRange,
            outputRange: [-width * PARALLAX_FACTOR, 0, width * PARALLAX_FACTOR],
          });

          const imageScale = scrollX.interpolate({
            inputRange,
            outputRange: [1.3, 1, 1.3],
          });

          const contentOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
          });

          const contentTranslateY = scrollX.interpolate({
            inputRange,
            outputRange: [100, 0, -100],
          });

          return (
            <View style={styles.slide}>
              {/* Parallax Image */}
              <Animated.View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    transform: [
                      { translateX: imageTranslateX },
                      { scale: imageScale },
                    ],
                  },
                ]}
              >
                <Image source={item.image} style={styles.image} />
              </Animated.View>

              {/* Gradient Overlay */}
              <LinearGradient
                colors={[...item.gradientColors, "transparent"]}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
                locations={[0, 0.3, 0.6, 1]}
              />

              {/* Animated Glow Effect */}
              <Animated.View
                style={[
                  styles.glowEffect,
                  {
                    backgroundColor: item.accentColor,
                    opacity: glowOpacity,
                  },
                ]}
              />

              {/* Content Container */}
              <Animated.View
                style={[
                  styles.textContainer,
                  {
                    opacity: contentOpacity,
                    transform: [{ translateY: contentTranslateY }],
                  },
                ]}
              >
                {/* Icon with glassmorphism */}
                <View style={styles.iconContainer}>
                  <BlurView intensity={30} tint="light" style={styles.iconBlur}>
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={40}
                      color={item.accentColor}
                    />
                  </BlurView>
                </View>

                {/* Title */}
                <Animated.Text
                  style={[
                    styles.title,
                    {
                      transform: [{ translateY: titleTranslateY }],
                      opacity: titleOpacity,
                    },
                  ]}
                >
                  {item.title}
                </Animated.Text>

                {/* Subtitle */}
                <Text style={styles.subtitle}>{item.subtitle}</Text>

                {/* Stats Card */}
                <Animated.View
                  style={[
                    styles.statsCard,
                    {
                      transform: [{ scale: statsScale }],
                    },
                  ]}
                >
                  <BlurView intensity={20} tint="dark" style={styles.statsBlur}>
                    <Text style={styles.statsValue}>{item.stats.value}</Text>
                    <Text style={styles.statsLabel}>{item.stats.label}</Text>
                  </BlurView>
                </Animated.View>

                {/* CTA Button */}
                {index < SLIDES.length - 1 ? (
                  <Pressable onPress={onNext}>
                    <Animated.View
                      style={[
                        styles.button,
                        {
                          backgroundColor: item.accentColor,
                          transform: [
                            { scale: buttonScale },
                            {
                              rotate: buttonRotate.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["0deg", "360deg"],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={[item.accentColor, item.accentColor + "dd"]}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.buttonText}>Continue</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                      </LinearGradient>
                    </Animated.View>
                  </Pressable>
                ) : (
                  <Pressable onPress={finishOnboarding}>
                    <Animated.View
                      style={[
                        styles.button,
                        {
                          backgroundColor: item.accentColor,
                          transform: [
                            { scale: buttonScale },
                            {
                              rotate: buttonRotate.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["0deg", "360deg"],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={[item.accentColor, item.accentColor + "dd"]}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.buttonText}>Start Shopping</Text>
                        <Ionicons name="sparkles" size={20} color="#fff" />
                      </LinearGradient>
                    </Animated.View>
                  </Pressable>
                )}
              </Animated.View>
            </View>
          );
        }}
      />

      {/* Custom Page Indicator */}
      <View style={styles.indicatorWrap}>
        {SLIDES.map((s, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          
          const indicatorWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, INDICATOR_WIDTH, 8],
            extrapolate: "clamp",
          });

          const indicatorOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={s.id}
              style={[
                styles.indicator,
                {
                  width: indicatorWidth,
                  opacity: indicatorOpacity,
                  backgroundColor: i === currentIndex ? s.accentColor : "#fff",
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingIcon: {
    marginBottom: 20,
  },
  loadingText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
    letterSpacing: 2,
  },
  slide: {
    width,
    height,
    justifyContent: "flex-end",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: width * 1.3,
    height,
    resizeMode: "cover",
  },
  glowEffect: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.3,
    opacity: 0.3,
    transform: [{ scaleY: 2 }],
  },
  textContainer: {
    padding: 30,
    paddingBottom: 50,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconBlur: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 15,
    letterSpacing: -1,
    lineHeight: 48,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 30,
    lineHeight: 24,
    fontWeight: "400",
    letterSpacing: 0.5,
  },
  statsCard: {
    marginBottom: 30,
  },
  statsBlur: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignSelf: "flex-start",
  },
  statsValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -1,
  },
  statsLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  button: {
    borderRadius: 30,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  skipButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    right: 20,
    zIndex: 10,
  },
  skipBlur: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  skipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  indicatorWrap: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 40 : 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  indicator: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  particle: {
    position: "absolute",
    width: 3,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1.5,
  },
});
