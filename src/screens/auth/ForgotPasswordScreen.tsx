import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { ArrowLeft, Key, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { authApi } from '../../api/auth';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { NativePressable } from '../../components/common/NativePressable';
import { AppleButton } from '../../components/common/AppleButton';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (isLoading) return;
    if (!phoneOrEmail.trim()) {
      setErrorMessage('Please enter your registered mobile number or email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authApi.forgotPassword(phoneOrEmail.trim());
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to send reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <NativePressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          haptic="impactLight"
          hitSlop={8}
        >
          <ArrowLeft size={18} color={COLORS.slate700} />
          <Text style={styles.backBtnText}>Back to Sign In</Text>
        </NativePressable>

        {isSubmitted ? (
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <CheckCircle2 size={36} color={COLORS.success} />
            </View>
            <Text style={styles.title}>Password Reset Sent</Text>
            <Text style={styles.desc}>
              If an account exists for {phoneOrEmail}, a verification code has been dispatched via WhatsApp / SMS.
            </Text>
            <AppleButton
              title="Return to Login"
              variant="primary"
              size="lg"
              onPress={() => navigation.navigate('UnifiedLogin')}
              style={{ width: '100%' }}
            />
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Key size={28} color={COLORS.distributorAccent} />
            </View>
            <Text style={styles.title}>Reset Account Password</Text>
            <Text style={styles.desc}>
              Enter your registered mobile number or email address. We will verify your credentials and dispatch a reset code.
            </Text>

            {errorMessage && (
              <View style={styles.errorBanner}>
                <AlertCircle size={15} color={COLORS.error} />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>MOBILE NUMBER OR EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="+91 98765 43210 or email@domain.com"
                placeholderTextColor={COLORS.slate400}
                value={phoneOrEmail}
                onChangeText={setPhoneOrEmail}
                autoCapitalize="none"
              />
            </View>

            <AppleButton
              title="Send Reset Code"
              variant="primary"
              size="lg"
              loading={isLoading}
              onPress={handleSubmit}
              style={{ width: '100%' }}
            />
          </View>
        )}
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
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.lg,
  },
  backBtnText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '700',
    color: COLORS.slate700,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.slate100,
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
    lineHeight: 18,
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    gap: SPACING.xs,
    marginBottom: SPACING.md,
    width: '100%',
  },
  errorBannerText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '700',
    color: COLORS.errorText,
    flex: 1,
  },
  inputGroup: {
    width: '100%',
    gap: 4,
    marginBottom: SPACING.lg,
  },
  label: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.slate700,
  },
  input: {
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    ...TYPOGRAPHY.xs,
    color: COLORS.slate900,
  },
  primaryBtn: {
    backgroundColor: COLORS.slate900,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryBtnText: {
    ...TYPOGRAPHY.sm,
    fontWeight: '800',
    color: COLORS.white,
  },
});

export default ForgotPasswordScreen;
