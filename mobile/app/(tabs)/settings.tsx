import { SafeAreaView, ScrollView, View, Text, Pressable, Switch, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [routeAlertsEnabled, setRouteAlertsEnabled] = useState(true);
  const [darkModePreview, setDarkModePreview] = useState(scheme === 'dark');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>
          Manage reminders, preferences, and your account.
        </Text>

        <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.avatar, { backgroundColor: theme.tint }]}>
            <Text style={styles.avatarText}>SD</Text>
          </View>
          <View>
            <Text style={[styles.name, { color: theme.text }]}>Shoaib Siddiqui</Text>
            <Text style={[styles.email, { color: theme.subtext }]}>shoaib@example.com</Text>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Task reminders</Text>
              <Text style={[styles.settingText, { color: theme.subtext }]}>Get alerts before tasks begin</Text>
            </View>
            <Switch value={remindersEnabled} onValueChange={setRemindersEnabled} />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Route updates</Text>
              <Text style={[styles.settingText, { color: theme.subtext }]}>Traffic and travel change alerts</Text>
            </View>
            <Switch value={routeAlertsEnabled} onValueChange={setRouteAlertsEnabled} />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Dark mode preview</Text>
              <Text style={[styles.settingText, { color: theme.subtext }]}>UI preview toggle</Text>
            </View>
            <Switch value={darkModePreview} onValueChange={setDarkModePreview} />
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.settingTitle, { color: theme.text, marginBottom: 10 }]}>About</Text>
          <Text style={[styles.settingText, { color: theme.subtext }]}>
            Smart Day Planner helps users organize tasks, view schedules, and preview optimized routes.
          </Text>
        </View>

        <Pressable style={[styles.logoutBtn, { backgroundColor: theme.danger }]} onPress={() => router.replace('/login')}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 18, paddingBottom: 120 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 15, marginBottom: 16 },
  profileCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: 'white', fontWeight: '800', fontSize: 18 },
  name: { fontSize: 18, fontWeight: '800' },
  email: { fontSize: 14, marginTop: 2 },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
  },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  settingText: { fontSize: 13, lineHeight: 18 },
  divider: { height: 1, marginVertical: 16 },
  logoutBtn: {
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutText: { color: 'white', fontWeight: '800', fontSize: 16 },
});