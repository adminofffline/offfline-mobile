import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const s = (status || '').toUpperCase().trim();

  let bg = COLORS.slate100;
  let border = COLORS.slate200;
  let text = COLORS.slate700;
  let label = status;
  let icon = <Clock size={size === 'sm' ? 10 : 12} color={text} />;

  if (s === 'COMPLETED' || s === 'PAID' || s === 'VERIFIED' || s === 'SETTLED' || s === 'APPROVED') {
    bg = COLORS.successBg;
    border = COLORS.successBorder;
    text = COLORS.successText;
    label = s === 'PAID' ? 'Paid & Settled' : s === 'COMPLETED' ? 'Completed' : 'Verified';
    icon = <CheckCircle2 size={size === 'sm' ? 10 : 12} color={text} />;
  } else if (s === 'BOTTLING' || s === 'PROCESSING' || s === 'IN_PRODUCTION' || s === 'IN_PROGRESS') {
    bg = COLORS.plantBg;
    border = COLORS.plantBorder;
    text = COLORS.plantText;
    label = 'In Production';
    icon = <Clock size={size === 'sm' ? 10 : 12} color={text} />;
  } else if (s === 'PENDING' || s === 'TODO' || s === 'PAYMENT REQUESTED' || s === 'PAYMENT_REQUESTED') {
    bg = COLORS.warningBg;
    border = COLORS.warningBorder;
    text = COLORS.warningText;
    label = s === 'PAYMENT REQUESTED' || s === 'PAYMENT_REQUESTED' ? 'Payment Requested' : 'Pending';
    icon = <AlertTriangle size={size === 'sm' ? 10 : 12} color={text} />;
  } else if (s === 'REJECTED' || s === 'CANCELLED' || s === 'DISCREPANCY') {
    bg = COLORS.errorBg;
    border = COLORS.errorBorder;
    text = COLORS.errorText;
    label = s === 'REJECTED' ? 'Rejected' : 'Discrepancy';
    icon = <XCircle size={size === 'sm' ? 10 : 12} color={text} />;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }, size === 'sm' && styles.badgeSm]}>
      {icon}
      <Text style={[styles.badgeText, { color: text }, size === 'sm' && styles.badgeTextSm]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 4,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 2,
    gap: 3,
  },
  badgeText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
  },
  badgeTextSm: {
    fontSize: 9,
    lineHeight: 12,
  },
});

export default StatusBadge;
