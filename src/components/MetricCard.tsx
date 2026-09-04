import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  trendText?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon,
  accentColor = COLORS.slate900,
  trendText,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.labelText} numberOfLines={1}>
          {label.toUpperCase()}
        </Text>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
      </View>

      <Text style={[styles.valueText, { color: accentColor }]} numberOfLines={1}>
        {value}
      </Text>

      {(subtext || trendText) && (
        <View style={styles.footerRow}>
          {subtext && (
            <Text style={styles.subtext} numberOfLines={1}>
              {subtext}
            </Text>
          )}
          {trendText && (
            <Text style={styles.trendText} numberOfLines={1}>
              {trendText}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    ...SHADOWS.sm,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  labelText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.slate400,
    letterSpacing: 0.5,
    flex: 1,
  },
  iconContainer: {
    marginLeft: SPACING.xs,
  },
  valueText: {
    ...TYPOGRAPHY.xl,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: -0.5,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  subtext: {
    ...TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.slate500,
  },
  trendText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '700',
    color: COLORS.successText,
  },
});

export default MetricCard;
