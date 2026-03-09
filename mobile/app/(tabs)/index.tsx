import { SafeAreaView, ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { dashboardStats, todayPlan } from '@/constants/mockData';

export default function DashboardScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const statColors = [theme.tint, theme.priorityHigh, theme.accent];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.greeting, { color: theme.subtext }]}>Good day</Text>
        <Text style={[styles.title, { color: theme.text }]}>Smart Day Planner</Text>

        <View style={styles.statsRow}>
          {dashboardStats.map((item, index) => (
            <View key={item.label} style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.statValue, { color: statColors[index] }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: theme.subtext }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.heroCard, { backgroundColor: theme.tint }]}>
          <Text style={styles.heroTitle}>Optimize today’s route</Text>
          <Text style={styles.heroText}>
            Reorder tasks by time, priority, and location to save time and reduce travel.
          </Text>
          <Pressable style={styles.heroButton} onPress={() => router.push('/(tabs)/schedule')}>
            <Text style={styles.heroButtonText}>View optimized schedule</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Today’s plan</Text>
          <Pressable onPress={() => router.push('/(tabs)/tasks')}>
            <Text style={[styles.link, { color: theme.tint }]}>See all</Text>
          </Pressable>
        </View>

        {todayPlan.map((item) => (
          <View key={item.time} style={[styles.planCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.planTime, { color: theme.tint }]}>{item.time}</Text>
            <Text style={[styles.planTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.planPlace, { color: theme.subtext }]}>{item.place}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 18, paddingBottom: 120 },
  greeting: { fontSize: 15, marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 13, fontWeight: '500' },
  heroCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
  },
  heroTitle: { color: 'white', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  heroText: { color: 'white', fontSize: 14, lineHeight: 20, marginBottom: 14 },
  heroButton: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  heroButtonText: { color: '#2563EB', fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  link: { fontWeight: '700' },
  planCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  planTime: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  planTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  planPlace: { fontSize: 14 },
});