// src/screens/ForgotPasswordScreen.tsx
import React, { useState, useContext } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { TextInput, Text } from "react-native-paper";
import { useAuth } from "../context/AuthContext";

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const auth = useAuth();

  const handleReset = async () => {
    // TODO: call your password reset API here
    // For now, mock a successful reset and route user to Login
    Alert.alert("Password reset", "We sent a password reset link to your email.");
    // optional: if you want to force logged-out state
    if (auth.isLoggedIn) {
      await auth.logout();
    }
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Forgot Password?</Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Pressable style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Reset Password</Text>
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
});
