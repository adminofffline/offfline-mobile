import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { GpsCoordinates } from '../types';
import { CONFIG } from '../constants/config';

interface LocationContextType {
  location: GpsCoordinates | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | null;
  isAcquiring: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  getCurrentPosition: () => Promise<GpsCoordinates | null>;
  getLocationSnapshot: () => GpsCoordinates;
}

const LocationContext = createContext<LocationContextType>({} as LocationContextType);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<GpsCoordinates | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | null>(null);
  const [isAcquiring, setIsAcquiring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cached memory reference for 0ms instantaneous lookup
  const lastKnownLocationRef = useRef<GpsCoordinates>({
    latitude: CONFIG.DEFAULT_LOCATION.latitude,
    longitude: CONFIG.DEFAULT_LOCATION.longitude,
    accuracy: CONFIG.DEFAULT_LOCATION.accuracy,
    timestamp: Date.now(),
  });

  const getLocationSnapshot = useCallback((): GpsCoordinates => {
    return lastKnownLocationRef.current;
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'ios') {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        if (auth === 'granted') {
          setPermissionStatus('granted');
          setError(null);
          await getCurrentPosition();
          return true;
        } else {
          setPermissionStatus('denied');
          setError('Location permission is required for verifiable water bottling & delivery scans.');
          return false;
        }
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Offfline Location Verification',
            message: 'Offfline requires GPS access to cryptographically verify water bottle distribution.',
            buttonPositive: 'Grant Access',
            buttonNegative: 'Cancel',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionStatus('granted');
          setError(null);
          await getCurrentPosition();
          return true;
        } else {
          setPermissionStatus('denied');
          setError('Location permission is required for verifiable water bottling & delivery scans.');
          return false;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request location permission.');
      return false;
    }
  }, []);

  const getCurrentPosition = useCallback(async (): Promise<GpsCoordinates | null> => {
    // If we have fresh cached location within last 60 seconds, return immediately (0ms delay)
    const now = Date.now();
    if (location && now - (location.timestamp || 0) < 60000) {
      return location;
    }
    if (lastKnownLocationRef.current && now - (lastKnownLocationRef.current.timestamp || 0) < 60000) {
      return lastKnownLocationRef.current;
    }

    setIsAcquiring(true);
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const coords: GpsCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy || 5,
            timestamp: position.timestamp || Date.now(),
          };
          lastKnownLocationRef.current = coords;
          setLocation(coords);
          setError(null);
          setIsAcquiring(false);
          resolve(coords);
        },
        (err) => {
          const fallback = lastKnownLocationRef.current;
          setLocation(fallback);
          setIsAcquiring(false);
          resolve(fallback);
        },
        { enableHighAccuracy: false, timeout: 3000, maximumAge: 30000 }
      );
    });
  }, [location]);

  useEffect(() => {
    let watchId: number | null = null;
    (async () => {
      try {
        if (Platform.OS === 'android') {
          const check = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
          if (check) {
            setPermissionStatus('granted');
          } else {
            setPermissionStatus('prompt');
          }
        } else {
          setPermissionStatus('granted');
        }

        // Initialize fast position
        Geolocation.getCurrentPosition(
          (pos) => {
            const coords: GpsCoordinates = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy || 5,
              timestamp: pos.timestamp || Date.now(),
            };
            lastKnownLocationRef.current = coords;
            setLocation(coords);
          },
          () => {},
          { enableHighAccuracy: false, timeout: 4000, maximumAge: 60000 }
        );

        // Keep position warm in background with low battery impact & distance thresholding
        watchId = Geolocation.watchPosition(
          (pos) => {
            const coords: GpsCoordinates = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy || 5,
              timestamp: pos.timestamp || Date.now(),
            };
            const prev = lastKnownLocationRef.current;
            lastKnownLocationRef.current = coords;

            // Only trigger state re-renders if position changed significantly (> 0.0005 deg ~ 50m)
            const hasMoved =
              !prev ||
              Math.abs(prev.latitude - coords.latitude) > 0.0005 ||
              Math.abs(prev.longitude - coords.longitude) > 0.0005;

            if (hasMoved) {
              setLocation(coords);
            }
          },
          () => {},
          { distanceFilter: 30, interval: 30000, fastestInterval: 15000, enableHighAccuracy: false }
        );
      } catch (e) {}
    })();

    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const contextValue = React.useMemo(
    () => ({
      location,
      permissionStatus,
      isAcquiring,
      error,
      requestPermission,
      getCurrentPosition,
      getLocationSnapshot,
    }),
    [location, permissionStatus, isAcquiring, error, requestPermission, getCurrentPosition, getLocationSnapshot]
  );

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
export default LocationContext;
