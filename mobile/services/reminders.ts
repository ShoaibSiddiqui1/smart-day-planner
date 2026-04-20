import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

type Task = {
  id?: number;
  title?: string;
  location?: string;
};

type ScheduleItem = {
  id?: number;
  scheduled_start?: string;
  scheduled_end?: string;
  task?: Task;
};

type Schedule = {
  id?: number;
  items?: ScheduleItem[];
};

const isExpoGo = Constants.appOwnership === 'expo';

async function getNotificationsModule() {
  if (isExpoGo) {
    return null;
  }

  return await import('expo-notifications');
}

export async function registerForNotificationsAsync(): Promise<boolean> {
  const Notifications = await getNotificationsModule();

  if (!Notifications) {
    console.log('Expo Go detected: skipping notification registration.');
    return false;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (!Device.isDevice) {
    console.log('Notifications require a physical device.');
    return false;
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permission was not granted.');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  return true;
}

export async function clearScheduledReminders() {
  const Notifications = await getNotificationsModule();

  if (!Notifications) {
    console.log('Expo Go detected: skipping clear reminders.');
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleTaskReminders(
  schedule: Schedule,
  minutesBefore: number = 10
) {
  const Notifications = await getNotificationsModule();

  if (!Notifications) {
    console.log('Expo Go detected: skipping task reminders.');
    return 0;
  }

  const items = schedule.items ?? [];
  let count = 0;

  for (const item of items) {
    if (!item.scheduled_start || !item.task) {
      continue;
    }

    const startDate = new Date(item.scheduled_start);
    const triggerDate = new Date(startDate.getTime() - minutesBefore * 60 * 1000);

    if (isNaN(startDate.getTime()) || triggerDate <= new Date()) {
      continue;
    }

    const title = item.task.title || 'Upcoming task';
    const locationText = item.task.location
      ? `\nLocation: ${item.task.location}`
      : '';

    const body = `Starts at ${startDate.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })}${locationText}`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Reminder: ${title}`,
        body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: 'reminders',
      },
    });

    count += 1;
  }

  return count;
}