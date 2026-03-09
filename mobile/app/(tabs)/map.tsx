import { SafeAreaView, ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { mapStops } from '@/constants/mockData';

export default function MapScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>Route Map</Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>
          Preview your optimized route and task order for the day.
        </Text>

        <View style={[styles.topSummaryCard, { backgroundColor: theme.tint }]}>
          <Text style={styles.topSummaryTitle}>Today’s optimized route</Text>
          <Text style={styles.topSummaryBig}>12.4 miles • 3 stops</Text>
          <Text style={styles.topSummaryText}>
            Estimated time saved: 45 minutes with improved task ordering.
          </Text>
        </View>

        <View style={[styles.mapCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.fakeMap, { backgroundColor: scheme === 'dark' ? '#0B1220' : '#DBEAFE' }]}>
            <View style={[styles.streetHorizontal, { backgroundColor: scheme === 'dark' ? '#1E293B' : '#BFDBFE' }]} />
            <View style={[styles.streetVertical, { backgroundColor: scheme === 'dark' ? '#1E293B' : '#BFDBFE' }]} />

            <View style={[styles.routeLineOne, { backgroundColor: theme.tint }]} />
            <View style={[styles.routeLineTwo, { backgroundColor: theme.accent }]} />

            <View style={[styles.pin, styles.pinOne, { backgroundColor: theme.tint }]}>
              <Text style={styles.pinText}>1</Text>
            </View>
            <View style={[styles.pin, styles.pinTwo, { backgroundColor: theme.accent }]}>
              <Text style={styles.pinText}>2</Text>
            </View>
            <View style={[styles.pin, styles.pinThree, { backgroundColor: theme.priorityHigh }]}>
              <Text style={styles.pinText}>3</Text>
            </View>

            <View style={[styles.currentLocation, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.currentLocationText, { color: theme.text }]}>You are here</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={[styles.summaryBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Text style={[styles.summaryValue, { color: theme.tint }]}>12.4 mi</Text>
              <Text style={[styles.summaryLabel, { color: theme.subtext }]}>Distance</Text>
            </View>
            <View style={[styles.summaryBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Text style={[styles.summaryValue, { color: theme.accent }]}>45 min</Text>
              <Text style={[styles.summaryLabel, { color: theme.subtext }]}>Saved</Text>
            </View>
            <View style={[styles.summaryBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Text style={[styles.summaryValue, { color: theme.priorityHigh }]}>3</Text>
              <Text style={[styles.summaryLabel, { color: theme.subtext }]}>Stops</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Next destination</Text>
          <Text style={[styles.sectionLink, { color: theme.tint }]}>Live route later</Text>
        </View>

        <View style={[styles.nextStopCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.nextStopTime, { color: theme.tint }]}>Next at 9:00 AM</Text>
          <Text style={[styles.nextStopTitle, { color: theme.text }]}>Hunter College</Text>
          <Text style={[styles.nextStopAddress, { color: theme.subtext }]}>695 Park Ave</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Stop order</Text>

        {mapStops.map((stop) => (
          <View key={stop.id} style={[styles.stopCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.stopBadge, { backgroundColor: theme.tint }]}>
              <Text style={styles.stopBadgeText}>{stop.order}</Text>
            </View>

            <View style={styles.stopContent}>
              <View style={styles.stopTopRow}>
                <Text style={[styles.stopTitle, { color: theme.text }]}>{stop.title}</Text>
                <View style={[styles.typeChip, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Text style={[styles.typeChipText, { color: theme.subtext }]}>{stop.type}</Text>
                </View>
              </View>

              <Text style={[styles.stopAddress, { color: theme.subtext }]}>{stop.address}</Text>
              <Text style={[styles.stopEta, { color: theme.tint }]}>ETA: {stop.eta}</Text>
            </View>
          </View>
        ))}

        <View style={styles.buttonRow}>
          <Pressable style={[styles.secondaryBtn, { borderColor: theme.border, backgroundColor: theme.card }]}>
            <Text style={[styles.secondaryBtnText, { color: theme.text }]}>Recalculate</Text>
          </Pressable>

          <Pressable style={[styles.primaryBtn, { backgroundColor: theme.tint }]}>
            <Text style={styles.primaryBtnText}>Open navigation</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 18, paddingBottom: 120 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 15, marginBottom: 16 },

  topSummaryCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },
  topSummaryTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  topSummaryBig: {
    color: 'white',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  topSummaryText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
  },

  mapCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    marginBottom: 20,
  },
  fakeMap: {
    height: 260,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
  },
  streetHorizontal: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    height: 18,
  },
  streetVertical: {
    position: 'absolute',
    left: 130,
    top: 0,
    bottom: 0,
    width: 18,
  },
  routeLineOne: {
    position: 'absolute',
    width: 140,
    height: 5,
    top: 78,
    left: 65,
    transform: [{ rotate: '25deg' }],
    borderRadius: 999,
  },
  routeLineTwo: {
    position: 'absolute',
    width: 130,
    height: 5,
    top: 120,
    left: 150,
    transform: [{ rotate: '-18deg' }],
    borderRadius: 999,
  },
  pin: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  pinText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 12,
  },
  pinOne: { top: 55, left: 52 },
  pinTwo: { top: 115, left: 160 },
  pinThree: { top: 72, right: 48 },

  currentLocation: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  currentLocationText: {
    fontSize: 12,
    fontWeight: '700',
  },

  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  summaryValue: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  summaryLabel: { fontSize: 12, fontWeight: '600' },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  sectionLink: { fontSize: 13, fontWeight: '700' },

  nextStopCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  nextStopTime: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  nextStopTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  nextStopAddress: {
    fontSize: 14,
  },

  stopCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
  },
  stopBadge: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stopBadgeText: { color: 'white', fontWeight: '800' },
  stopContent: { flex: 1 },
  stopTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
    alignItems: 'center',
  },
  stopTitle: { fontSize: 16, fontWeight: '800', flex: 1 },
  stopAddress: { fontSize: 14, marginBottom: 4 },
  stopEta: { fontSize: 13, fontWeight: '700' },
  typeChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '700',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontWeight: '800',
    fontSize: 15,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryBtnText: { color: 'white', fontWeight: '800', fontSize: 15 },
});