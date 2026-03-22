import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/use-theme';
import { Typography, Spacing, BorderRadius } from '@/constants/theme';
import { scheduleData } from '@/constants/mockData';

export default function ScheduleScreen() {
  const theme = useTheme();

  return (
    <ScreenContainer>
      <Header
        title="Optimized Schedule"
        subtitle="Suggested order based on time, priority, and route efficiency."
      />

      {/* Summary card */}
      <Card style={[styles.summaryCard, { backgroundColor: theme.tint, borderColor: 'transparent' }]}>
        <Text style={styles.summaryLabel}>Today's optimization</Text>
        <Text style={styles.summaryValue}>45 min saved</Text>
        <Text style={styles.summaryText}>
          Your route is reordered to reduce travel time and improve productivity.
        </Text>
        <View style={styles.pillRow}>
          <View style={styles.pill}><Text style={[styles.pillText, { color: theme.tint }]}>3 locations</Text></View>
          <View style={styles.pill}><Text style={[styles.pillText, { color: theme.tint }]}>4 events</Text></View>
        </View>
      </Card>

      {/* Timeline */}
      {scheduleData.map((item, index) => (
        <View key={item.time} style={styles.timelineRow}>
          {/* Left column — time + connector */}
          <View style={styles.leftCol}>
            <Text style={[styles.time, { color: theme.tint }]}>{item.time}</Text>
            <View style={[styles.dot, { backgroundColor: theme.tint }]} />
            {index < scheduleData.length - 1 && (
              <View style={[styles.line, { backgroundColor: theme.border }]} />
            )}
          </View>

          {/* Event card */}
          <Card style={styles.eventCard}>
            <Text style={[styles.eventTitle, { color: theme.text }]}>{item.task}</Text>
            <Text style={[styles.eventMeta, { color: theme.subtext }]}>{item.location}</Text>
            <Text style={[styles.eventMeta, { color: theme.subtext }]}>{item.duration}</Text>
          </Card>
        </View>
      ))}

      <Button
        label="Send reminder notifications"
        fullWidth
        style={[styles.footerBtn, { backgroundColor: theme.accent }]}
      />
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
    marginBottom: Spacing.md,
  },
  pillRow: { flexDirection: 'row', gap: Spacing.sm },
  pill: {
    backgroundColor: 'white',
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    ...Typography.label,
    fontWeight: '700',
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
    borderRadius: BorderRadius.lg,
  },
});
