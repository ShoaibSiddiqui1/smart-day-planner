import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

import { useTheme } from '@/hooks/use-theme';
import { Typography, Spacing, BorderRadius } from '@/constants/theme';

import { taskApi, scheduleApi } from '@/services/api';

type Task = {
  id: number;
  title: string;
  location: string;
  duration_minutes?: number;
  priority?: number;
  earliest_start?: string;
  latest_end?: string;
  latitude?: number | null;
  longitude?: number | null;
  status?: string;
};

export default function TasksScreen() {
  const theme = useTheme();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('30');
  const [priority, setPriority] = useState(3);
  const [showTimeWindow, setShowTimeWindow] = useState(false);
  const [earliestStart, setEarliestStart] = useState('');
  const [latestEnd, setLatestEnd] = useState('');

  const [loading, setLoading] = useState(true);
  const [addingTask, setAddingTask] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = async (showSpinner = false) => {
    try {
      if (showSpinner) setLoading(true);

      const token = await AsyncStorage.getItem('token');
      console.log('TOKEN (tasks):', token);

      if (!token) {
        console.log('No token found, skipping tasks request');
        setTasks([]);
        return;
      }

      const data = await taskApi.getAll();
      console.log('TASKS RESPONSE:', data);

      if (!Array.isArray(data)) {
        console.error('Invalid tasks response:', data);
        setTasks([]);
        return;
      }

      setTasks(data);
    } catch (err) {
      console.error('Load tasks error:', err);
      setTasks([]);
      Alert.alert('Error', 'Failed to load tasks.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddTask = async () => {
    const trimmedTitle = title.trim();
    const trimmedLocation = location.trim();
    const parsedDuration = parseInt(duration.trim(), 10);

    if (!trimmedTitle || !trimmedLocation) {
      Alert.alert('Missing info', 'Please enter both a task title and a location.');
      return;
    }

    if (!parsedDuration || parsedDuration <= 0) {
      Alert.alert('Invalid duration', 'Please enter a valid duration in minutes.');
      return;
    }

    try {
      setAddingTask(true);
      console.log('Creating task...');

      // Parse optional time window fields (HH:MM → today's ISO datetime)
      const toISODateTime = (timeStr: string): string | undefined => {
        if (!timeStr.trim()) return undefined;
        const today = new Date().toISOString().split('T')[0];
        return `${today}T${timeStr.trim()}:00`;
      };

      await taskApi.create({
        title: trimmedTitle,
        location: trimmedLocation,
        duration_minutes: parsedDuration,
        priority,
        earliest_start: toISODateTime(earliestStart),
        latest_end: toISODateTime(latestEnd),
      });

      console.log('Task created successfully');

      try {
        console.log('Generating schedule...');
        await scheduleApi.generate();
        console.log('Schedule generated successfully');
      } catch (scheduleErr) {
        console.error('Schedule generation error:', scheduleErr);
      }

      setTitle('');
      setLocation('');
      setDuration('30');
      setPriority(3);
      setEarliestStart('');
      setLatestEnd('');
      setShowTimeWindow(false);
      Keyboard.dismiss();

      await loadTasks();
    } catch (err) {
      console.error('Create task error:', err);
      Alert.alert(
        'Could not add task',
        'Please use a real address or place name like "Times Square, New York" or "Hunter College, New York".'
      );
    } finally {
      setAddingTask(false);
    }
  };

  const handleDeleteTask = async (id: number) => {
    const doDelete = async () => {
      try {
        console.log('Deleting task:', id);
        await taskApi.delete(id);
        setTasks((prev) => prev.filter((task) => task.id !== id));
        try {
          await scheduleApi.generate();
        } catch (scheduleErr) {
          console.error('Schedule regenerate error:', scheduleErr);
        }
        await loadTasks();
      } catch (err) {
        console.error('Delete task error:', err);
        if (Platform.OS === 'web') {
          window.alert('Could not delete the task.');
        } else {
          Alert.alert('Delete failed', 'Could not delete the task.');
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this task?')) {
        await doDelete();
      }
    } else {
      Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const handleCompleteTask = async (id: number) => {
  try {
    console.log('Completing task:', id);

    await taskApi.update(id, { status: 'completed' });

    // remove from UI immediately
    setTasks((prev) => prev.filter((task) => task.id !== id));

    // regenerate schedule
    try {
      await scheduleApi.generate();
    } catch (err) {
      console.error('Schedule regenerate error:', err);
    }

  } catch (err) {
    console.error('Complete task error:', err);
    Alert.alert('Error', 'Could not complete task.');
  }
};

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
  };

  useEffect(() => {
    loadTasks(true);
  }, []);

  const renderTask = ({ item }: { item: Task }) => {
    const hasCoordinates =
      item.latitude !== null &&
      item.latitude !== undefined &&
      item.longitude !== null &&
      item.longitude !== undefined;

    return (
      <Card
        style={[
          styles.taskCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>

        <Text style={[styles.meta, { color: theme.subtext }]}>📍 {item.location}</Text>

        <Text style={[styles.meta, { color: theme.subtext }]}>
          ⏱ {item.duration_minutes ?? 30} min
        </Text>

        <Text style={[styles.meta, { color: theme.subtext }]}>
          {'⭐'.repeat(item.priority ?? 1)}{'☆'.repeat(5 - (item.priority ?? 1))} Priority {item.priority ?? 1}
        </Text>

        {(item.earliest_start || item.latest_end) && (
          <Text style={[styles.meta, { color: theme.subtext }]}>
            🕐 {item.earliest_start ? item.earliest_start.slice(11, 16) : '--:--'} → {item.latest_end ? item.latest_end.slice(11, 16) : '--:--'}
          </Text>
        )}

        <Text
          style={[
            styles.meta,
            {
              color: hasCoordinates ? theme.subtext : '#d97706',
            },
          ]}
        >
          {hasCoordinates ? '✅ Location recognized' : '⚠️ Location not recognized well'}
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: Spacing.sm }}>
          <Button
            label="Complete"
            onPress={() => handleCompleteTask(item.id)}
          />

          <Button
            label="Delete"
            variant="secondary"
            onPress={() => handleDeleteTask(item.id)}
          />
        </View>
      </Card>
    );
  };

  return (
    <ScreenContainer>
      <Header title="Tasks" subtitle="Manage your tasks" />

      <Card
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
      >
        <TextInput
          placeholder="Task title"
          placeholderTextColor={theme.subtext}
          value={title}
          onChangeText={setTitle}
          style={[
            styles.input,
            {
              color: theme.text,
              borderColor: theme.border,
              backgroundColor: theme.background,
            },
          ]}
        />

        <TextInput
          placeholder="Address or place name (e.g. Times Square, New York)"
          placeholderTextColor={theme.subtext}
          value={location}
          onChangeText={setLocation}
          style={[
            styles.input,
            {
              color: theme.text,
              borderColor: theme.border,
              backgroundColor: theme.background,
            },
          ]}
        />

        <TextInput
          placeholder="Duration in minutes (e.g. 60)"
          placeholderTextColor={theme.subtext}
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          style={[
            styles.input,
            {
              color: theme.text,
              borderColor: theme.border,
              backgroundColor: theme.background,
            },
          ]}
        />

        {/* Priority selector */}
        <Text style={[styles.fieldLabel, { color: theme.subtext }]}>Priority</Text>
        <View style={styles.priorityRow}>
          {[1, 2, 3, 4, 5].map((level) => (
            <TouchableOpacity
              key={level}
              onPress={() => setPriority(level)}
              style={[
                styles.priorityBtn,
                {
                  backgroundColor: priority === level ? theme.tint : theme.background,
                  borderColor: priority === level ? theme.tint : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.priorityBtnText,
                  { color: priority === level ? '#fff' : theme.subtext },
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
          <Text style={[styles.priorityHint, { color: theme.subtext }]}>
            {priority === 1 ? 'Low' : priority === 2 ? 'Medium-Low' : priority === 3 ? 'Medium' : priority === 4 ? 'High' : 'Urgent'}
          </Text>
        </View>

        {/* Time window toggle */}
        <TouchableOpacity
          onPress={() => setShowTimeWindow((v) => !v)}
          style={styles.timeWindowToggle}
        >
          <Text style={[styles.timeWindowToggleText, { color: theme.tint }]}>
            {showTimeWindow ? '▲ Hide time window' : '▼ Set time window (optional)'}
          </Text>
        </TouchableOpacity>

        {showTimeWindow && (
          <View style={styles.timeWindowRow}>
            <View style={styles.timeWindowField}>
              <Text style={[styles.fieldLabel, { color: theme.subtext }]}>Earliest start</Text>
              <TextInput
                placeholder="HH:MM"
                placeholderTextColor={theme.subtext}
                value={earliestStart}
                onChangeText={setEarliestStart}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                style={[
                  styles.input,
                  styles.timeInput,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                  },
                ]}
              />
            </View>
            <View style={styles.timeWindowField}>
              <Text style={[styles.fieldLabel, { color: theme.subtext }]}>Latest end</Text>
              <TextInput
                placeholder="HH:MM"
                placeholderTextColor={theme.subtext}
                value={latestEnd}
                onChangeText={setLatestEnd}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                style={[
                  styles.input,
                  styles.timeInput,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                  },
                ]}
              />
            </View>
          </View>
        )}

        <Button
          label={addingTask ? 'Adding...' : 'Add Task'}
          onPress={handleAddTask}
        />
      </Card>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" />
          <Text style={[styles.stateText, { color: theme.subtext }]}>
            Loading tasks...
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderTask}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            tasks.length === 0 ? styles.emptyListContainer : styles.listContainer
          }
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No tasks yet
              </Text>
              <Text style={[styles.stateText, { color: theme.subtext }]}>
                Add a task with a real place name or address.
              </Text>
            </View>
          }
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  listContainer: {
    paddingBottom: Spacing.xl,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: Spacing.xl,
  },
  taskCard: {
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.h4,
    marginBottom: 4,
  },
  meta: {
    ...Typography.bodySm,
    marginBottom: 4,
  },
  deleteButtonWrap: {
    marginTop: Spacing.sm,
  },
  fieldLabel: {
    ...Typography.caption,
    marginBottom: 4,
    marginTop: Spacing.xs,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  priorityBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityBtnText: {
    ...Typography.label,
    fontWeight: '600',
  },
  priorityHint: {
    ...Typography.caption,
    marginLeft: 4,
  },
  timeWindowToggle: {
    marginBottom: Spacing.sm,
  },
  timeWindowToggleText: {
    ...Typography.bodySm,
  },
  timeWindowRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  timeWindowField: {
    flex: 1,
  },
  timeInput: {
    marginBottom: 0,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
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