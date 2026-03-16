import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TaskItem, Task, Priority } from '@/components/ui/TaskItem';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/hooks/use-theme';
import { Typography, Spacing } from '@/constants/theme';

export default function TasksScreen() {
  const theme = useTheme();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Grocery shopping', location: 'Trader Joe\'s', duration: '45 min', priority: 'High', notes: 'Buy fruits and milk' },
    { id: '2', title: 'Library study session', location: 'Hunter Library', duration: '2 hrs', priority: 'Medium', notes: 'Review database notes' },
    { id: '3', title: 'Pick up package', location: 'UPS Store', duration: '20 min', priority: 'Low', notes: 'Bring ID' },
  ]);

  const resetForm = () => {
    setTitle(''); setLocation(''); setDuration(''); setNotes('');
    setPriority('Medium'); setEditingId(null);
  };

  const priorityColor = (p: Priority) => ({
    High: theme.priorityHigh,
    Medium: theme.priorityMedium,
    Low: theme.priorityLow,
  })[p];

  const handleSave = () => {
    if (!title.trim()) return;
    const newTask: Task = {
      id: editingId ?? String(Date.now()),
      title: title.trim(),
      location: location.trim() || 'New destination',
      duration: duration.trim() || '30 min',
      notes: notes.trim(),
      priority,
    };
    if (editingId) {
      setTasks((prev) => prev.map((t) => (t.id === editingId ? newTask : t)));
    } else {
      setTasks((prev) => [newTask, ...prev]);
    }
    resetForm();
  };

  const handleEdit = (task: Task) => {
    setTitle(task.title); setLocation(task.location); setDuration(task.duration);
    setNotes(task.notes ?? ''); setPriority(task.priority); setEditingId(task.id);
  };

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) resetForm();
  };

  return (
    <ScreenContainer avoidKeyboard>
      <Header title="Tasks" subtitle="Add, edit, and organize your tasks." />

      {/* Form card */}
      <Card>
        <Text style={[styles.formTitle, { color: theme.text }]}>
          {editingId ? 'Edit Task' : 'New Task'}
        </Text>

        <Input
          placeholder="Task title"
          value={title}
          onChangeText={setTitle}
        />
        <Input
          placeholder="Destination / location"
          value={location}
          onChangeText={setLocation}
        />
        <Input
          placeholder="Duration (e.g. 45 min)"
          value={duration}
          onChangeText={setDuration}
        />
        <Input
          placeholder="Notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          style={styles.notesInput}
        />

        <Text style={[styles.label, { color: theme.text }]}>Priority</Text>
        <View style={styles.priorityRow}>
          {(['High', 'Medium', 'Low'] as Priority[]).map((item) => (
            <Pressable key={item} onPress={() => setPriority(item)}>
              <Badge
                label={item}
                color={priorityColor(item)}
                variant={priority === item ? 'solid' : 'outline'}
              />
            </Pressable>
          ))}
        </View>

        <View style={styles.formActions}>
          <Button
            label={editingId ? 'Update Task' : 'Add Task'}
            onPress={handleSave}
            fullWidth
          />
          {editingId && (
            <Button
              label="Cancel"
              variant="secondary"
              onPress={resetForm}
            />
          )}
        </View>
      </Card>

      {/* Task list */}
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  formTitle: {
    ...Typography.h3,
    marginBottom: Spacing.sm + 4,
  },
  label: {
    ...Typography.caption,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
});
