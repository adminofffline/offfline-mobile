import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {
  Eye,
  EyeOff,
  Factory,
  Truck,
  ArrowRight,
  Lock,
  Phone,
  AlertCircle,
  Zap,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { NativePressable } from '../../components/common/NativePressable';
import { AppleButton } from '../../components/common/AppleButton';
import { OffflineBrandWordmark } from '../../components/common/OffflineBrandWordmark';

interface UnifiedLoginScreenProps {
  navigation: any;
}

export const UnifiedLoginScreen: React.FC<UnifiedLoginScreenProps> = ({ navigation }) => {
  const { signIn, demoLogin } = useAuth();

  const [selectedRole, setSelectedRole] = useState<'WATER_PLANT' | 'DISTRIBUTOR'>('WATER_PLANT');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPlant = selectedRole === 'WATER_PLANT';

  const handleLogin = async () => {
    if (isLoading) return;
    if (!phoneOrEmail.trim() || !password) {
      setErrorMessage('Please enter both Phone/Email and Password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn(phoneOrEmail, password, selectedRole);
      if (!res.success) {
        setErrorMessage(res.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'WATER_PLANT' | 'DISTRIBUTOR') => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);
    setSelectedRole(role);

    try {
      const res = await demoLogin(role);
      if (!res.success) {
        setErrorMessage(res.message || 'Demo login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <OffflineBrandWordmark
              size="lg"
              align="center"
            />
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Sign In</Text>

            {/* Error Alert */}
            {errorMessage && (
              <View style={styles.errorBanner}>
                <AlertCircle size={14} color={COLORS.error} />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            )}

            {/* Clean 2-Segmented Role Switcher */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>ROLE</Text>
              <View style={styles.segmentedRoleWrap}>
                <NativePressable
                  style={[
                    styles.segmentTab,
                    isPlant && styles.segmentTabActive,
                  ]}
                  onPress={() => setSelectedRole('WATER_PLANT')}
                  haptic="selection"
                  scaleActive={0.98}
                >
                  <Factory
                    size={15}
                    color={isPlant ? COLORS.plantAccent : COLORS.slate500}
                  />
                  <Text
                    style={[
                      styles.segmentTabText,
                      isPlant && styles.segmentTabTextActivePlant,
                    ]}
                  >
                    Plant
                  </Text>
                </NativePressable>

                <NativePressable
                  style={[
                    styles.segmentTab,
                    !isPlant && styles.segmentTabActive,
                  ]}
                  onPress={() => setSelectedRole('DISTRIBUTOR')}
                  haptic="selection"
                  scaleActive={0.98}
                >
                  <Truck
                    size={15}
                    color={!isPlant ? COLORS.distributorAccent : COLORS.slate500}
                  />
                  <Text
                    style={[
                      styles.segmentTabText,
                      !isPlant && styles.segmentTabTextActiveDistributor,
                    ]}
                  >
                    Distributor
                  </Text>
                </NativePressable>
              </View>
            </View>

            {/* Phone or Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>EMAIL OR PHONE</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconBox}>
                  <Phone size={15} color={COLORS.slate400} />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder={isPlant ? 'mfr@offfline.in or mobile' : 'distributor@offfline.in or mobile'}
                  placeholderTextColor={COLORS.slate400}
                  value={phoneOrEmail}
                  onChangeText={setPhoneOrEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>PASSWORD</Text>
                <NativePressable
                  onPress={() => navigation.navigate('ForgotPassword')}
                  haptic="impactLight"
                  hitSlop={8}
                >
                  <Text style={styles.forgotPasswordText}>Forgot?</Text>
                </NativePressable>
              </View>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconBox}>
                  <Lock size={15} color={COLORS.slate400} />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Password"
                  placeholderTextColor={COLORS.slate400}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <NativePressable
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  haptic="impactLight"
                  hitSlop={8}
                >
                  {showPassword ? (
                    <EyeOff size={16} color={COLORS.slate400} />
                  ) : (
                    <Eye size={16} color={COLORS.slate400} />
                  )}
                </NativePressable>
              </View>
            </View>

            {/* Sign In Button */}
            <AppleButton
              title="Sign In"
              variant="primary"
              size="md"
              loading={isLoading}
              onPress={handleLogin}
              rightIcon={<ArrowRight size={15} color={COLORS.white} />}
              style={{ marginTop: 4 }}
            />

            {/* 1-Click Demo Login */}
            <View style={styles.demoSection}>
              <View style={styles.demoDividerRow}>
                <View style={styles.demoDivider} />
                <Text style={styles.demoDividerText}>OR 1-CLICK DEMO LOGIN</Text>
                <View style={styles.demoDivider} />
              </View>

              <View style={styles.demoButtonsRow}>
                <NativePressable
                  style={[styles.demoBtn, styles.demoBtnPlant]}
                  onPress={() => handleDemoLogin('WATER_PLANT')}
                  disabled={isLoading}
                  haptic="impactLight"
                  scaleActive={0.96}
                >
                  <Zap size={12} color={COLORS.plantAccent} />
                  <Text style={styles.demoBtnTextPlant}>Demo Plant</Text>
                </NativePressable>

                <NativePressable
                  style={[styles.demoBtn, styles.demoBtnDistributor]}
                  onPress={() => handleDemoLogin('DISTRIBUTOR')}
                  disabled={isLoading}
                  haptic="impactLight"
                  scaleActive={0.96}
                >
                  <Zap size={12} color={COLORS.distributorAccent} />
                  <Text style={styles.demoBtnTextDistributor}>Demo Distributor</Text>
                </NativePressable>
              </View>
            </View>

            {/* Registration Link */}
            <View style={styles.registerPrompt}>
              <Text style={styles.registerPromptText}>Don't have an operator account?</Text>
              <NativePressable
                onPress={() =>
                  navigation.navigate(isPlant ? 'PlantRegister' : 'DistributorRegister')
                }
                haptic="impactLight"
                hitSlop={6}
              >
                <Text
                  style={[
                    styles.registerLinkText,
                    { color: isPlant ? COLORS.plantAccent : COLORS.distributorAccent },
                  ]}
                >
                  {isPlant ? 'Register Plant' : 'Register Distributor'}
                </Text>
              </NativePressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: '#EAE6DF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111C24',
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    borderRadius: 12,
    padding: 10,
    gap: 8,
    marginBottom: 14,
  },
  errorBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.errorText,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  forgotPasswordText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  segmentedRoleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F1E8',
    borderRadius: 14,
    padding: 3.5,
    borderWidth: 1,
    borderColor: '#EAE6DF',
    gap: 4,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 9.5,
    borderRadius: 11,
  },
  segmentTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentTabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTabTextActivePlant: {
    color: '#056B4A',
    fontWeight: '800',
  },
  segmentTabTextActiveDistributor: {
    color: '#111C24',
    fontWeight: '800',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EAE6DF',
    borderRadius: 13,
    height: 48,
    paddingHorizontal: 12,
  },
  inputIconBox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    fontWeight: '500',
    color: '#111C24',
    paddingVertical: 0,
  },
  eyeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  demoSection: {
    marginTop: 16,
  },
  demoDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  demoDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#EAE6DF',
  },
  demoDividerText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    paddingHorizontal: 10,
    letterSpacing: 0.6,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9.5,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
  },
  demoBtnPlant: {
    backgroundColor: '#ECF7F2',
    borderColor: '#A7F3D0',
  },
  demoBtnDistributor: {
    backgroundColor: '#FAF7F2',
    borderColor: '#E6D7C3',
  },
  demoBtnTextPlant: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#056B4A',
  },
  demoBtnTextDistributor: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#111C24',
  },
  registerPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 4,
  },
  registerPromptText: {
    fontSize: 12,
    color: '#64748B',
  },
  registerLinkText: {
    fontSize: 12,
    fontWeight: '800',
  },
});

export default UnifiedLoginScreen;
