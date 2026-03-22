import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Typography, Spacing, BorderRadius } from '@/constants/theme';
import { mapStops } from '@/constants/mockData';

export default function MapScreen() {
  const theme = useTheme();
  const scheme = useColorScheme() ?? 'light';

  return (
    <ScreenContainer>
      <Header title="Route Map" subtitle="Preview your optimized route for the day." />

      {/* Hero summary */}
      <Card style={[styles.heroCard, { backgroundColor: theme.tint, borderColor: 'transparent' }]}>
        <Text style={styles.heroLabel}>Today's optimized route</Text>
        <Text style={styles.heroBig}>12.4 miles · 3 stops</Text>
        <Text style={styles.heroText}>Estimated time saved: 45 minutes with improved task ordering.</Text>
      </Card>

      {/* Map placeholder */}
      <Card noPad style={styles.mapCard}>
        <View style={[styles.fakeMap, { backgroundColor: scheme === 'dark' ? '#0B1220' : '#DBEAFE' }]}>
          <View style={[styles.streetH, { backgroundColor: scheme === 'dark' ? '#1E293B' : '#BFDBFE' }]} />
          <View style={[styles.streetV, { backgroundColor: scheme === 'dark' ? '#1E293B' : '#BFDBFE' }]} />
          <View style={[styles.routeA, { backgroundColor: theme.tint }]} />
          <View style={[styles.routeB, { backgroundColor: theme.accent }]} />
          {[
            { style: styles.pinA, color: theme.tint, n: '1' },
            { style: styles.pinB, color: theme.accent, n: '2' },
            { style: styles.pinC, color: theme.priorityHigh, n: '3' },
          ].map(({ style, color, n }) => (
            <View key={n} style={[styles.pin, style, { backgroundColor: color }]}>
              <Text style={styles.pinText}>{n}</Text>
            </View>
          ))}
          <View style={[styles.youAreHere, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.youAreHereText, { color: theme.text }]}>You are here</Text>
          </View>
        </View>

        {/* Stat row */}
        <View style={styles.statRow}>
          {[
            { value: '12.4 mi', label: 'Distance', color: theme.tint },
            { value: '45 min', label: 'Saved', color: theme.accent },
            { value: '3', label: 'Stops', color: theme.priorityHigh },
          ].map(({ value, label, color }) => (
            <View key={label} style={[styles.statBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Text style={[styles.statValue, { color }]}>{value}</Text>
              <Text style={[styles.statLabel, { color: theme.subtext }]}>{label}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Next stop */}
      <SectionHeader title="Next destination" />
      <Card>
        <Text style={[styles.nextTime, { color: theme.tint }]}>Next at 9:00 AM</Text>
        <Text style={[styles.nextTitle, { color: theme.text }]}>Hunter College</Text>
        <Text style={[styles.nextAddr, { color: theme.subtext }]}>695 Park Ave</Text>
      </Card>

      {/* Stop order */}
      <SectionHeader title="Stop order" />
      {mapStops.map((stop) => (
        <Card key={stop.id} style={styles.stopCard}>
          <View style={[styles.stopBadge, { backgroundColor: theme.tint }]}>
            <Text style={styles.stopBadgeText}>{stop.order}</Text>
          </View>
          <View style={styles.stopBody}>
            <View style={styles.stopTopRow}>
              <Text style={[styles.stopTitle, { color: theme.text }]}>{stop.title}</Text>
              <Badge label={stop.type} color={theme.subtext} variant="outline" />
            </View>
            <Text style={[styles.stopAddr, { color: theme.subtext }]}>{stop.address}</Text>
            <Text style={[styles.stopEta, { color: theme.tint }]}>ETA: {stop.eta}</Text>
          </View>
        </Card>
      ))}

      {/* Actions */}
      <View style={styles.btnRow}>
        <Button label="Recalculate" variant="secondary" style={styles.halfBtn} />
        <Button label="Open navigation" fullWidth style={styles.halfBtn} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: { marginBottom: Spacing.md },
  heroLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.8)', marginBottom: Spacing.xs },
  heroBig: { ...Typography.h1, color: 'white', marginBottom: Spacing.xs },
  heroText: { ...Typography.body, color: 'rgba(255,255,255,0.85)' },

  mapCard: { marginBottom: Spacing.md, overflow: 'hidden' },
  fakeMap: { height: 240, position: 'relative' },
  streetH: { position: 'absolute', top: 95, left: 0, right: 0, height: 16 },
  streetV: { position: 'absolute', left: 128, top: 0, bottom: 0, width: 16 },
  routeA: { position: 'absolute', width: 136, height: 4, top: 75, left: 62, borderRadius: BorderRadius.full, transform: [{ rotate: '25deg' }] },
  routeB: { position: 'absolute', width: 124, height: 4, top: 116, left: 148, borderRadius: BorderRadius.full, transform: [{ rotate: '-18deg' }] },
  pin: { position: 'absolute', width: 28, height: 28, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'white' },
  pinText: { color: 'white', fontWeight: '800', fontSize: 11 },
  pinA: { top: 52, left: 50 },
  pinB: { top: 112, left: 158 },
  pinC: { top: 68, right: 46 },
  youAreHere: { position: 'absolute', left: 12, bottom: 12, borderWidth: 1, borderRadius: BorderRadius.full, paddingHorizontal: 10, paddingVertical: 6 },
  youAreHereText: { ...Typography.label },

  statRow: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.sm + 4 },
  statBox: { flex: 1, borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.sm + 4 },
  statValue: { ...Typography.h3, marginBottom: 2 },
  statLabel: { ...Typography.label },

  nextTime: { ...Typography.caption, fontWeight: '700', marginBottom: Spacing.xs },
  nextTitle: { ...Typography.h3, marginBottom: 2 },
  nextAddr: { ...Typography.bodySm },

  stopCard: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  stopBadge: { width: 32, height: 32, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  stopBadgeText: { color: 'white', fontWeight: '800', fontSize: 13 },
  stopBody: { flex: 1 },
  stopTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  stopTitle: { ...Typography.h4, flex: 1 },
  stopAddr: { ...Typography.bodySm, marginBottom: 2 },
  stopEta: { ...Typography.caption, fontWeight: '700' },

  btnRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  halfBtn: { flex: 1 },
});
