import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { ActionCard } from '@/components/ui/ActionCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';

import { useTheme } from '@/hooks/use-theme';
import { Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { taskApi, type Task } from '@/services/api';

const STAT_ICONS = ['📋', '🔴', '⏱'];

export default function DashboardScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const data = await taskApi.getAll();
      console.log('DASHBOARD TASKS:', data);

      if (Array.isArray(data)) {
        setTasks(data.filter((task) => task.status !== 'completed'));
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  const activeTasks = useMemo(
    () => tasks.filter((task) => task.status !== 'completed'),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.status === 'completed'),
    [tasks]
  );

  const completedCount = completedTasks.length;
  const totalCount = tasks.length;
  const progress = totalCount === 0 ? 0 : completedCount / totalCount;

  const dashboardStats = useMemo(() => {
    const totalTasks = activeTasks.length;
    const highPriorityTasks = activeTasks.filter(
      (task) => (task.priority ?? 0) >= 2
    ).length;
    const totalDuration = activeTasks.reduce(
      (sum, task) => sum + (task.duration_minutes ?? 0),
      0
    );

    return [
      { label: 'Today Tasks', value: String(totalTasks) },
      { label: 'High Priority', value: String(highPriorityTasks) },
      { label: 'Planned Time', value: `${totalDuration}m` },
    ];
  }, [activeTasks]);

  const nextTask = useMemo(() => {
    const withDate = activeTasks.filter((task) => task.earliest_start);

    if (withDate.length > 0) {
      return [...withDate].sort((a, b) => {
        return (
          new Date(a.earliest_start ?? '').getTime() -
          new Date(b.earliest_start ?? '').getTime()
        );
      })[0];
    }

    return activeTasks[0];
  }, [activeTasks]);

  const todayPlan = useMemo(() => {
    return activeTasks.slice(0, 5).map((task) => ({
      id: String(task.id ?? Math.random()),
      time: task.earliest_start
        ? new Date(task.earliest_start).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Anytime',
      title: task.title || 'Untitled task',
      place: task.location || 'No location',
      priority: task.priority ?? 0,
    }));
  }, [activeTasks]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const pending = activeTasks.length;

    if (pending === 0) return 'You’re all done 🎉';
    if (hour < 12) return 'Good morning ☀️';
    if (hour < 18) return 'Good afternoon 🌤️';
    return 'Good evening 🌙';
  };

  const planAccents = [theme.tint, theme.accent, theme.priorityMedium];

  return (
    <ScreenContainer scrollable>
      <Button
        label={theme.isDark ? 'Light Mode ☀️' : 'Dark Mode 🌙'}
        onPress={theme.toggleTheme}
        style={{ marginBottom: Spacing.sm }}
      />

      <View style={[styles.banner, { backgroundColor: theme.tint }]}>
        <Text style={styles.bannerGreeting}>{getGreeting()}</Text>
        <Text style={styles.bannerDate}>{today}</Text>

        <View style={styles.bannerChips}>
          {dashboardStats.map((stat, i) => (
            <View key={stat.label} style={styles.bannerChip}>
              <Text style={styles.bannerChipIcon}>{STAT_ICONS[i]}</Text>
              <Text style={styles.bannerChipValue}>{stat.value}</Text>
              <Text style={styles.bannerChipLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.progressWrap}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Daily progress</Text>
            <Text style={styles.progressText}>
              {completedCount}/{totalCount} completed
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: theme.accent,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {nextTask ? (
        <View
          style={[
            styles.nextTaskCard,
            Shadows.sm,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.nextTaskLabel, { color: theme.tint }]}>
            Next Task
          </Text>

          <Text style={[styles.nextTaskTitle, { color: theme.text }]}>
            {nextTask.title || 'Untitled task'}
          </Text>

          <Text style={[styles.nextTaskMeta, { color: theme.subtext }]}>
            {nextTask.earliest_start
              ? new Date(nextTask.earliest_start).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Anytime'}
          </Text>

          <Text style={[styles.nextTaskMeta, { color: theme.subtext }]}>
            📍 {nextTask.location || 'No location'}
          </Text>

          <Text style={[styles.nextTaskMeta, { color: theme.subtext }]}>
            Priority: {nextTask.priority ?? 0}
          </Text>
        </View>
      ) : null}

      <ActionCard
        title="Optimize today's route"
        description="Reorder tasks by time, priority, and location."
        buttonLabel="View schedule →"
        onPress={() => router.push('/(tabs)/schedule')}
        style={styles.actionCard}
      />

      <SectionHeader
        title="Today's plan"
        action={{
          label: 'See all',
          onPress: () => router.push('/(tabs)/tasks'),
        }}
      />

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" />
          <Text style={[styles.stateText, { color: theme.subtext }]}>
            Loading dashboard...
          </Text>
        </View>
      ) : todayPlan.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No tasks yet
          </Text>
          <Text style={[styles.stateText, { color: theme.subtext }]}>
            Add a few tasks to start building your day.
          </Text>

          <Button
            label="Add your first task"
            onPress={() => router.push('/(tabs)/tasks')}
            style={{ marginTop: Spacing.sm }}
          />
        </View>
      ) : (
        todayPlan.map((item, i) => (
          <View
            key={item.id}
            style={[
              styles.planCard,
              Shadows.sm,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                borderLeftColor: planAccents[i % planAccents.length],
              },
            ]}
          >
            <View style={styles.planLeft}>
              <Text
                style={[
                  styles.planTime,
                  { color: planAccents[i % planAccents.length] },
                ]}
              >
                {item.time}
              </Text>
            </View>

            <View style={styles.planRight}>
              <Text style={[styles.planTitle, { color: theme.text }]}>
                {item.title}
              </Text>

              <Text style={[styles.planPlace, { color: theme.subtext }]}>
                📍 {item.place}
              </Text>

              <Text style={[styles.planPriority, { color: theme.subtext }]}>
                Priority: {item.priority}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: -Spacing.md,
    marginTop: -Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl + 4,
    borderBottomRightRadius: BorderRadius.xl + 4,
    marginBottom: Spacing.lg,
  },
  bannerGreeting: {
    ...Typography.h2,
    color: 'white',
    marginBottom: 4,
  },
  bannerDate: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: Spacing.lg,
  },
  bannerChips: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  bannerChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
  },
  bannerChipIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  bannerChipValue: {
    ...Typography.h3,
    color: 'white',
  },
  bannerChipLabel: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 2,
  },
  progressWrap: {
    marginTop: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressTitle: {
    ...Typography.label,
    color: 'white',
    fontWeight: '700',
  },
  progressText: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.85)',
  },
  progressTrack: {
    height: 10,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  nextTaskCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  nextTaskLabel: {
    ...Typography.label,
    marginBottom: 6,
    fontWeight: '700',
  },
  nextTaskTitle: {
    ...Typography.h4,
    marginBottom: 6,
  },
  nextTaskMeta: {
    ...Typography.bodySm,
    marginBottom: 2,
  },
  actionCard: {
    marginBottom: Spacing.md,
  },
  planCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm + 2,
    overflow: 'hidden',
  },
  planLeft: {
    width: 80,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planTime: {
    ...Typography.label,
    fontWeight: '800',
    textAlign: 'center',
  },
  planRight: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingRight: Spacing.md,
    justifyContent: 'center',
  },
  planTitle: {
    ...Typography.h4,
    marginBottom: 3,
  },
  planPlace: {
    ...Typography.bodySm,
    marginBottom: 3,
  },
  planPriority: {
    ...Typography.bodySm,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    paddingHorizontal: Spacing.lg,
  },
  stateText: {
    ...Typography.bodySm,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  emptyState: {
    marginTop: 12,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.h4,
    marginBottom: 6,
  },
});