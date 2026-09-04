import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
}

const LocationContext = createContext<LocationContextType>({} as LocationContextType);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<GpsCoordinates | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | null>(null);
  const [isAcquiring, setIsAcquiring] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setIsAcquiring(true);
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const coords: GpsCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy || 5,
            timestamp: position.timestamp,
          };
          setLocation(coords);
          setError(null);
          setIsAcquiring(false);
          resolve(coords);
        },
        (err) => {
          // Fallback to default certified Chennai GPO coordinates
          const fallback: GpsCoordinates = {
            latitude: CONFIG.DEFAULT_LOCATION.latitude,
            longitude: CONFIG.DEFAULT_LOCATION.longitude,
            accuracy: CONFIG.DEFAULT_LOCATION.accuracy,
            timestamp: Date.now(),
          };
          setLocation(fallback);
          setIsAcquiring(false);
          resolve(fallback);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === 'android') {
          const check = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
          if (check) {
            setPermissionStatus('granted');
            getCurrentPosition();
          } else {
            setPermissionStatus('prompt');
          }
        } else {
          getCurrentPosition();
        }
      } catch (e) {}
    })();
  }, [getCurrentPosition]);

  return (
    <LocationContext.Provider
      value={{
        location,
        permissionStatus,
        isAcquiring,
        error,
        requestPermission,
        getCurrentPosition,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
export default LocationContext;
