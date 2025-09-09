// src/screens/LoginScreen.tsx
import React, { useState } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { TextInput, Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = useAuth();

  const handleLogin = async () => {
    // TODO: plug real auth validation
    await auth.login(); // this persists isLoggedIn = true (App.tsx login)
    // navigate to the main drawer after login
    navigation.replace("MainApp");
  };

  // Dev helper: clear onboarding + auth flags and go back to onboarding
  const resetAppState = async () => {
    try {
      await AsyncStorage.removeItem("onboardingSeen");
      await AsyncStorage.removeItem("isLoggedIn");
      Alert.alert("Dev", "Cleared onboardingSeen and isLoggedIn. Restarting to Onboarding.");
      // reset navigation stack to show Onboarding immediately
      navigation.reset({
        index: 0,
        routes: [{ name: "Onboarding" }],
      });
    } catch (e) {
      console.warn("Reset app state failed", e);
      Alert.alert("Dev", "Failed to reset app state. See console for details.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome Back</Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        mode="outlined"
      />
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.link}>Forgot Password?</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.link}>Don’t have an account? Sign Up</Text>
      </Pressable>

      {/* Dev-only: reset app state (onboarding + auth) */}
      <Pressable style={styles.resetButton} onPress={resetAppState}>
        <Text style={styles.resetButtonText}>Reset App State (dev)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fafafa" },
  header: { fontSize: 26, fontWeight: "800", marginBottom: 30, color: "#2E4374" },
  input: { marginBottom: 16 },
  button: {
    backgroundColor: "#2E4374",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  link: { color: "#2E4374", marginTop: 14, textAlign: "center", fontWeight: "600" },

  // dev button styles (subtle, not confused with primary actions)
  resetButton: {
    marginTop: 28,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  resetButtonText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
  },
});
