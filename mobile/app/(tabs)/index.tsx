import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { ActionCard } from '@/components/ui/ActionCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';

import { useTheme } from '@/hooks/use-theme';
import { Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { taskApi } from '@/services/api';

type Task = {
  id?: number;
  title?: string;
  location?: string;
  priority?: number;
  duration_minutes?: number;
  earliest_start?: string;
  latest_end?: string;
};

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

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const data = await taskApi.getAll();
        console.log('DASHBOARD TASKS:', data);

        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          setTasks([]);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const dashboardStats = useMemo(() => {
    const totalTasks = tasks.length;
    const highPriorityTasks = tasks.filter((task) => (task.priority ?? 0) >= 2).length;
    const totalDuration = tasks.reduce(
      (sum, task) => sum + (task.duration_minutes ?? 0),
      0
    );

    return [
      { label: 'Today Tasks', value: String(totalTasks) },
      { label: 'High Priority', value: String(highPriorityTasks) },
      { label: 'Planned Time', value: `${totalDuration}m` },
    ];
  }, [tasks]);

  const todayPlan = useMemo(() => {
    return tasks.slice(0, 5).map((task) => ({
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
  }, [tasks]);

  const getGreeting = () => {
    const hour = new Date().getHours();

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
      </View>

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
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No tasks yet</Text>
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