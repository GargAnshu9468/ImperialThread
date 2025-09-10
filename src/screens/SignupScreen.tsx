// src/screens/SignupScreen.tsx
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
} from "react-native";
import { TextInput, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MotiView, AnimatePresence } from "moti";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { Easing } from "react-native-reanimated";
import MaskedView from "@react-native-masked-view/masked-view";

const { height } = Dimensions.get("window");

export default function SignupScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();

  // Animation refs (match LoginScreen behavior)
  const floatingAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // floating
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

    // pulse
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

    // shimmer (keeps parity with LoginScreen even if subtle)
    Animated.loop(
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [floatingAnimation, pulseAnimation, shimmerAnimation]);

  const translateY = floatingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const handleSignup = async () => {
    setIsLoading(true);
    // demo: treat signup as login
    await auth.login();
    setTimeout(() => {
      setIsLoading(false);
      navigation.replace("MainApp");
    }, 1400);
  };

  return (
    <ImageBackground
      source={require("../../assets/img/banners/banner_2.avif")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* animated gradient overlay (same as login) */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 900 }}
        style={StyleSheet.absoluteFillObject}
      >
        <LinearGradient
          colors={[
            "rgba(15,23,42,0.95)",
            "rgba(30,41,59,0.92)",
            "rgba(51,65,85,0.85)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </MotiView>

      {/* Floating orbs background (same layout & animation) */}
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
          from={{ opacity: 0, scale: 0.85, rotateX: "-30deg" }}
          animate={{ opacity: 1, scale: 1, rotateX: "0deg" }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 100,
            duration: 1100,
          }}
          style={{ perspective: 1000 }}
        >
          <BlurView intensity={80} tint="dark" style={styles.card}>
            {/* gradient border overlay */}
            <LinearGradient
              colors={["#818CF8", "#F472B6", "#FBBF24"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardBorder}
            />

            <View style={styles.cardContent}>
              {/* Logo (animated, centered) */}
              <MotiView
                from={{ scale: 0, rotate: "180deg" }}
                animate={{ scale: 1, rotate: "0deg" }}
                transition={{
                  type: "spring",
                  delay: 300,
                  damping: 10,
                  stiffness: 100,
                }}
                style={styles.logoContainer}
              >
                <LinearGradient
                  colors={["#818CF8", "#F472B6"]}
                  style={styles.logoGradient}
                >
                  {/* choose an account-plus icon for signup, centered after animation */}
                  <MaterialCommunityIcons name="account-plus" size={40} color="#fff" />
                </LinearGradient>
                <View style={styles.logoGlow} />
              </MotiView>

              {/* Masked gradient header */}
              <MotiView
                from={{ opacity: 0, translateY: -28 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 420, type: "spring", damping: 10 }}
              >
                <MaskedView
                  maskElement={<Text style={styles.header}>Create Account</Text>}
                >
                  <LinearGradient
                    colors={["#E0E7FF", "#FBBF24", "#F472B6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={[styles.header, { opacity: 0 }]}>Create Account</Text>
                  </LinearGradient>
                </MaskedView>
                <Text style={styles.subheader}>
                  Join the realm of curated luxury
                </Text>
              </MotiView>

              {/* Inputs */}
              <MotiView
                from={{ opacity: 0, translateX: -40 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: 540, type: "spring", damping: 10 }}
              >
                <View style={[styles.inputContainer, focusedInput === "name" && styles.inputFocused]}>
                  <LinearGradient
                    colors={focusedInput === "name" ? ["rgba(129,140,248,0.28)", "rgba(244,114,182,0.28)"] : ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.08)"]}
                    style={styles.inputGradient}
                  >
                    <TextInput
                      label="Full name"
                      value={name}
                      onChangeText={setName}
                      onFocus={() => setFocusedInput("name")}
                      onBlur={() => setFocusedInput(null)}
                      style={styles.input}
                      mode="flat"
                      textColor="#fff"
                      underlineColor="transparent"
                      theme={{
                        colors: {
                          onSurfaceVariant: "#fff",
                          primary: "#818CF8",
                        },
                      }}
                      left={<TextInput.Icon icon={() => <Ionicons name="person-outline" size={22} color={focusedInput === "name" ? "#818CF8" : "#94A3B8"} />} />}
                    />
                  </LinearGradient>
                </View>

                <View style={[styles.inputContainer, focusedInput === "email" && styles.inputFocused]}>
                  <LinearGradient
                    colors={focusedInput === "email" ? ["rgba(129,140,248,0.28)", "rgba(244,114,182,0.28)"] : ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.08)"]}
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
                      theme={{
                        colors: {
                          onSurfaceVariant: "#fff",
                          primary: "#818CF8",
                        },
                      }}
                      left={<TextInput.Icon icon={() => <Ionicons name="mail-outline" size={22} color={focusedInput === "email" ? "#818CF8" : "#94A3B8"} />} />}
                    />
                  </LinearGradient>
                </View>

                <View style={[styles.inputContainer, focusedInput === "password" && styles.inputFocused]}>
                  <LinearGradient
                    colors={focusedInput === "password" ? ["rgba(129,140,248,0.28)", "rgba(244,114,182,0.28)"] : ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.08)"]}
                    style={styles.inputGradient}
                  >
                    <TextInput
                      label="Password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      onFocus={() => setFocusedInput("password")}
                      onBlur={() => setFocusedInput(null)}
                      style={styles.input}
                      mode="flat"
                      textColor="#fff"
                      underlineColor="transparent"
                      theme={{
                        colors: {
                          onSurfaceVariant: "#fff",
                          primary: "#818CF8",
                        },
                      }}
                      left={<TextInput.Icon icon={() => <Ionicons name="lock-closed-outline" size={22} color={focusedInput === "password" ? "#818CF8" : "#94A3B8"} />} />}
                      right={<TextInput.Icon icon={() => <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#94A3B8" />} onPress={() => setShowPassword(!showPassword)} />}
                    />
                  </LinearGradient>
                </View>
              </MotiView>

              {/* Sign Up button */}
              <MotiView
                from={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 760, type: "spring", damping: 10 }}
              >
                <Pressable
                  style={({ pressed }) => [styles.button, pressed && { transform: [{ scale: 0.95 }] }]}
                  onPress={handleSignup}
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
                          }}
                        >
                          <Ionicons name="sync" size={24} color="#fff" />
                        </MotiView>
                      ) : (
                        <View style={styles.buttonContent}>
                          <Text style={styles.buttonText}>Sign Up</Text>
                          <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </View>
                      )}
                    </AnimatePresence>
                  </LinearGradient>
                  <View style={styles.buttonGlow} />
                </Pressable>
              </MotiView>

              {/* Divider / OR (keeps parity with login) */}
              <MotiView
                from={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 920, type: "timing", duration: 420 }}
                style={styles.dividerContainer}
              >
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </MotiView>

              {/* Social buttons */}
              <MotiView
                from={{ opacity: 0, translateY: 30 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 1000, type: "spring", damping: 10 }}
                style={styles.socialContainer}
              >
                <Pressable style={({ pressed }) => [styles.socialButton, pressed && { transform: [{ scale: 0.95 }] }]} onPress={() => console.log("Google")}>
                  <BlurView intensity={50} tint="light" style={styles.socialBlur}>
                    <Ionicons name="logo-google" size={24} color="#EA4335" />
                  </BlurView>
                </Pressable>

                <Pressable style={({ pressed }) => [styles.socialButton, pressed && { transform: [{ scale: 0.95 }] }]} onPress={() => console.log("Apple")}>
                  <BlurView intensity={50} tint="light" style={styles.socialBlur}>
                    <Ionicons name="logo-apple" size={24} color="#fff" />
                  </BlurView>
                </Pressable>

                <Pressable style={({ pressed }) => [styles.socialButton, pressed && { transform: [{ scale: 0.95 }] }]} onPress={() => console.log("Facebook")}>
                  <BlurView intensity={50} tint="light" style={styles.socialBlur}>
                    <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                  </BlurView>
                </Pressable>
              </MotiView>

              {/* Links */}
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1100, type: "timing", duration: 420 }}
                style={styles.linksContainer}
              >
                <Pressable onPress={() => navigation.navigate("Login")} style={({ pressed }) => pressed && { opacity: 0.8 }}>
                  <Text style={styles.link}>Already have an account? Login</Text>
                </Pressable>
              </MotiView>
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
    top: height * 0.28,
    right: -100,
    shadowColor: "#F472B6",
    shadowOpacity: 0.28,
    shadowRadius: 50,
  },
  orb3: {
    width: 180,
    height: 180,
    backgroundColor: "rgba(251,191,36,0.15)",
    bottom: 100,
    left: -30,
    shadowColor: "#FBBF24",
    shadowOpacity: 0.28,
    shadowRadius: 40,
  },

  card: {
    marginHorizontal: 20,
    borderRadius: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.55,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 20,
  },
  cardBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.14,
  },
  cardContent: {
    padding: 32,
    backgroundColor: "rgba(15,23,42,0.42)",
  },

  logoContainer: {
    alignSelf: "center",
    marginBottom: 18,
    position: "relative",
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#818CF8",
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  logoGlow: {
    position: "absolute",
    top: -18,
    left: -18,
    right: -18,
    bottom: -18,
    borderRadius: 40,
    backgroundColor: "rgba(129,140,248,0.16)",
    zIndex: -1,
  },

  header: {
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 0.6,
    marginBottom: 6,
    color: "#fff",
  },
  subheader: {
    textAlign: "center",
    color: "rgba(226,232,240,0.85)",
    marginBottom: 22,
    fontSize: 14,
  },

  inputContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  inputFocused: {
    borderColor: "rgba(129,140,248,0.5)",
    shadowColor: "#818CF8",
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  inputGradient: {
    borderRadius: 16,
  },
  input: {
    backgroundColor: "transparent",
    fontSize: 16,
    height: 56,
  },

  button: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 14,
    position: "relative",
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
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginRight: 8,
  },
  buttonGlow: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 22,
    backgroundColor: "rgba(129,140,248,0.12)",
    zIndex: -1,
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  dividerText: {
    color: "rgba(226,232,240,0.55)",
    fontSize: 12,
    fontWeight: "700",
    marginHorizontal: 12,
  },

  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  socialButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  socialBlur: {
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
  },

  linksContainer: {
    alignItems: "center",
  },
  link: {
    color: "#FBBF24",
    marginTop: 14,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 14,
  },
});
