import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { PlantNavigator } from './PlantNavigator';
import { DistributorNavigator } from './DistributorNavigator';
import { WaitingForApprovalScreen, RegistrationRejectedScreen } from '../screens/auth/StatusScreens';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>O</Text>
      </View>
      <Text style={styles.loadingTitle}>Offfline</Text>
      <ActivityIndicator size="small" color={COLORS.distributorAccent} style={{ marginTop: SPACING.md }} />
    </View>
  );
}

export function RootNavigator() {
  const { user, token, role, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {!token || !user ? (
        <AuthNavigator />
      ) : user.status === 'Pending' ? (
        <WaitingForApprovalScreen />
      ) : user.status === 'Rejected' ? (
        <RegistrationRejectedScreen />
      ) : role === 'DISTRIBUTOR' ? (
        <DistributorNavigator />
      ) : (
        <PlantNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.slate50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.slate900,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.white,
  },
  loadingTitle: {
    ...TYPOGRAPHY.lg,
    fontWeight: '900',
    color: COLORS.slate900,
  },
});

export default RootNavigator;
