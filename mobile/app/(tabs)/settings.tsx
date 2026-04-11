import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsScreen() {
  const theme = useTheme();
  const { isDark, toggleTheme } = theme;

  const [taskReminders, setTaskReminders] = useState(true);
  const [routeUpdates, setRouteUpdates] = useState(true);

  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

  const user = {
    name: 'Wayne',
    email: 'cheng.yue38@myhunter.cuny.edu',
    profilePicture: '',
  };

  const handleChangeProfilePicture = () => {
    Alert.alert('Change profile picture', 'Connect your image picker here.');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Hook up your logout logic here.');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Manage your account</Text>

      <TouchableOpacity style={styles.profileCard} activeOpacity={0.85}>
        {user.profilePicture ? (
          <Image source={{ uri: user.profilePicture }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <Text style={styles.profileHint}>Tap your avatar to change profile picture</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Appearance</Text>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Dark mode</Text>
            <Text style={styles.rowSubtitle}>Switch between light and dark theme</Text>
          </View>

          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            thumbColor={isDark ? theme.tint : theme.card}
            trackColor={{
              false: theme.border,
              true: theme.accent,
            }}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Task reminders</Text>
            <Text style={styles.rowSubtitle}>Reminder alerts for scheduled tasks</Text>
          </View>

          <Switch
            value={taskReminders}
            onValueChange={setTaskReminders}
            thumbColor={taskReminders ? theme.tint : theme.card}
            trackColor={{
              false: theme.border,
              true: theme.accent,
            }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Route updates</Text>
            <Text style={styles.rowSubtitle}>Alerts when your route or schedule changes</Text>
          </View>

          <Switch
            value={routeUpdates}
            onValueChange={setRouteUpdates}
            thumbColor={routeUpdates ? theme.tint : theme.card}
            trackColor={{
              false: theme.border,
              true: theme.accent,
            }}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleChangeProfilePicture}>
          <Text style={styles.secondaryButtonText}>Change profile picture</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>, isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    contentContainer: {
      padding: 20,
      paddingBottom: 120,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.text,
      marginTop: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.subtext,
      marginTop: 8,
      marginBottom: 16,
    },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 16,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.2 : 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    avatarImage: {
      width: 72,
      height: 72,
      borderRadius: 36,
    },
    avatarPlaceholder: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.tint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 30,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    profileInfo: {
      flex: 1,
      marginLeft: 16,
    },
    profileName: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    profileEmail: {
      fontSize: 15,
      color: theme.subtext,
      marginBottom: 8,
    },
    profileHint: {
      fontSize: 14,
      color: theme.subtext,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 18,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.2 : 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 14,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowText: {
      flex: 1,
      paddingRight: 16,
    },
    rowTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    rowSubtitle: {
      fontSize: 14,
      color: theme.subtext,
      marginTop: 4,
      lineHeight: 20,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 16,
    },
    secondaryButton: {
      height: 56,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    secondaryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    logoutButton: {
      height: 56,
      borderRadius: 16,
      backgroundColor: '#EF4444',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoutButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
}