import { SafeAreaView, ScrollView, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Priority = 'High' | 'Medium' | 'Low';

type Task = {
  id: string;
  title: string;
  location: string;
  duration: string;
  priority: Priority;
  notes?: string;
};

export default function TasksScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Grocery shopping', location: 'Trader Joe’s', duration: '45 min', priority: 'High', notes: 'Buy fruits and milk' },
    { id: '2', title: 'Library study session', location: 'Hunter Library', duration: '2 hrs', priority: 'Medium', notes: 'Review database notes' },
    { id: '3', title: 'Pick up package', location: 'UPS Store', duration: '20 min', priority: 'Low', notes: 'Bring ID' },
  ]);

  const resetForm = () => {
    setTitle('');
    setLocation('');
    setDuration('');
    setNotes('');
    setPriority('Medium');
    setEditingId(null);
  };

  const getPriorityColor = (value: Priority) => {
    if (value === 'High') return theme.priorityHigh;
    if (value === 'Medium') return theme.priorityMedium;
    return theme.priorityLow;
  };

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
      setTasks((prev) => prev.map((task) => (task.id === editingId ? newTask : task)));
    } else {
      setTasks((prev) => [newTask, ...prev]);
    }

    resetForm();
  };

  const handleEdit = (task: Task) => {
    setTitle(task.title);
    setLocation(task.location);
    setDuration(task.duration);
    setNotes(task.notes ?? '');
    setPriority(task.priority);
    setEditingId(task.id);
  };

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    if (editingId === id) resetForm();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>Tasks</Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>
          Add, edit, delete, and organize your tasks.
        </Text>

        <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.formTitle, { color: theme.text }]}>
            {editingId ? 'Edit Task' : 'Create New Task'}
          </Text>

          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
            placeholder="Task title"
            placeholderTextColor={theme.subtext}
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
            placeholder="Destination / location"
            placeholderTextColor={theme.subtext}
            value={location}
            onChangeText={setLocation}
          />

          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
            placeholder="Duration (example: 45 min)"
            placeholderTextColor={theme.subtext}
            value={duration}
            onChangeText={setDuration}
          />

          <TextInput
            style={[styles.input, styles.notesInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
            placeholder="Notes"
            placeholderTextColor={theme.subtext}
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <Text style={[styles.label, { color: theme.text }]}>Priority</Text>
          <View style={styles.priorityRow}>
            {(['High', 'Medium', 'Low'] as Priority[]).map((item) => {
              const active = priority === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setPriority(item)}
                  style={[
                    styles.priorityBtn,
                    {
                      borderColor: getPriorityColor(item),
                      backgroundColor: active ? getPriorityColor(item) : 'transparent',
                    },
                  ]}>
                  <Text style={[styles.priorityBtnText, { color: active ? 'white' : getPriorityColor(item) }]}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.formActions}>
            <Pressable style={[styles.saveBtn, { backgroundColor: theme.tint }]} onPress={handleSave}>
              <Text style={styles.saveBtnText}>{editingId ? 'Update Task' : 'Add Task'}</Text>
            </Pressable>

            {editingId && (
              <Pressable style={[styles.cancelBtn, { borderColor: theme.border }]} onPress={resetForm}>
                <Text style={[styles.cancelBtnText, { color: theme.text }]}>Cancel</Text>
              </Pressable>
            )}
          </View>
        </View>

        {tasks.map((task) => (
          <View key={task.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.cardTop}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{task.title}</Text>
              <View style={[styles.badge, { backgroundColor: getPriorityColor(task.priority) }]}>
                <Text style={styles.badgeText}>{task.priority}</Text>
              </View>
            </View>

            <Text style={[styles.cardSubtext, { color: theme.subtext }]}>{task.location}</Text>
            <Text style={[styles.cardSubtext, { color: theme.subtext }]}>{task.duration}</Text>
            {!!task.notes && <Text style={[styles.cardNotes, { color: theme.text }]}>{task.notes}</Text>}

            <View style={styles.actionRow}>
              <Pressable style={[styles.smallAction, { borderColor: theme.border }]} onPress={() => handleEdit(task)}>
                <Text style={[styles.smallActionText, { color: theme.text }]}>Edit</Text>
              </Pressable>

              <Pressable style={[styles.smallAction, { borderColor: theme.border }]} onPress={() => handleDelete(task.id)}>
                <Text style={[styles.smallActionText, { color: theme.danger }]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 18, paddingBottom: 120 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 15, marginBottom: 16 },
  formCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
  },
  formTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  input: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  notesInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  priorityRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  priorityBtn: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  priorityBtnText: { fontWeight: '800', fontSize: 13 },
  formActions: { flexDirection: 'row', gap: 10 },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: 'white', fontWeight: '800' },
  cancelBtn: {
    borderWidth: 1,
    paddingHorizontal: 16,
    borderRadius: 14,
    justifyContent: 'center',
  },
  cancelBtnText: { fontWeight: '700' },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  cardTitle: { fontSize: 17, fontWeight: '800', flex: 1 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeText: { color: 'white', fontWeight: '700', fontSize: 12 },
  cardSubtext: { fontSize: 14, marginBottom: 4 },
  cardNotes: { fontSize: 14, marginTop: 6, lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  smallAction: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  smallActionText: { fontWeight: '700' },
});