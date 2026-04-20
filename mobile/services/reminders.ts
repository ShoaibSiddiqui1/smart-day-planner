import * as Notifications from 'expo-notifications';
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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Notifications work best on a physical device.');
    return true;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    throw new Error('Notification permission was not granted.');
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
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleTaskReminders(
  schedule: Schedule,
  minutesBefore: number = 10
) {
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
    const locationText = item.task.location ? `\nLocation: ${item.task.location}` : '';
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