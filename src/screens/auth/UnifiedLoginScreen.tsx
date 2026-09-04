import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
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
  ShieldCheck,
  ChevronDown,
  Lock,
  Phone,
  AlertCircle,
  Zap,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { CONFIG } from '../../constants/config';

interface UnifiedLoginScreenProps {
  navigation: any;
}

export const UnifiedLoginScreen: React.FC<UnifiedLoginScreenProps> = ({ navigation }) => {
  const { signIn, demoLogin } = useAuth();

  const [selectedRole, setSelectedRole] = useState<'WATER_PLANT' | 'DISTRIBUTOR'>('WATER_PLANT');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPlant = selectedRole === 'WATER_PLANT';

  const handleLogin = async () => {
    if (!phoneOrEmail.trim() || !password) {
      setErrorMessage('Please enter both Phone/Email and Password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await signIn(phoneOrEmail, password, selectedRole);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleDemoLogin = async (role: 'WATER_PLANT' | 'DISTRIBUTOR') => {
    setIsLoading(true);
    setErrorMessage(null);
    setSelectedRole(role);

    const res = await demoLogin(role);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Demo login failed');
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
            <View style={styles.brandLogoBox}>
              <Text style={styles.brandLogoLetter}>O</Text>
            </View>
            <Text style={styles.brandTitle}>Offfline</Text>
            <View style={styles.portalBadge}>
              <ShieldCheck size={11} color={COLORS.distributorAccent} />
              <Text style={styles.portalBadgeText}>MOBILE OPERATOR PORTAL</Text>
            </View>
            <Text style={styles.brandTagline}>
              Decentralized Physical Ad & Bottling Network
            </Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Sign in to your account</Text>
            <Text style={styles.cardSubheading}>
              Select your role to access your dedicated terminal
            </Text>

            {/* Error Alert */}
            {errorMessage && (
              <View style={styles.errorBanner}>
                <AlertCircle size={15} color={COLORS.error} />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            )}

            {/* Role Switcher Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>OPERATOR ROLE</Text>
              <TouchableOpacity
                style={[
                  styles.roleSelector,
                  isPlant ? styles.plantBorderHighlight : styles.distributorBorderHighlight,
                ]}
                onPress={() => setShowRoleDropdown(!showRoleDropdown)}
                activeOpacity={0.8}
              >
                <View style={styles.roleSelectorLeft}>
                  <View
                    style={[
                      styles.roleIconCircle,
                      isPlant ? styles.plantIconCircle : styles.distributorIconCircle,
                    ]}
                  >
                    {isPlant ? (
                      <Factory size={16} color={COLORS.plantAccent} />
                    ) : (
                      <Truck size={16} color={COLORS.distributorAccent} />
                    )}
                  </View>
                  <View>
                    <Text style={styles.roleTitle}>
                      {isPlant ? 'Water Plant / Bottler' : 'Water Distributor'}
                    </Text>
                    <Text style={styles.roleDesc}>
                      {isPlant ? 'Production & Labeling' : 'Delivery & Local Scanning'}
                    </Text>
                  </View>
                </View>
                <ChevronDown
                  size={16}
                  color={COLORS.slate400}
                  style={showRoleDropdown && { transform: [{ rotate: '180deg' }] }}
                />
              </TouchableOpacity>

              {/* Dropdown Options */}
              {showRoleDropdown && (
                <View style={styles.dropdownMenu}>
                  <TouchableOpacity
                    style={[styles.dropdownItem, isPlant && styles.dropdownItemActive]}
                    onPress={() => {
                      setSelectedRole('WATER_PLANT');
                      setShowRoleDropdown(false);
                    }}
                  >
                    <Factory size={16} color={isPlant ? COLORS.plantAccent : COLORS.slate500} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.dropdownItemTitle, isPlant && { color: COLORS.plantAccent }]}>
                        Water Plant / Bottler
                      </Text>
                      <Text style={styles.dropdownItemSubtitle}>
                        Batch bottling & label QR verification
                      </Text>
                    </View>
                    {isPlant && <ShieldCheck size={14} color={COLORS.plantAccent} />}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dropdownItem, !isPlant && styles.dropdownItemActive]}
                    onPress={() => {
                      setSelectedRole('DISTRIBUTOR');
                      setShowRoleDropdown(false);
                    }}
                  >
                    <Truck size={16} color={!isPlant ? COLORS.distributorAccent : COLORS.slate500} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.dropdownItemTitle, !isPlant && { color: COLORS.distributorAccent }]}>
                        Water Distributor
                      </Text>
                      <Text style={styles.dropdownItemSubtitle}>
                        Retail scans & delivery logging
                      </Text>
                    </View>
                    {!isPlant && <ShieldCheck size={14} color={COLORS.distributorAccent} />}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Phone or Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>MOBILE NUMBER OR EMAIL</Text>
              <View style={styles.inputWrapper}>
                <Phone size={16} color={COLORS.slate400} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder={isPlant ? 'mfr@offfline.in or +91 98765 43210' : 'distributor@offfline.in'}
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
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotPasswordText}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <Lock size={16} color={COLORS.slate400} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { paddingRight: 40 }]}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.slate400}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={16} color={COLORS.slate400} />
                  ) : (
                    <Eye size={16} color={COLORS.slate400} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.signInBtnText}>Sign In</Text>
                  <ArrowRight size={16} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>

            {/* Quick Demo Bypass for Testing */}
            <View style={styles.demoSection}>
              <View style={styles.demoDividerRow}>
                <View style={styles.demoDivider} />
                <Text style={styles.demoDividerText}>OR 1-CLICK DEMO LOGIN</Text>
                <View style={styles.demoDivider} />
              </View>

              <View style={styles.demoButtonsRow}>
                <TouchableOpacity
                  style={[styles.demoBtn, styles.demoBtnPlant]}
                  onPress={() => handleDemoLogin('WATER_PLANT')}
                  disabled={isLoading}
                >
                  <Zap size={13} color={COLORS.plantAccent} />
                  <Text style={styles.demoBtnTextPlant}>Demo Plant</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.demoBtn, styles.demoBtnDistributor]}
                  onPress={() => handleDemoLogin('DISTRIBUTOR')}
                  disabled={isLoading}
                >
                  <Zap size={13} color={COLORS.distributorAccent} />
                  <Text style={styles.demoBtnTextDistributor}>Demo Distributor</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Registration Link */}
            <View style={styles.registerPrompt}>
              <Text style={styles.registerPromptText}>Don't have an operator account?</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(isPlant ? 'PlantRegister' : 'DistributorRegister')
                }
              >
                <Text
                  style={[
                    styles.registerLinkText,
                    { color: isPlant ? COLORS.plantAccent : COLORS.distributorAccent },
                  ]}
                >
                  {isPlant ? 'Register Plant' : 'Register Distributor'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Backend Status */}
          <View style={styles.footerInfo}>
            <View style={styles.connectedDot} />
            <Text style={styles.footerEndpointText}>Connected: {CONFIG.API_BASE_URL}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    justifyContent: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  brandLogoBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.slate900,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
  },
  brandLogoLetter: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
  },
  brandTitle: {
    ...TYPOGRAPHY.xxl,
    fontWeight: '900',
    color: COLORS.slate900,
    letterSpacing: -0.5,
  },
  portalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.distributorBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4,
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.distributorBorder,
  },
  portalBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.distributorAccent,
    letterSpacing: 0.5,
  },
  brandTagline: {
    ...TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.slate500,
    marginTop: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  cardHeading: {
    ...TYPOGRAPHY.lg,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  cardSubheading: {
    ...TYPOGRAPHY.xs,
    color: COLORS.slate500,
    marginTop: 2,
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
  },
  errorBannerText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '700',
    color: COLORS.errorText,
    flex: 1,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.slate700,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forgotPasswordText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '700',
    color: COLORS.slate500,
  },
  roleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.slate50,
    borderWidth: 1.5,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
  },
  plantBorderHighlight: {
    borderColor: COLORS.plantBorder,
  },
  distributorBorderHighlight: {
    borderColor: COLORS.distributorBorder,
  },
  roleSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  roleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plantIconCircle: {
    backgroundColor: COLORS.plantBg,
  },
  distributorIconCircle: {
    backgroundColor: COLORS.distributorBg,
  },
  roleTitle: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  roleDesc: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.slate500,
  },
  dropdownMenu: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.xs,
    padding: SPACING.xs,
    ...SHADOWS.md,
    gap: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.slate50,
  },
  dropdownItemTitle: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  dropdownItemSubtitle: {
    fontSize: 10,
    color: COLORS.slate500,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    position: 'relative',
  },
  inputIcon: {
    marginLeft: SPACING.md,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: Platform.OS === 'ios' ? SPACING.md : SPACING.sm + 2,
    ...TYPOGRAPHY.xs,
    color: COLORS.slate900,
  },
  eyeBtn: {
    position: 'absolute',
    right: SPACING.md,
    padding: 4,
  },
  signInBtn: {
    backgroundColor: COLORS.slate900,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
    ...SHADOWS.sm,
  },
  signInBtnText: {
    ...TYPOGRAPHY.sm,
    fontWeight: '800',
    color: COLORS.white,
  },
  demoSection: {
    marginTop: SPACING.lg,
  },
  demoDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  demoDivider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  demoDividerText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.slate400,
    paddingHorizontal: SPACING.sm,
    letterSpacing: 0.5,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 4,
  },
  demoBtnPlant: {
    backgroundColor: COLORS.plantBg,
    borderColor: COLORS.plantBorder,
  },
  demoBtnDistributor: {
    backgroundColor: COLORS.distributorBg,
    borderColor: COLORS.distributorBorder,
  },
  demoBtnTextPlant: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.plantAccent,
  },
  demoBtnTextDistributor: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.distributorAccent,
  },
  registerPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    gap: 4,
  },
  registerPromptText: {
    ...TYPOGRAPHY.xs,
    color: COLORS.slate500,
  },
  registerLinkText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    gap: 6,
  },
  connectedDot: {
    width: 6,
    height: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.success,
  },
  footerEndpointText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: COLORS.slate400,
  },
});

export default UnifiedLoginScreen;
