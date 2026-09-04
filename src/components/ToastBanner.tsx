import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

interface ToastBannerProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  onDismiss?: () => void;
}

export const ToastBanner: React.FC<ToastBannerProps> = ({
  visible,
  message,
  type = 'success',
  onDismiss,
}) => {
  if (!visible || !message) return null;

  let bg = COLORS.slate900;
  let text = COLORS.white;
  let icon = <CheckCircle2 size={16} color={COLORS.success} />;

  if (type === 'success') {
    icon = <CheckCircle2 size={16} color={COLORS.success} />;
  } else if (type === 'warning') {
    icon = <AlertTriangle size={16} color={COLORS.warning} />;
  } else if (type === 'error') {
    icon = <XCircle size={16} color={COLORS.error} />;
  }

  return (
    <View style={styles.floatingContainer}>
      <View style={[styles.toast, { backgroundColor: bg }]}>
        <View style={styles.leftRow}>
          {icon}
          <Text style={[styles.messageText, { color: text }]} numberOfLines={2}>
            {message}
          </Text>
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
            <X size={14} color={COLORS.slate400} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    top: 60,
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    width: '100%',
    ...SHADOWS.lg,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  messageText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '700',
    flex: 1,
  },
  closeBtn: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});

export default ToastBanner;
