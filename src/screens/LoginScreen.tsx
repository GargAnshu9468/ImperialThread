import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  View,
  Dimensions,
  Animated,
  Alert,
} from "react-native";
import { TextInput, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MotiView, MotiText, AnimatePresence } from "moti";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Easing } from "react-native-reanimated";
import MaskedView from "@react-native-masked-view/masked-view";

const { width, height } = Dimensions.get("window");

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const auth = useAuth();

  // Animation refs
  const floatingAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnimation, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnimation, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shimmer animation
    Animated.loop(
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    await auth.login();
    setTimeout(() => {
      setIsLoading(false);
      navigation.replace("MainApp");
    }, 1500);
  };

  const handleGoogleSignIn = () => {
    console.log("Google Sign-in pressed");
  };

  const resetAppState = async () => {
    try {
      await AsyncStorage.removeItem("onboardingSeen");
      await AsyncStorage.removeItem("isLoggedIn");
      Alert.alert("Dev", "Reset complete. Restarting to Onboarding.");
      navigation.reset({
        index: 0,
        routes: [{ name: "Onboarding" }],
      });
    } catch (e) {
      console.warn("Reset app state failed", e);
    }
  };

  const translateY = floatingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  return (
    <ImageBackground
      source={require("../../assets/img/banners/banner_2.avif")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* Animated gradient overlay */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1000 }}
        style={StyleSheet.absoluteFillObject}
      >
        <LinearGradient
          colors={[
            "rgba(15,23,42,0.95)",
            "rgba(30,41,59,0.9)",
            "rgba(51,65,85,0.85)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </MotiView>

      {/* Floating orbs background */}
      <View style={styles.orbContainer}>
        <Animated.View
          style={[
            styles.orb,
            styles.orb1,
            { transform: [{ translateY }, { scale: pulseAnimation }] },
          ]}
        />
        <Animated.View
          style={[
            styles.orb,
            styles.orb2,
            {
              transform: [
                { translateY: Animated.multiply(translateY, -1) },
                { scale: pulseAnimation },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.orb,
            styles.orb3,
            { transform: [{ translateY }, { scale: pulseAnimation }] },
          ]}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "center" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.8, rotateX: "-45deg" }}
          animate={{ opacity: 1, scale: 1, rotateX: "0deg" }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 100,
            duration: 1200
          }}
          style={{ perspective: 1000 }}
        >
          <BlurView intensity={80} tint="dark" style={styles.card}>
            {/* Gradient border effect */}
            <LinearGradient
              colors={["#818CF8", "#F472B6", "#FBBF24"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardBorder}
            />

            <View style={styles.cardContent}>
              {/* Logo/Icon with glow effect */}
              <MotiView
                from={{ scale: 0, rotate: "180deg" }}
                animate={{ scale: 1, rotate: "0deg" }}
                transition={{
                  type: "spring",
                  delay: 300,
                  damping: 10,
                  stiffness: 100
                }}
                style={styles.logoContainer}
              >
                <LinearGradient
                  colors={["#818CF8", "#F472B6"]}
                  style={styles.logoGradient}
                >
                  <MaterialCommunityIcons name="infinity" size={40} color="#fff" />
                </LinearGradient>
                <View style={styles.logoGlow} />
              </MotiView>

              {/* Animated header with gradient text */}
              <MotiView
                from={{ opacity: 0, translateY: -30 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 400, type: "spring", damping: 10 }}
              >
                <MaskedView
                  maskElement={
                    <Text style={styles.header}>Welcome Back</Text>
                  }
                >
                  <LinearGradient
                    colors={["#E0E7FF", "#FBBF24", "#F472B6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={[styles.header, { opacity: 0 }]}>
                      Welcome Back
                    </Text>
                  </LinearGradient>
                </MaskedView>
                <Text style={styles.subheader}>
                  Enter the realm of infinite possibilities
                </Text>
              </MotiView>

              {/* Enhanced input fields */}
              <MotiView
                from={{ opacity: 0, translateX: -50 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: 500, type: "spring", damping: 10 }}
              >
                <View style={[
                  styles.inputContainer,
                  focusedInput === "email" && styles.inputFocused
                ]}>
                  <LinearGradient
                    colors={
                      focusedInput === "email"
                        ? ["rgba(129,140,248,0.3)", "rgba(244,114,182,0.3)"]
                        : ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.1)"]
                    }
                    style={styles.inputGradient}
                  >
                    <TextInput
                      label="Email"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setFocusedInput("email")}
                      onBlur={() => setFocusedInput(null)}
                      style={styles.input}
                      mode="flat"
                      textColor="#fff"
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      left={
                        <TextInput.Icon
                          icon={() => (
                            <Ionicons
                              name="mail-outline"
                              size={22}
                              color={focusedInput === "email" ? "#818CF8" : "#94A3B8"}
                            />
                          )}
                        />
                      }
                      theme={{
                        colors: {
                          onSurfaceVariant: "rgba(255,255,255,0.7)",
                          primary: "#818CF8"
                        }
                      }}
                    />
                  </LinearGradient>
                </View>

                <View style={[
                  styles.inputContainer,
                  focusedInput === "password" && styles.inputFocused
                ]}>
                  <LinearGradient
                    colors={
                      focusedInput === "password"
                        ? ["rgba(129,140,248,0.3)", "rgba(244,114,182,0.3)"]
                        : ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.1)"]
                    }
                    style={styles.inputGradient}
                  >
                    <TextInput
                      label="Password"
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setFocusedInput("password")}
                      onBlur={() => setFocusedInput(null)}
                      secureTextEntry={!showPassword}
                      style={styles.input}
                      mode="flat"
                      textColor="#fff"
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      left={
                        <TextInput.Icon
                          icon={() => (
                            <Ionicons
                              name="lock-closed-outline"
                              size={22}
                              color={focusedInput === "password" ? "#818CF8" : "#94A3B8"}
                            />
                          )}
                        />
                      }
                      right={
                        <TextInput.Icon
                          icon={() => (
                            <Ionicons
                              name={showPassword ? "eye-off-outline" : "eye-outline"}
                              size={22}
                              color="#94A3B8"
                            />
                          )}
                          onPress={() => setShowPassword(!showPassword)}
                        />
                      }
                      theme={{
                        colors: {
                          onSurfaceVariant: "rgba(255,255,255,0.7)",
                          primary: "#818CF8"
                        }
                      }}
                    />
                  </LinearGradient>
                </View>
              </MotiView>

              {/* Premium login button */}
              <MotiView
                from={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 700,
                  type: "spring",
                  damping: 10,
                  stiffness: 100
                }}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    pressed && { transform: [{ scale: 0.95 }] },
                  ]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={["#818CF8", "#EC4899", "#F59E0B"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGrad}
                  >
                    <AnimatePresence>
                      {isLoading ? (
                        <MotiView
                          from={{ rotate: "0deg" }}
                          animate={{ rotate: "360deg" }}
                          transition={{
                            loop: true,
                            type: "timing",
                            duration: 1000,
                            repeatReverse: false,
                          }}
                        >
                          <Ionicons name="sync" size={24} color="#fff" />
                        </MotiView>
                      ) : (
                        <View style={styles.buttonContent}>
                          <Text style={styles.buttonText}>Sign In</Text>
                          <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </View>
                      )}
                    </AnimatePresence>
                  </LinearGradient>
                  <View style={styles.buttonGlow} />
                </Pressable>
              </MotiView>

              {/* Divider with text */}
              <MotiView
                from={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 800, type: "timing", duration: 500 }}
                style={styles.dividerContainer}
              >
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </MotiView>

              {/* Social login buttons */}
              <MotiView
                from={{ opacity: 0, translateY: 30 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 900, type: "spring", damping: 10 }}
                style={styles.socialContainer}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.socialButton,
                    pressed && { transform: [{ scale: 0.95 }] },
                  ]}
                  onPress={handleGoogleSignIn}
                >
                  <BlurView intensity={50} tint="light" style={styles.socialBlur}>
                    <Ionicons name="logo-google" size={24} color="#EA4335" />
                  </BlurView>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.socialButton,
                    pressed && { transform: [{ scale: 0.95 }] },
                  ]}
                >
                  <BlurView intensity={50} tint="light" style={styles.socialBlur}>
                    <Ionicons name="logo-apple" size={24} color="#fff" />
                  </BlurView>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.socialButton,
                    pressed && { transform: [{ scale: 0.95 }] },
                  ]}
                >
                  <BlurView intensity={50} tint="light" style={styles.socialBlur}>
                    <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                  </BlurView>
                </Pressable>
              </MotiView>

              {/* Links with hover effect */}
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1000, type: "timing", duration: 500 }}
                style={styles.linksContainer}
              >
                <Pressable
                  onPress={() => navigation.navigate("ForgotPassword")}
                  style={({ pressed }) => pressed && { opacity: 0.7 }}
                >
                  <Text style={styles.link}>Forgot Password?</Text>
                </Pressable>

                <Pressable
                  onPress={() => navigation.navigate("Signup")}
                  style={({ pressed }) => pressed && { opacity: 0.7 }}
                >
                  <Text style={styles.linkHighlight}>
                    Create New Account
                    <Ionicons name="sparkles" size={14} color="#FBBF24" />
                  </Text>
                </Pressable>
              </MotiView>

              {/* --- DEV RESET BUTTON --- */}
              <View style={styles.devResetWrap}>
                <Pressable
                  onPress={resetAppState}
                  style={({ pressed }) => [
                    styles.devResetBtn,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Ionicons
                    name="refresh-circle-outline"
                    size={18}
                    color="#ccc"
                  />
                  <Text style={styles.devResetText}>
                    Reset App State (Dev)
                  </Text>
                </Pressable>
              </View>
            </View>
          </BlurView>
        </MotiView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
  },
  orb1: {
    width: 200,
    height: 200,
    backgroundColor: "rgba(129,140,248,0.15)",
    top: -50,
    left: -50,
    shadowColor: "#818CF8",
    shadowOpacity: 0.3,
    shadowRadius: 50,
  },
  orb2: {
    width: 250,
    height: 250,
    backgroundColor: "rgba(244,114,182,0.15)",
    top: height * 0.3,
    right: -100,
    shadowColor: "#F472B6",
    shadowOpacity: 0.3,
    shadowRadius: 50,
  },
  orb3: {
    width: 180,
    height: 180,
    backgroundColor: "rgba(251,191,36,0.15)",
    bottom: 100,
    left: -30,
    shadowColor: "#FBBF24",
    shadowOpacity: 0.3,
    shadowRadius: 50,
  },
  card: {
    marginHorizontal: 20,
    borderRadius: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 20,
  },
  cardBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  cardContent: {
    padding: 32,
    backgroundColor: "rgba(15,23,42,0.4)",
  },
  logoContainer: {
    alignSelf: "center",
    marginBottom: 24,
    position: "relative",
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#818CF8",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  logoGlow: {
    position: "absolute",
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 44,
    backgroundColor: "rgba(129,140,248,0.2)",
    blur: 20,
  },
  header: {
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: 8,
  },
  subheader: {
    textAlign: "center",
    color: "rgba(226,232,240,0.8)",
    marginBottom: 32,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  inputContainer: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  inputFocused: {
    borderColor: "rgba(129,140,248,0.5)",
    shadowColor: "#818CF8",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  inputGradient: {
    borderRadius: 16,
  },
  input: {
    backgroundColor: "transparent",
    fontSize: 16,
    height: 60,
  },
  button: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 12,
    position: "relative",
    shadowColor: "#818CF8",
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  buttonGrad: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1,
  },
  buttonGlow: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 26,
    backgroundColor: "rgba(129,140,248,0.15)",
    zIndex: -1,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  dividerText: {
    color: "rgba(226,232,240,0.5)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  socialBlur: {
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
  },
  linksContainer: {
    gap: 12,
  },
  link: {
    color: "rgba(226,232,240,0.7)",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  linkHighlight: {
    color: "#FBBF24",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.5,
    shadowColor: "#FBBF24",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    textShadowColor: "rgba(251,191,36,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  devResetWrap: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    paddingTop: 14,
    alignItems: "center",
  },
  devResetBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  devResetText: {
    marginLeft: 6,
    color: "#aaa",
    fontSize: 13,
    fontWeight: "600",
  },
});
