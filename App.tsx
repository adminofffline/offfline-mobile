import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LocationProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <RootNavigator />
        </LocationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
