import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert, Button, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { Colors } from '../constants/theme';

// TIP: If you are on WSL, run 'hostname -I' and use the first IP.
// Ensure your FastAPI is running with: uvicorn main:app --host 0.0.0.0
const API_URL = "http://192.168.1.175:8000"

export default function SignupScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    // 1. Basic Validation
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/users/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify({ 
          username: username.trim(), 
          email: email.trim().toLowerCase(), 
          password: password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Account created! Please log in.");
        navigation.navigate('Login');
      } else {
        // FastAPI sends validation errors in a 'detail' array or string
        let errorMessage = "Check your details.";
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          // Extracts the specific error message from FastAPI's Pydantic validation
          errorMessage = data.detail[0].msg;
        }
        Alert.alert("Signup Failed", errorMessage);
      }
    } catch (error) {
      console.error("Signup Network Error:", error);
      Alert.alert("Connection Error", "Could not reach the server. Make sure your IP is correct and the backend is running on 0.0.0.0");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <ThemedText type="title" style={styles.header}>Create Account</ThemedText>

        <TextInput 
          placeholder="Username" 
          value={username}
          onChangeText={setUsername} 
          style={styles.input} 
          placeholderTextColor={Colors.light.icon}
          autoCapitalize="none"
        />
        <TextInput 
          placeholder="Email" 
          value={email}
          onChangeText={setEmail} 
          keyboardType="email-address" 
          style={styles.input} 
          placeholderTextColor={Colors.light.icon}
          autoCapitalize="none"
        />
        <TextInput 
          placeholder="Password (min 8 chars)" 
          value={password}
          onChangeText={setPassword} 
          secureTextEntry 
          style={styles.input} 
          placeholderTextColor={Colors.light.icon}
        />

        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.light.tint} />
          ) : (
            <Button title="Sign Up" onPress={handleSignup} color={Colors.light.tint} />
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            title="Back to Login" 
            onPress={() => navigation.navigate('Login')} 
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
  header: { marginBottom: 30, textAlign: 'center' },
  input: { 
    borderBottomWidth: 1, 
    marginBottom: 20, 
    padding: 10, 
    borderColor: Colors.light.icon,
    color: Colors.light.text,
  },
  buttonContainer: {
    marginVertical: 10,
  }
});