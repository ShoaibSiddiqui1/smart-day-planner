import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

import { useTheme } from '@/hooks/use-theme';
import { Typography, Spacing, BorderRadius } from '@/constants/theme';
import { scheduleApi, taskApi } from '@/services/api';
import {
  registerForNotificationsAsync,
  clearScheduledReminders,
  scheduleTaskReminders,
} from '@/services/reminders';

type Task = {
  id?: number;
  title?: string;
  location?: string;
  duration_minutes?: number;
  status?: string;
  priority?: number;
};

type ScheduleItem = {
  id?: number;
  scheduled_start?: string;
  scheduled_end?: string;
  travel_time_minutes?: number;
  task?: Task;
};

type Schedule = {
  id?: number;
  total_duration_minutes?: number;
  items?: ScheduleItem[];
};

export default function ScheduleScreen() {
  const theme = useTheme();

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSchedule = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const data = await scheduleApi.getLatest();

      if (data && Array.isArray(data.items) && data.items.length > 0) {
        setSchedule(data);
        return;
      }

      const tasks = await taskApi.getAll();
      if (!Array.isArray(tasks) || tasks.length === 0) {
        setSchedule(null);
        return;
      }

      await scheduleApi.generate();
      const newData = await scheduleApi.getLatest();
      console.log('LATEST SCHEDULE DATA:', JSON.stringify(newData, null, 2));

      setSchedule(newData ?? null);
    } catch (err) {
      console.error('Schedule error:', err);
      setSchedule(null);
      Alert.alert('Schedule error', 'Could not load the optimized schedule.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSchedule(true);
  }, [loadSchedule]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await scheduleApi.generate();
      await loadSchedule(false);
    } catch (err) {
      console.error('Refresh error:', err);
      Alert.alert('Refresh error', 'Could not regenerate the optimized schedule.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleReminderPress = async () => {
    try {
      if (!schedule?.items?.length) {
        Alert.alert('No schedule', 'There are no scheduled tasks to remind you about.');
        return;
      }

      await registerForNotificationsAsync();
      await clearScheduledReminders();

      const count = await scheduleTaskReminders(schedule, 10);

      if (count === 0) {
        Alert.alert('No reminders', 'All reminder times are already in the past.');
        return;
      }

      Alert.alert('Success', `${count} reminder(s) scheduled.`);
    } catch (err) {
      console.error('Reminder error:', err);
      Alert.alert('Error', 'Failed to schedule reminders.');
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      await taskApi.update(taskId, { status: 'completed' });
      await loadSchedule(false);
    } catch (err) {
      console.error('Failed to complete task:', err);
      Alert.alert('Error', 'Failed to mark task as completed.');
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'No time';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return 'Invalid time';

    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const scheduleItems = schedule?.items ?? [];

  const completedCount = scheduleItems.filter(
    (item) => item.task?.status === 'completed'
  ).length;

  const totalCount = scheduleItems.length;

  const progressPercent = totalCount === 0 ? 0 : completedCount / totalCount;

  return (
    <ScreenContainer>
      <Header
        title="Optimized Schedule"
        subtitle="Suggested order based on time, priority, and route efficiency."
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Card
          style={[
            styles.summaryCard,
            { backgroundColor: theme.tint, borderColor: 'transparent' },
          ]}
        >
          <Text style={styles.summaryLabel}>Today's optimization</Text>

          <Text style={styles.summaryValue}>
            {loading
              ? 'Loading...'
              : schedule?.total_duration_minutes != null
                ? `${schedule.total_duration_minutes} min total`
                : 'No schedule'}
          </Text>

          <Text style={styles.summaryText}>
            Your route is reordered to reduce travel time and improve productivity.
          </Text>

          <Text style={styles.progressText}>
            {totalCount === 0
              ? 'No tasks yet'
              : `${completedCount} / ${totalCount} tasks completed`}
          </Text>

          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent * 100}%` },
              ]}
            />
          </View>

          <Button
            label={refreshing ? 'Refreshing...' : 'Refresh schedule'}
            fullWidth
            style={styles.refreshBtn}
            onPress={handleRefresh}
          />
        </Card>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" />
            <Text style={[styles.stateText, { color: theme.subtext }]}>
              Loading schedule...
            </Text>
          </View>
        ) : scheduleItems.length === 0 ? (
          <Card style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No schedule yet
            </Text>
            <Text style={[styles.stateText, { color: theme.subtext }]}>
              Add some tasks first, then come back to generate your optimized plan.
            </Text>
          </Card>
        ) : (
          scheduleItems.map((item, index) => (
            <View key={item.id ? String(item.id) : `item-${index}`}>
              {index > 0 &&
                item.travel_time_minutes != null &&
                item.travel_time_minutes > 0 && (
                  <Text
                    style={{
                      textAlign: 'center',
                      marginVertical: 6,
                      opacity: 0.6,
                      fontSize: 12,
                    }}
                  >
                    ⬇ {Math.ceil(item.travel_time_minutes)} min travel
                  </Text>
                )}

              <View style={styles.timelineRow}>
                <View style={styles.leftCol}>
                  <Text style={[styles.time, { color: theme.tint }]}>
                    {formatTime(item.scheduled_start)}
                  </Text>

                  <View style={[styles.dot, { backgroundColor: theme.tint }]} />

                  {index < scheduleItems.length - 1 && (
                    <View style={[styles.line, { backgroundColor: theme.border }]} />
                  )}
                </View>

                <Card
                  style={[
                    styles.eventCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                >
                  <Text style={[styles.eventTitle, { color: theme.text }]}>
                    {item.task?.title || 'No title'}
                  </Text>

                  <Text style={[styles.eventMeta, { color: theme.subtext }]}>
                    📍 {item.task?.location || 'No location'}
                  </Text>

                  <Text style={[styles.eventMeta, { color: theme.subtext }]}>
                    ⏱ {item.task?.duration_minutes ?? 0} min
                  </Text>

                  <Text style={[styles.eventMeta, { color: theme.subtext }]}>
                    Priority: {item.task?.priority ?? 0}
                  </Text>

                  {item.task?.status === 'completed' && (
                    <Text style={[styles.eventMeta, { color: theme.subtext }]}>
                      ✅ Completed
                    </Text>
                  )}

                  {item.task?.id && item.task?.status !== 'completed' && (
                    <Button
                      label="Complete"
                      onPress={() => handleCompleteTask(item.task!.id!)}
                      style={{ marginTop: 8 }}
                    />
                  )}
                </Card>
              </View>
            </View>
          ))
        )}

        <Button
          label="Send reminder notifications"
          fullWidth
          style={[styles.footerBtn, { backgroundColor: theme.accent }]}
          onPress={handleReminderPress}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  summaryLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    ...Typography.hero,
    color: 'white',
    marginBottom: Spacing.xs,
  },
  summaryText: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: Spacing.xs,
  },
  progressText: {
    ...Typography.bodySm,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.sm,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: BorderRadius.full,
  },
  refreshBtn: {
    borderRadius: BorderRadius.lg,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: Spacing.sm,
  },
  leftCol: {
    width: 64,
    alignItems: 'center',
  },
  time: {
    ...Typography.label,
    fontWeight: '800',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
    marginBottom: 4,
  },
  line: {
    width: 2,
    flex: 1,
  },
  eventCard: {
    flex: 1,
    marginBottom: Spacing.sm,
  },
  eventTitle: {
    ...Typography.h4,
    marginBottom: Spacing.xs,
  },
  eventMeta: {
    ...Typography.bodySm,
    marginBottom: 2,
  },
  footerBtn: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 20,
    paddingHorizontal: Spacing.lg,
  },
  stateText: {
    ...Typography.bodySm,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  emptyTitle: {
    ...Typography.h4,
    marginBottom: 6,
  },
});