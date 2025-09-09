// src/screens/SignupScreen.tsx
import React, { useState, useContext } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { TextInput, Text } from "react-native-paper";
import { useAuth } from "../context/AuthContext";

export default function SignupScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = useAuth();

  const handleSignup = async () => {
    // TODO: call signup API and persist profile
    await auth.login(); // treat signup as logged-in for demo
    navigation.replace("MainApp");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Account</Text>
      <TextInput label="Name" value={name} onChangeText={setName} style={styles.input} mode="outlined" />
      <TextInput label="Email" value={email} onChangeText={setEmail} style={styles.input} mode="outlined" />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} mode="outlined" />
      <Pressable style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
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
});
