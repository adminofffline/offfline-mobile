import React from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { NativePressable, HapticFeedbackType } from './NativePressable';

export type AppleButtonVariant = 'primary' | 'secondary' | 'glass' | 'danger' | 'plant' | 'distributor';
export type AppleButtonSize = 'sm' | 'md' | 'lg';

export interface AppleButtonProps {
  title: string;
  onPress: () => void;
  variant?: AppleButtonVariant;
  size?: AppleButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  haptic?: HapticFeedbackType;
}

export const AppleButtonComponent: React.FC<AppleButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  rightIcon,
  style,
  textStyle,
  haptic = 'impactLight',
}) => {
  const isActionDisabled = disabled || loading;

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: styles.btnSecondary,
          text: styles.btnSecondaryText,
          spinnerColor: '#334155',
        };
      case 'glass':
        return {
          container: styles.btnGlass,
          text: styles.btnGlassText,
          spinnerColor: '#0F172A',
        };
      case 'danger':
        return {
          container: styles.btnDanger,
          text: styles.btnDangerText,
          spinnerColor: '#FFFFFF',
        };
      case 'plant':
        return {
          container: styles.btnPlant,
          text: styles.btnPrimaryText,
          spinnerColor: '#FFFFFF',
        };
      case 'distributor':
        return {
          container: styles.btnDistributor,
          text: styles.btnPrimaryText,
          spinnerColor: '#FFFFFF',
        };
      case 'primary':
      default:
        return {
          container: styles.btnPrimary,
          text: styles.btnPrimaryText,
          spinnerColor: '#FFFFFF',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: styles.sizeSm,
          text: styles.textSizeSm,
        };
      case 'lg':
        return {
          container: styles.sizeLg,
          text: styles.textSizeLg,
        };
      case 'md':
      default:
        return {
          container: styles.sizeMd,
          text: styles.textSizeMd,
        };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  return (
    <NativePressable
      onPress={onPress}
      disabled={isActionDisabled}
      haptic={haptic}
      activeScale={0.97}
      style={[
        styles.baseButton,
        vStyles.container,
        sStyles.container,
        isActionDisabled && styles.btnDisabled,
        style,
      ]}
    >
      <View style={styles.contentWrap}>
        {loading ? (
          <ActivityIndicator size="small" color={vStyles.spinnerColor} style={styles.spinner} />
        ) : (
          <>
            {icon && <View style={styles.leftIconWrap}>{icon}</View>}
            <Text style={[styles.baseText, vStyles.text, sStyles.text, textStyle]}>
              {title}
            </Text>
            {rightIcon && <View style={styles.rightIconWrap}>{rightIcon}</View>}
          </>
        )}
      </View>
    </NativePressable>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  contentWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  leftIconWrap: {
    marginRight: 8,
  },
  rightIconWrap: {
    marginLeft: 8,
  },
  spinner: {
    paddingVertical: 2,
  },
  btnDisabled: {
    opacity: 0.55,
  },

  // Sizes
  sizeSm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  sizeMd: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  sizeLg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  textSizeSm: {
    fontSize: 13,
  },
  textSizeMd: {
    fontSize: 15,
  },
  textSizeLg: {
    fontSize: 16.5,
  },

  // Variants
  btnPrimary: {
    backgroundColor: '#111C24',
    shadowColor: '#111C24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 3,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
  },
  btnPlant: {
    backgroundColor: '#056B4A',
    shadowColor: '#056B4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  btnDistributor: {
    backgroundColor: '#111C24',
    shadowColor: '#111C24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  btnSecondary: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  btnSecondaryText: {
    color: '#334155',
  },
  btnGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  btnGlassText: {
    color: '#0F172A',
  },
  btnDanger: {
    backgroundColor: '#EF4444',
  },
  btnDangerText: {
    color: '#FFFFFF',
  },
});

export const AppleButton = React.memo(AppleButtonComponent);
export default AppleButton;
