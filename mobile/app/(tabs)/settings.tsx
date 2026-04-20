import React, { useEffect, useMemo, useState } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, type User } from '@/services/api';
import { useRouter } from 'expo-router';

  export default function SettingsScreen() {
  const theme = useTheme();
  const { isDark, toggleTheme } = theme;

  const [taskReminders, setTaskReminders] = useState(true);
  const [routeUpdates, setRouteUpdates] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const loadSettingsData = async () => {
      try {
        const [savedImage, me] = await Promise.all([
          AsyncStorage.getItem('profile_image'),
          authApi.getMe(),
        ]);

        if (savedImage) {
          setProfileImage(savedImage);
        } else if (me?.profile_picture) {
          setProfileImage(me.profile_picture);
        }

        setUser(me);
      } catch (error) {
        console.error('Failed to load settings data:', error);
        Alert.alert('Error', 'Failed to load your account information.');
      } finally {
        setLoadingUser(false);
      }
    };

    loadSettingsData();
  }, []);

  const handleChangeProfilePicture = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission required',
          'Please allow access to your photo library to choose a profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);
      await AsyncStorage.setItem('profile_image', imageUri);

      Alert.alert('Success', 'Profile picture updated.');
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/login');
  };

  const displayName = user?.username?.trim() || 'User';
  const displayEmail = user?.email?.trim() || 'No email available';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  if (loadingUser) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Loading...</Text>
    </View>
  );
}
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Manage your account</Text>

      <TouchableOpacity
        style={styles.profileCard}
        activeOpacity={0.85}
        onPress={handleChangeProfilePicture}
      >
      {profileImage ? (
        <Image source={{ uri: profileImage }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{avatarLetter}</Text>
        </View>
      )}

      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{displayName}</Text>
        <Text style={styles.profileEmail}>{displayEmail}</Text>
        <Text style={styles.profileHint}>
          Tap your avatar to change profile picture
        </Text>
      </View>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Appearance</Text>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Dark mode</Text>
            <Text style={styles.rowSubtitle}>
              Switch between light and dark theme
            </Text>
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
            <Text style={styles.rowSubtitle}>
              Reminder alerts for scheduled tasks
            </Text>
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
            <Text style={styles.rowSubtitle}>
              Alerts when your route or schedule changes
            </Text>
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

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleChangeProfilePicture}
        >
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