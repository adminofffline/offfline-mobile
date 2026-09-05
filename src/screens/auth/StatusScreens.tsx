import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Clock, XCircle, LogOut } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { NativePressable } from '../../components/common/NativePressable';

export const WaitingForApprovalScreen: React.FC = () => {
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: COLORS.warningBg }]}>
            <Clock size={40} color={COLORS.warning} />
          </View>
          <Text style={styles.title}>Account Pending Approval</Text>
          <Text style={styles.desc}>
            Your operator registration is currently pending Super Admin authorization. Once your license and compliance details are verified, you will gain full access.
          </Text>

          <NativePressable
            style={styles.logoutBtn}
            onPress={signOut}
            haptic="impactMedium"
            scaleActive={0.96}
          >
            <LogOut size={16} color={COLORS.error} />
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </NativePressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export const RegistrationRejectedScreen: React.FC = () => {
  const { signOut, user } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: COLORS.errorBg }]}>
            <XCircle size={40} color={COLORS.error} />
          </View>
          <Text style={styles.title}>Registration Not Approved</Text>
          <Text style={styles.desc}>
            {user?.rejectionReason || 'Your facility registration could not be verified in accordance with regulatory ISI and compliance standards.'}
          </Text>

          <NativePressable
            style={styles.logoutBtn}
            onPress={signOut}
            haptic="impactMedium"
            scaleActive={0.96}
          >
            <LogOut size={16} color={COLORS.error} />
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </NativePressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  container: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.lg,
    fontWeight: '900',
    color: COLORS.slate900,
    textAlign: 'center',
  },
  desc: {
    ...TYPOGRAPHY.xs,
    color: COLORS.slate500,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  logoutBtnText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.error,
  },
});
