import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MapPin, ShieldAlert, CheckCircle2, Navigation } from 'lucide-react-native';
import { useLocation } from '../context/LocationContext';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

interface LocationEnforcerProps {
  children: React.ReactNode;
  roleTitle?: string;
}

export const LocationEnforcer: React.FC<LocationEnforcerProps> = ({
  children,
  roleTitle = 'Terminal Operator',
}) => {
  const { location, permissionStatus, isAcquiring, error, requestPermission, getCurrentPosition } = useLocation();

  if (location && permissionStatus === 'granted') {
    return <>{children}</>;
  }

  return (
    <View style={styles.gateContainer}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <ShieldAlert size={32} color={COLORS.distributorAccent} />
        </View>

        <Text style={styles.cardTitle}>GPS Location Verification Required</Text>
        <Text style={styles.cardSubtitle}>
          Offfline cryptographically verifies water bottle bottling and delivery logs using real-time GPS telemetry.
        </Text>

        <View style={styles.benefitList}>
          <View style={styles.benefitRow}>
            <CheckCircle2 size={16} color={COLORS.success} />
            <Text style={styles.benefitText}>Proof-of-bottling verification for brand advertisers</Text>
          </View>
          <View style={styles.benefitRow}>
            <CheckCircle2 size={16} color={COLORS.success} />
            <Text style={styles.benefitText}>Automated daily settlement payout auditing</Text>
          </View>
          <View style={styles.benefitRow}>
            <CheckCircle2 size={16} color={COLORS.success} />
            <Text style={styles.benefitText}>Prevents fraudulent duplicate scan submissions</Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.enableBtn}
          onPress={async () => {
            const granted = await requestPermission();
            if (granted) {
              await getCurrentPosition();
            }
          }}
          disabled={isAcquiring}
          activeOpacity={0.8}
        >
          {isAcquiring ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Navigation size={16} color={COLORS.white} />
              <Text style={styles.enableBtnText}>Acquire GPS Lock & Continue</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gateContainer: {
    flex: 1,
    backgroundColor: COLORS.slate100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    ...SHADOWS.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.distributorBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    ...TYPOGRAPHY.lg,
    fontWeight: '800',
    color: COLORS.slate900,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    ...TYPOGRAPHY.xs,
    fontWeight: '500',
    color: COLORS.slate500,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  benefitList: {
    width: '100%',
    backgroundColor: COLORS.slate50,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  benefitText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.slate700,
    flex: 1,
  },
  errorBox: {
    backgroundColor: COLORS.errorBg,
    borderColor: COLORS.errorBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    width: '100%',
    marginBottom: SPACING.md,
  },
  errorText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.errorText,
    textAlign: 'center',
  },
  enableBtn: {
    backgroundColor: COLORS.slate900,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    width: '100%',
  },
  enableBtnText: {
    ...TYPOGRAPHY.sm,
    fontWeight: '800',
    color: COLORS.white,
  },
});

export default LocationEnforcer;
