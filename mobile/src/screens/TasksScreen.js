import React, { useState } from 'react';
import { View, Button, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Collapsible } from '../components/ui/collapsible';
import { IconSymbol } from '../components/ui/icon-symbols';
import { ThemedView } from '../components/themed-view';
import { ThemedText } from '../components/themed-text';
import { Colors } from '../constants/theme';

const API_URL = "http://172.22.232.172:8000";

export default function TasksScreen() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const getOptimizedTasks = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      // Hardcoded coords for testing (Times Square)
      const lat = 40.7580;
      const lon = -73.9855;

      const response = await fetch(`${API_URL}/tasks/optimized?lat=${lat}&lon=${lon}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (response.ok) setTasks(data);
    } catch (error) {
      console.error("Failed to fetch optimized tasks", error);
    } finally {
      setLoading(false);
    }
  };

  const renderTask = ({ item, index }) => (
    <Collapsible title={`${index + 1}. ${item.title}`}>
      <ThemedText style={styles.detailText}>Priority: {item.priority}</ThemedText>
      <ThemedText style={styles.detailText}>Location: {item.location}</ThemedText>
      <IconSymbol name="house.fill" size={20} color={Colors.light.tint} style={{ marginTop: 5 }} />
    </Collapsible>
  );

  return (
    <ThemedView style={styles.container}>
      <Button title="Optimize My Day" onPress={getOptimizedTasks} color="#d32f2f" />
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          style={{ marginTop: 20 }}
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTask}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  detailText: {
    marginBottom: 5,
  },
});