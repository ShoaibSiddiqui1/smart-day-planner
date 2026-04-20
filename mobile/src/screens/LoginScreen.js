import React, { useState } from 'react';
import { TextInput, Button, StyleSheet, Alert, ScrollView, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { Colors } from '../constants/theme';

// ✅ Use localhost for Expo Web
const API_URL = "http://localhost:8000";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  
  const handleLogin = async () => {
    console.log("LOGIN BUTTON CLICKED");

    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);

      console.log("Sending request...");

      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const data = await response.json();

      console.log("STATUS:", response.status);
      console.log("DATA:", data);

      if (response.status === 200 && data.access_token) {
        console.log("LOGIN SUCCESS");

        // ✅ THIS IS THE CORRECT NAVIGATION
        navigation.navigate('Tasks');
      } else {
        alert(data.detail || "Invalid email or password");
      }

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <ThemedText type="title" style={styles.header}>Smart Day Planner</ThemedText>
        <ThemedText style={styles.subHeader}>Login</ThemedText>

        <TextInput 
          placeholder="Email" 
          value={email}
          onChangeText={setEmail}
          style={styles.input} 
          placeholderTextColor={Colors.light.icon}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />

        <TextInput 
          placeholder="Password" 
          value={password}
          onChangeText={setPassword}
          secureTextEntry 
          style={styles.input} 
          placeholderTextColor={Colors.light.icon}
          autoCapitalize="none"
        />

        <View style={styles.buttonWrapper}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.light.tint} />
          ) : (
            <Button title="Login" onPress={handleLogin} color={Colors.light.tint} />
          )}
        </View>

        <View style={styles.buttonWrapper}>
          <ThemedText style={{ textAlign: 'center', marginBottom: 5 }}>
            Don't have an account?
          </ThemedText>
          <Button 
            title="Sign Up" 
            onPress={() => navigation.navigate('Signup')} 
            color={Colors.light.icon} 
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  subHeader: { fontSize: 16, textAlign: 'center', marginBottom: 30 },
  input: { 
    borderBottomWidth: 1, 
    marginBottom: 20, 
    padding: 10, 
    borderColor: Colors.light.icon,
    color: Colors.light.text,
  },
  buttonWrapper: {
    marginVertical: 10,
  }
});