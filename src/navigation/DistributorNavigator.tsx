import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DistributorDashboardScreen } from '../screens/distributor/DistributorDashboardScreen';
import { NotificationsScreen } from '../screens/shared/NotificationsScreen';

const Stack = createNativeStackNavigator();

export function DistributorNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DistributorMain" component={DistributorDashboardScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

export default DistributorNavigator;
