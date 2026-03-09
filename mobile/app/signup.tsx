import { SafeAreaView, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function Signup() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>
            Create your account to manage your tasks and schedules.
          </Text>

          <TextInput
            style={[
              styles.input,
              { borderColor: theme.border, color: theme.text, backgroundColor: theme.background },
            ]}
            placeholder="Full name"
            placeholderTextColor={theme.subtext}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={[
              styles.input,
              { borderColor: theme.border, color: theme.text, backgroundColor: theme.background },
            ]}
            placeholder="Email"
            placeholderTextColor={theme.subtext}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={[
              styles.input,
              { borderColor: theme.border, color: theme.text, backgroundColor: theme.background },
            ]}
            placeholder="Password"
            placeholderTextColor={theme.subtext}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable style={[styles.button, { backgroundColor: theme.tint }]} onPress={() => router.replace('/login')}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </Pressable>

          <Pressable onPress={() => router.back()}>
            <Text style={[styles.link, { color: theme.tint }]}>Back to Login</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 22 },
  input: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    fontSize: 15,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: 'white', fontWeight: '800', fontSize: 16 },
  link: { marginTop: 18, textAlign: 'center', fontSize: 15, fontWeight: '600' },
});