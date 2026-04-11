import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';

import { useTheme } from '@/hooks/use-theme';
import { Typography, Spacing, BorderRadius } from '@/constants/theme';
import { scheduleApi, authApi } from '@/services/api';

type Coordinates = {
  latitude: number;
  longitude: number;
};

type Task = {
  id?: number;
  title?: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
};

type ScheduleItem = {
  id?: number;
  task?: Task;
  scheduled_start?: string;
  scheduled_end?: string;
};

type Schedule = {
  total_duration_minutes?: number;
  items?: ScheduleItem[];
};

type RouteStop = {
  key: string;
  coordinate: Coordinates;
  title: string;
  description: string;
  isHome: boolean;
};

const HOME_STORAGE_KEY = 'home_location';
const HOME_ADDRESS = '15-42 159th St, Whitestone, NY 11357';

const isValidCoordinate = (coords: any): coords is Coordinates => {
  return (
    coords &&
    typeof coords.latitude === 'number' &&
    typeof coords.longitude === 'number' &&
    coords.latitude >= -90 &&
    coords.latitude <= 90 &&
    coords.longitude >= -180 &&
    coords.longitude <= 180
  );
};

export default function MapScreen() {
  const theme = useTheme();
  const mapRef = useRef<MapView | null>(null);
  const hasLoadedRef = useRef(false);

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [homeLocation, setHomeLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingHome, setSettingHome] = useState(false);
  const [settingQueensHome, setSettingQueensHome] = useState(false);
  const [roadPolylineCoords, setRoadPolylineCoords] = useState<Coordinates[]>([]);

  const getCurrentLocation = async (): Promise<Coordinates | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Location permission needed',
          'Please allow location access to set your home location.'
        );
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Get current location error:', error);
      Alert.alert('Location error', 'Could not get your current location.');
      return null;
    }
  };

  const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
    try {
      const results = await Location.geocodeAsync(address);

      if (!results || results.length === 0) {
        console.log('No geocode results for address:', address);
        return null;
      }

      return {
        latitude: results[0].latitude,
        longitude: results[0].longitude,
      };
    } catch (error) {
      console.error('Geocode address error:', error);
      return null;
    }
  };

  const getHomeLocation = async (): Promise<Coordinates | null> => {
    try {
      const data = await AsyncStorage.getItem(HOME_STORAGE_KEY);
      if (!data) return null;

      const parsed = JSON.parse(data);
      return isValidCoordinate(parsed) ? parsed : null;
    } catch (error) {
      console.error('Get home location error:', error);
      return null;
    }
  };

  const saveHomeLocation = async (coords: Coordinates) => {
    try {
      await AsyncStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(coords));
      setHomeLocation(coords);
      console.log('Saved local home location:', coords);
    } catch (error) {
      console.error('Save home location error:', error);
      Alert.alert('Save failed', 'Could not save home location.');
    }
  };

  const saveHomeToBackendIfPossible = async (coords: Coordinates) => {
    try {
      await authApi.updateMe({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      console.log('Saved home to backend:', coords);
    } catch (error) {
      console.log('Backend home update skipped/failed:', error);
    }
  };

  const getQueensHomeCoordinates = useCallback(async (): Promise<Coordinates | null> => {
    const coords = await geocodeAddress(HOME_ADDRESS);
    console.log('QUEENS HOME GEOCODED:', coords);
    return coords;
  }, []);

  const getRoadRoute = async (stops: Coordinates[]): Promise<Coordinates[]> => {
    try {
      if (stops.length < 2) return stops;

      const coordinatesString = stops
        .map((stop) => `${stop.longitude},${stop.latitude}`)
        .join(';');

      const url = `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data?.routes || data.routes.length === 0) {
        console.log('OSRM route error:', data);
        return stops;
      }

      const geometry = data.routes[0]?.geometry?.coordinates;

      if (!geometry || !Array.isArray(geometry)) {
        return stops;
      }

      return geometry.map((point: [number, number]) => ({
        latitude: point[1],
        longitude: point[0],
      }));
    } catch (error) {
      console.error('Road route fetch error:', error);
      return stops;
    }
  };

  const resolveHomeLocation = useCallback(async (): Promise<Coordinates | null> => {
    try {
      const savedHome = await getHomeLocation();
      console.log('LOCAL HOME LOCATION:', savedHome);

      if (isValidCoordinate(savedHome)) {
        return savedHome;
      }

      try {
        const me = await authApi.getMe();
        console.log('USER PROFILE:', me);

        if (
          typeof me.latitude === 'number' &&
          typeof me.longitude === 'number'
        ) {
          const backendHome = {
            latitude: me.latitude,
            longitude: me.longitude,
          };

          if (isValidCoordinate(backendHome)) {
            await AsyncStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(backendHome));
            return backendHome;
          }
        }
      } catch (profileError) {
        console.log('Profile fetch failed:', profileError);
      }

      const queensHome = await getQueensHomeCoordinates();

      if (queensHome) {
        await AsyncStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(queensHome));
        await saveHomeToBackendIfPossible(queensHome);
        return queensHome;
      }

      return null;
    } catch (error) {
      console.error('Resolve home location error:', error);
      return null;
    }
  }, [getQueensHomeCoordinates]);

  const loadRoute = useCallback(async () => {
    try {
      setLoading(true);
      console.log('MAP LOAD START');

      await AsyncStorage.removeItem('home_location');
      
      const resolvedHome = await resolveHomeLocation();
      setHomeLocation(resolvedHome);
      console.log('FINAL HOME LOCATION:', resolvedHome);

      await scheduleApi.generate();
      const data = await scheduleApi.getLatest();

      console.log('MAP DATA:', data);

      data?.items?.forEach((item: any, index: number) => {
        console.log(`TASK ${index + 1}:`, {
          title: item.task?.title,
          location: item.task?.location,
          latitude: item.task?.latitude,
          longitude: item.task?.longitude,
        });
      });

      setSchedule(data);
    } catch (error: any) {
      console.error('Map load error:', error);
      Alert.alert('Map error', error?.message || 'Failed to load route data.');
    } finally {
      setLoading(false);
    }
  }, [resolveHomeLocation]);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadRoute();
  }, [loadRoute]);

  const routeStops = useMemo<RouteStop[]>(() => {
    const stops: RouteStop[] = [];

    if (homeLocation && isValidCoordinate(homeLocation)) {
      stops.push({
        key: 'home',
        coordinate: homeLocation,
        title: 'Home',
        description: HOME_ADDRESS,
        isHome: true,
      });
    }

    const items = schedule?.items ?? [];

    items.forEach((item, index) => {
      const lat = item.task?.latitude;
      const lng = item.task?.longitude;

      const validTaskCoord =
        typeof lat === 'number' &&
        typeof lng === 'number' &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180;

      if (!validTaskCoord) {
        console.log('Skipping invalid task coordinate:', item.task);
        return;
      }

      stops.push({
        key: `task-${item.id ?? index}`,
        coordinate: {
          latitude: lat,
          longitude: lng,
        },
        title: item.task?.title ?? `Stop ${index + 1}`,
        description: item.task?.location ?? 'Task location',
        isHome: false,
      });
    });

    console.log('ROUTE STOPS:', stops);
    return stops;
  }, [schedule, homeLocation]);

  const polylineCoords = useMemo(
    () => routeStops.map((stop) => stop.coordinate),
    [routeStops]
  );

  useEffect(() => {
    const loadRoadPolyline = async () => {
      if (polylineCoords.length < 2) {
        setRoadPolylineCoords(polylineCoords);
        return;
      }

      const roadCoords = await getRoadRoute(polylineCoords);
      setRoadPolylineCoords(roadCoords);
    };

    loadRoadPolyline();
  }, [polylineCoords]);

  const initialRegion = useMemo(() => {
    const coordsToUse =
      roadPolylineCoords.length > 0 ? roadPolylineCoords : polylineCoords;

    if (coordsToUse.length > 0) {
      return {
        latitude: coordsToUse[0].latitude,
        longitude: coordsToUse[0].longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };
    }

    return {
      latitude: 40.7128,
      longitude: -74.006,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }, [roadPolylineCoords, polylineCoords]);

  useEffect(() => {
    const coordsToFit =
      roadPolylineCoords.length >= 2 ? roadPolylineCoords : polylineCoords;

    if (!mapRef.current || coordsToFit.length < 2) return;

    const timeout = setTimeout(() => {
      mapRef.current?.fitToCoordinates(coordsToFit, {
        edgePadding: {
          top: 80,
          right: 60,
          bottom: 80,
          left: 60,
        },
        animated: true,
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [roadPolylineCoords, polylineCoords]);

  const handleSetHomeToCurrentLocation = async () => {
    try {
      setSettingHome(true);

      const coords = await getCurrentLocation();
      console.log('CURRENT GPS:', coords);

      if (!coords) return;

      await saveHomeToBackendIfPossible(coords);
      await saveHomeLocation(coords);
      await loadRoute();

      Alert.alert('Home updated', 'Your current GPS location is now saved as home.');
    } catch (error: any) {
      console.error('Set home error:', error);
      Alert.alert(
        'Update failed',
        error?.message || 'Could not save your home location.'
      );
    } finally {
      setSettingHome(false);
    }
  };

  const handleUseQueensHomeAddress = async () => {
    try {
      setSettingQueensHome(true);

      const queensCoords = await getQueensHomeCoordinates();

      if (!queensCoords) {
        Alert.alert(
          'Address not found',
          'Could not convert your Queens address into map coordinates.'
        );
        return;
      }

      await saveHomeToBackendIfPossible(queensCoords);
      await saveHomeLocation(queensCoords);
      await loadRoute();

      Alert.alert('Home updated', `Home is now set to ${HOME_ADDRESS}.`);
    } catch (error: any) {
      console.error('Set Queens home error:', error);
      Alert.alert(
        'Update failed',
        error?.message || 'Could not set your Queens home address.'
      );
    } finally {
      setSettingQueensHome(false);
    }
  };

  const handleOpenNavigation = async () => {
    if (routeStops.length < 2) {
      Alert.alert(
        'Not enough locations',
        'You need a home location and at least one task with valid coordinates.'
      );
      return;
    }

    try {
      const origin = `${routeStops[0].coordinate.latitude},${routeStops[0].coordinate.longitude}`;
      const destinationStop = routeStops[routeStops.length - 1];
      const destination = `${destinationStop.coordinate.latitude},${destinationStop.coordinate.longitude}`;

      const middleStops = routeStops.slice(1, -1);
      const waypointString =
        middleStops.length > 0
          ? `&waypoints=${middleStops
              .map(
                (stop) =>
                  `${stop.coordinate.latitude},${stop.coordinate.longitude}`
              )
              .join('|')}`
          : '';

      const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypointString}&travelmode=driving`;

      await Linking.openURL(url);
    } catch (error) {
      console.error('Open navigation error:', error);
      Alert.alert('Navigation error', 'Failed to open navigation.');
    }
  };

  const nextTask = schedule?.items?.find((item) => item.task)?.task ?? null;
  const taskStopCount = routeStops.filter((stop) => !stop.isHome).length;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header title="Route Map" subtitle="Live optimized route" />

        <Card
          style={[
            styles.heroCard,
            { backgroundColor: theme.tint, borderColor: 'transparent' },
          ]}
        >
          <Text style={styles.heroLabel}>Live route</Text>
          <Text style={styles.heroBig}>Stop Preview</Text>
          <Text style={styles.heroText}>
            Preview of your task locations in optimized order starting from home.
          </Text>
        </Card>

        <Card noPad style={[styles.mapCard, { borderColor: theme.border }]}>
          <View style={styles.mapContainer}>
            {loading ? (
              <View style={styles.centerState}>
                <ActivityIndicator size="large" />
                <Text style={[styles.stateText, { color: theme.subtext }]}>
                  Loading map...
                </Text>
              </View>
            ) : routeStops.length > 0 ? (
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={initialRegion}
              >
                {roadPolylineCoords.length >= 2 && (
                  <Polyline
                    coordinates={roadPolylineCoords}
                    strokeWidth={4}
                    strokeColor={theme.tint}
                  />
                )}

                {routeStops.map((stop) => (
                  <Marker
                    key={stop.key}
                    coordinate={stop.coordinate}
                    title={stop.title}
                    description={stop.description}
                    pinColor={stop.isHome ? 'green' : 'red'}
                  />
                ))}
              </MapView>
            ) : (
              <View style={styles.centerState}>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  No route yet
                </Text>
                <Text style={[styles.stateText, { color: theme.subtext }]}>
                  Add tasks with valid place names or addresses, then set your
                  home location.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.statRow}>
            <View
              style={[
                styles.statBox,
                { borderColor: theme.border, backgroundColor: theme.card },
              ]}
            >
              <Text style={[styles.statValue, { color: theme.tint }]}>
                {taskStopCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.subtext }]}>
                Stops
              </Text>
            </View>

            <View
              style={[
                styles.statBox,
                { borderColor: theme.border, backgroundColor: theme.card },
              ]}
            >
              <Text style={[styles.statValue, { color: theme.tint }]}>
                {schedule?.total_duration_minutes ?? 0} min
              </Text>
              <Text style={[styles.statLabel, { color: theme.subtext }]}>
                Task Time
              </Text>
            </View>

            <View
              style={[
                styles.statBox,
                { borderColor: theme.border, backgroundColor: theme.card },
              ]}
            >
              <Text style={[styles.statValue, { color: theme.tint }]}>
                {roadPolylineCoords.length >= 2 ? 'Ready' : 'Waiting'}
              </Text>
              <Text style={[styles.statLabel, { color: theme.subtext }]}>
                Route
              </Text>
            </View>
          </View>
        </Card>

        <SectionHeader title="Home location" />

        <Card style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <Text style={[styles.nextTime, { color: theme.tint }]}>Current home</Text>

          <Text style={[styles.nextTitle, { color: theme.text }]}>
            {homeLocation ? 'Queens Home Loaded' : 'No home set'}
          </Text>

          <Text style={[styles.nextAddr, { color: theme.subtext }]}>
            {homeLocation
              ? `${HOME_ADDRESS}\n(${homeLocation.latitude.toFixed(5)}, ${homeLocation.longitude.toFixed(5)})`
              : 'Home location is not available yet.'}
          </Text>
        </Card>

        <SectionHeader title="Next destination" />

        <Card style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <Text style={[styles.nextTime, { color: theme.tint }]}>Next stop</Text>

          <Text style={[styles.nextTitle, { color: theme.text }]}>
            {nextTask?.title || 'No tasks'}
          </Text>

          <Text style={[styles.nextAddr, { color: theme.subtext }]}>
            {nextTask?.location || 'No destination yet'}
          </Text>
        </Card>

        <View style={styles.btnRow}>
          <Button
            label={settingHome ? 'Setting Home...' : 'Set Home to Current Location'}
            variant="secondary"
            style={styles.halfBtn}
            onPress={handleSetHomeToCurrentLocation}
          />

          <Button
            label="Open navigation"
            style={styles.halfBtn}
            onPress={handleOpenNavigation}
          />
        </View>

        <Button
          label={settingQueensHome ? 'Setting Queens Home...' : 'Use Queens Home Address'}
          variant="secondary"
          style={styles.refreshBtn}
          onPress={handleUseQueensHomeAddress}
        />

        <Button
          label="Refresh route"
          style={[styles.refreshBtn, { backgroundColor: theme.accent }]}
          onPress={loadRoute}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 140,
  },
  heroCard: {
    marginBottom: Spacing.md,
  },
  heroLabel: {
    ...Typography.caption,
    color: 'white',
  },
  heroBig: {
    ...Typography.h1,
    color: 'white',
  },
  heroText: {
    ...Typography.body,
    color: 'white',
  },
  mapCard: {
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  mapContainer: {
    height: 320,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  stateText: {
    ...Typography.bodySm,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  emptyTitle: {
    ...Typography.h4,
    marginBottom: 6,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.sm,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  statValue: {
    ...Typography.h3,
  },
  statLabel: {
    ...Typography.label,
    marginTop: 2,
  },
  nextTime: {
    ...Typography.caption,
    marginBottom: 4,
  },
  nextTitle: {
    ...Typography.h3,
    marginBottom: 4,
  },
  nextAddr: {
    ...Typography.bodySm,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  halfBtn: {
    flex: 1,
  },
  refreshBtn: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
});