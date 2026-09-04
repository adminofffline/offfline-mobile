import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlantDashboardScreen } from '../screens/plant/PlantDashboardScreen';
import { NotificationsScreen } from '../screens/shared/NotificationsScreen';

const Stack = createNativeStackNavigator();

export function PlantNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlantMain" component={PlantDashboardScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

export default PlantNavigator;
