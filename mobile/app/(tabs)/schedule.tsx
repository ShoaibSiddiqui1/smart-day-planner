import { SafeAreaView, ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { scheduleData } from '@/constants/mockData';

export default function ScheduleScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>Optimized Schedule</Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>
          Your suggested order based on time, task priority, and route efficiency.
        </Text>

        <View style={[styles.summaryCard, { backgroundColor: theme.tint }]}>
          <Text style={styles.summaryTitle}>Today’s optimization</Text>
          <Text style={styles.summaryTime}>45 minutes saved</Text>
          <Text style={styles.summaryText}>
            Your route is reordered to reduce travel time and improve productivity.
          </Text>

          <View style={styles.pillRow}>
            <View style={styles.whitePill}>
              <Text style={styles.whitePillText}>3 locations</Text>
            </View>
            <View style={styles.whitePill}>
              <Text style={styles.whitePillText}>4 events</Text>
            </View>
          </View>
        </View>

        {scheduleData.map((item) => (
          <View key={item.time} style={styles.timelineRow}>
            <View style={styles.leftCol}>
              <Text style={[styles.time, { color: theme.tint }]}>{item.time}</Text>
              <View style={[styles.dot, { backgroundColor: theme.tint }]} />
              <View style={[styles.line, { backgroundColor: theme.border }]} />
            </View>

            <View style={[styles.eventCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.eventTitle, { color: theme.text }]}>{item.task}</Text>
              <Text style={[styles.eventSubtext, { color: theme.subtext }]}>{item.location}</Text>
              <Text style={[styles.eventSubtext, { color: theme.subtext }]}>{item.duration}</Text>
            </View>
          </View>
        ))}

        <Pressable style={[styles.footerBtn, { backgroundColor: theme.accent }]}>
          <Text style={styles.footerBtnText}>Send reminder notifications later</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 18, paddingBottom: 120 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 15, marginBottom: 16 },
  summaryCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 22,
  },
  summaryTitle: { color: 'white', fontSize: 16, fontWeight: '700' },
  summaryTime: { color: 'white', fontSize: 30, fontWeight: '800', marginVertical: 6 },
  summaryText: { color: 'white', fontSize: 14, lineHeight: 20, marginBottom: 14 },
  pillRow: { flexDirection: 'row', gap: 10 },
  whitePill: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  whitePillText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 12,
  },
  timelineRow: { flexDirection: 'row', alignItems: 'stretch', marginBottom: 14 },
  leftCol: { width: 70, alignItems: 'center' },
  time: { fontWeight: '800', fontSize: 13, marginBottom: 8 },
  dot: { width: 12, height: 12, borderRadius: 999, marginBottom: 4 },
  line: { width: 2, flex: 1 },
  eventCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  eventTitle: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  eventSubtext: { fontSize: 14, marginBottom: 3 },
  footerBtn: {
    marginTop: 6,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  footerBtnText: { color: 'white', fontWeight: '800', fontSize: 15 },
});