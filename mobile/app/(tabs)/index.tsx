import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { ActionCard } from '@/components/ui/ActionCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useTheme } from '@/hooks/use-theme';
import { Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { dashboardStats, todayPlan } from '@/constants/mockData';

const STAT_ICONS = ['📋', '🔴', '⏱'];

export default function DashboardScreen() {
  const router = useRouter();
  const theme = useTheme();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const planAccents = [theme.tint, theme.accent, theme.priorityMedium];

  return (
    <ScreenContainer>
      {/* ── Full-bleed hero banner ── */}
      <View style={[styles.banner, { backgroundColor: theme.tint }]}>
        <Text style={styles.bannerGreeting}>Good morning ☀️</Text>
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

      {/* ── CTA card ── */}
      <ActionCard
        title="Optimize today's route"
        description="Reorder tasks by time, priority, and location to save time and reduce travel."
        buttonLabel="View schedule →"
        onPress={() => router.push('/(tabs)/schedule')}
        style={styles.actionCard}
      />

      {/* ── Today's plan ── */}
      <SectionHeader
        title="Today's plan"
        action={{ label: 'See all', onPress: () => router.push('/(tabs)/tasks') }}
      />

      {todayPlan.map((item, i) => (
        <View
          key={item.time}
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
            <Text style={[styles.planTime, { color: planAccents[i % planAccents.length] }]}>
              {item.time}
            </Text>
          </View>
          <View style={styles.planRight}>
            <Text style={[styles.planTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.planPlace, { color: theme.subtext }]}>📍 {item.place}</Text>
          </View>
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  /* Hero banner — breaks out of ScreenContainer's horizontal padding */
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

  /* Plan cards with thick left accent border */
  planCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm + 2,
    overflow: 'hidden',
  },
  planLeft: {
    width: 72,
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
  },
});
