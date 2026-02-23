import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

type Task = { id: string; title: string };

export default function TasksTab() {
  const router = useRouter();
  const [taskText, setTaskText] = useState("");
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Buy groceries (demo)" },
    { id: "2", title: "Pick up package (demo)" },
  ]);

  const addTask = () => {
    const t = taskText.trim();
    if (!t) return;
    setTasks([{ id: String(Date.now()), title: t }, ...tasks]);
    setTaskText("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Tasks</Text>

        <Pressable style={styles.smallBtn} onPress={() => router.replace("/login")}>
          <Text style={styles.smallBtnText}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Add a task..."
          placeholderTextColor="#888"
          value={taskText}
          onChangeText={setTaskText}
        />
        <Pressable style={styles.addBtn} onPress={addTask}>
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardText}>{item.title}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "black" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 24, fontWeight: "800", color: "white" },
  row: { flexDirection: "row", gap: 8, marginBottom: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#444",
    padding: 12,
    borderRadius: 12,
    color: "white",
  },
  addBtn: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
  },
  addBtnText: { color: "black", fontWeight: "800" },
  card: {
    borderWidth: 1,
    borderColor: "#333",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  cardText: { fontSize: 16, color: "white" },
  smallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#444",
  },
  smallBtnText: { fontWeight: "700", color: "white" },
});