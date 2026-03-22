import React, { useState } from 'react';
import { TextInput, Button, StyleSheet, Alert, ScrollView, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { Colors } from '../constants/theme';

// Ensure this IP matches your current WSL 'hostname -I'
 const API_URL = "http://192.168.1.175:8000"


export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // 1. HARD BLOCK: If fields are empty, do not even try the network
    if (!email.trim() || !password.trim()) {
      Alert.alert("Input Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    console.log(`Attempting login for: ${email.trim()}`);

    try {
      const params = new URLSearchParams();
      params.append('username', email.trim()); 
      params.append('password', password);

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: params.toString(),
      });

      const data = await response.json();
      console.log("Server Response Status:", response.status);

      // 2. SUCCESS PATH: Must be status 200 AND have a token
      if (response.ok && data.access_token) {
        await AsyncStorage.setItem('userToken', data.access_token);
        console.log("Login Success: Token stored.");
        
        // Clear local state so the fields are empty if user logs out later
        setEmail('');
        setPassword('');
        
        navigation.navigate('Tasks');
      } 
      // 3. FAILURE PATH: Backend rejected credentials
      else {
        console.warn("Login Failed:", data.detail);
        const errorMsg = typeof data.detail === 'string' ? data.detail : "Invalid email or password.";
        Alert.alert("Unauthorized", errorMsg);
      }
    } catch (error) {
      console.error("Network Error:", error);
      Alert.alert("Connection Error", "Check your backend IP and ensure it is running on host 0.0.0.0");
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
          onChangeText={(text) => setEmail(text)} // Explicit state binding
          style={styles.input} 
          placeholderTextColor={Colors.light.icon}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />
        <TextInput 
          placeholder="Password" 
          value={password}
          onChangeText={(text) => setPassword(text)} // Explicit state binding
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
          <ThemedText style={{ textAlign: 'center', marginBottom: 5 }}>Don't have an account?</ThemedText>
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