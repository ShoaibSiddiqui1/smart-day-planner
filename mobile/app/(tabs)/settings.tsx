import { View, Text, Switch, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Typography, Spacing, BorderRadius } from '@/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const scheme = useColorScheme() ?? 'light';

  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [routeAlertsEnabled, setRouteAlertsEnabled] = useState(true);
  const [darkModePreview, setDarkModePreview] = useState(scheme === 'dark');

  const settingRows = [
    {
      title: 'Task reminders',
      subtitle: 'Get alerts before tasks begin',
      value: remindersEnabled,
      onChange: setRemindersEnabled,
    },
    {
      title: 'Route updates',
      subtitle: 'Traffic and travel change alerts',
      value: routeAlertsEnabled,
      onChange: setRouteAlertsEnabled,
    },
    {
      title: 'Dark mode preview',
      subtitle: 'UI preview toggle',
      value: darkModePreview,
      onChange: setDarkModePreview,
    },
  ];

  return (
    <ScreenContainer>
      <Header title="Settings" subtitle="Manage reminders, preferences, and your account." />

      {/* Profile card */}
      <Card style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: theme.tint }]}>
          <Text style={styles.avatarText}>SD</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.name, { color: theme.text }]}>Shoaib Siddiqui</Text>
          <Text style={[styles.email, { color: theme.subtext }]}>shoaib@example.com</Text>
        </View>
      </Card>

      {/* Preferences */}
      <Card>
        {settingRows.map((row, i) => (
          <View key={row.title}>
            <View style={styles.settingRow}>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>{row.title}</Text>
                <Text style={[styles.settingSubtitle, { color: theme.subtext }]}>{row.subtitle}</Text>
              </View>
              <Switch
                value={row.value}
                onValueChange={row.onChange}
                trackColor={{ true: theme.tint }}
              />
            </View>
            {i < settingRows.length - 1 && (
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            )}
          </View>
        ))}
      </Card>

      {/* About */}
      <Card>
        <Text style={[styles.settingTitle, { color: theme.text, marginBottom: Spacing.xs }]}>About</Text>
        <Text style={[styles.settingSubtitle, { color: theme.subtext }]}>
          Smart Day Planner helps users organize tasks, view schedules, and preview optimized routes.
        </Text>
      </Card>

      {/* Logout */}
      <Button
        label="Logout"
        variant="danger"
        fullWidth
        onPress={() => router.replace('/login')}
        style={styles.logoutBtn}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: 'white', fontWeight: '800', fontSize: 18 },
  profileInfo: { flex: 1 },
  name: { ...Typography.h4 },
  email: { ...Typography.bodySm, marginTop: 2 },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingText: { flex: 1, paddingRight: Spacing.sm },
  settingTitle: { ...Typography.h4, marginBottom: 2 },
  settingSubtitle: { ...Typography.bodySm },
  divider: { height: 1, marginVertical: Spacing.md },
  logoutBtn: { marginTop: Spacing.xs },
});
