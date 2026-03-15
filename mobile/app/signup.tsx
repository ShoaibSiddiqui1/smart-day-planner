import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { authApi } from "@/services/api";

export default function Signup() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!username.trim() || !email.trim() || !password) {
      setError("All fields are required.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await authApi.register(username.trim(), email.trim(), password);
      // Account created – send the user to login to get a token.
      router.replace("/login");
    } catch (e: any) {
      console.error("Signup error:", JSON.stringify(e?.response?.data ?? e?.message ?? e));
      const detail = e?.response?.data?.detail;
      // Pydantic returns an array of error objects; backend returns a string.
      const message = Array.isArray(detail)
        ? (detail[0]?.msg ?? "Registration failed.")
        : (detail ?? "Registration failed. Please try again.");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#888"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password (min 8 characters)"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={handleSignup} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="black" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Already have an account? Log in</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "black" },
  container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "black" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "white" },
  input: {
    borderWidth: 1,
    borderColor: "#444",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    color: "white",
  },
  error: { color: "#ff6b6b", marginBottom: 8, textAlign: "center" },
  button: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: { color: "black", fontWeight: "800", fontSize: 16 },
  link: { marginTop: 16, textAlign: "center", color: "#2b6cb0", fontSize: 16 },
});