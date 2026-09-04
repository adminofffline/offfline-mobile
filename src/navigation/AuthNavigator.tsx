import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UnifiedLoginScreen } from '../screens/auth/UnifiedLoginScreen';
import { PlantRegisterScreen } from '../screens/auth/PlantRegisterScreen';
import { DistributorRegisterScreen } from '../screens/auth/DistributorRegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="UnifiedLogin"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="UnifiedLogin" component={UnifiedLoginScreen} />
      <Stack.Screen name="PlantRegister" component={PlantRegisterScreen} />
      <Stack.Screen name="DistributorRegister" component={DistributorRegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

export default AuthNavigator;
