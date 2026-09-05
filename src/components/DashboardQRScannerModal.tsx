import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  Linking,
  TouchableOpacity,
} from 'react-native';
import {
  Camera as VisionCamera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import {
  X,
  SwitchCamera,
  Flashlight,
  FlashlightOff,
  Sparkles,
  QrCode,
  Zap,
  CheckCircle2,
  Check,
  Camera as CameraIcon,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { NativePressable } from './common/NativePressable';

const { width } = Dimensions.get('window');
const SCAN_FRAME_SIZE = Math.min(width - 64, 270);

const formatCampaignTitle = (title?: string) => {
  if (!title) return 'Commercial Delivery Batch';
  const clean = String(title).trim();
  if (clean.startsWith('REGRESSION_CAMP_')) {
    const parts = clean.split('_');
    const num = parts[2] || '1';
    return `Regression Campaign #${num}`;
  }
  if (clean.startsWith('CMP_') || clean.startsWith('CAMP_')) {
    return clean.replace(/^(CMP_|CAMP_)/, '').replace(/_/g, ' ');
  }
  return clean;
};

export interface DashboardQRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScan: (scannedCode: string) => void;
  onComplete?: (totalScannedInSession: number) => void;
  onPerformLiveScan?: () => void;
  title?: string;
  activeCampaignTitle?: string;
  activeCampaignBrand?: string;
  isPlant?: boolean;
}

export const DashboardQRScannerModal: React.FC<DashboardQRScannerModalProps> = ({
  visible,
  onClose,
  onScan,
  onComplete,
  onPerformLiveScan,
  title = 'Burst Scanner',
  activeCampaignTitle,
  activeCampaignBrand,
  isPlant = true,
}) => {
  if (!visible) return null;

  return (
    <ActiveScannerContent
      onClose={onClose}
      onScan={onScan}
      onComplete={onComplete}
      onPerformLiveScan={onPerformLiveScan}
      title={title}
      activeCampaignTitle={activeCampaignTitle}
      activeCampaignBrand={activeCampaignBrand}
      isPlant={isPlant}
    />
  );
};

const ActiveScannerContent: React.FC<Omit<DashboardQRScannerModalProps, 'visible'>> = ({
  onClose,
  onScan,
  onComplete,
  onPerformLiveScan,
  title = 'Burst Scanner',
  activeCampaignTitle,
  activeCampaignBrand,
  isPlant,
}) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isSimMode, setIsSimMode] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('back');
  const [torch, setTorch] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  const cameraDevice = useCameraDevice(cameraPosition);
  const recentCodesRef = useRef<Map<string, number>>(new Map());
  const laserAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;

  // Request camera permission on button press
  const handleRequestPermission = useCallback(async () => {
    try {
      ReactNativeHapticFeedback.trigger('impactLight', { enableVibrateFallback: true });
      const granted = await requestPermission();
      if (!granted) {
        Linking.openSettings().catch(() => {});
      }
    } catch (e) {
      Linking.openSettings().catch(() => {});
    }
  }, [requestPermission]);

  // Continuous laser animation
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [laserAnim]);

  // Trigger pulse animation & transient badge on scan
  const triggerScanFeedback = useCallback((code: string) => {
    ReactNativeHapticFeedback.trigger('impactHeavy', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });

    setSessionCount((prev) => prev + 1);
    setLastScannedCode(code);

    // Pulse animation
    pulseAnim.setValue(1.25);
    Animated.spring(pulseAnim, {
      toValue: 1,
      friction: 4,
      tension: 60,
      useNativeDriver: true,
    }).start();

    // Show transient badge
    badgeAnim.setValue(1);
    Animated.timing(badgeAnim, {
      toValue: 0,
      duration: 1500,
      delay: 800,
      useNativeDriver: true,
    }).start();
  }, [pulseAnim, badgeAnim]);

  // Code scanner with rapid burst debounce (allows different QR codes instantly)
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128'],
    onCodeScanned: (codes) => {
      const firstVal = codes[0]?.value;
      if (!firstVal) return;

      const now = Date.now();
      const lastScannedTime = recentCodesRef.current.get(firstVal) || 0;

      // Ignore if the exact same physical code was scanned in the last 1500ms
      if (now - lastScannedTime < 1500) return;

      recentCodesRef.current.set(firstVal, now);

      // Clean up old entries in recentCodesRef
      if (recentCodesRef.current.size > 50) {
        recentCodesRef.current.forEach((time, c) => {
          if (now - time > 10000) recentCodesRef.current.delete(c);
        });
      }

      triggerScanFeedback(firstVal);
      onScan(firstVal);
    },
  });

  const handleSimulateBurst = useCallback((count: number = 1) => {
    ReactNativeHapticFeedback.trigger('impactHeavy', { enableVibrateFallback: true });

    for (let i = 0; i < count; i++) {
      const mockCode = `CAN-60000${Math.floor(Math.random() * 9 + 1)}-${Math.floor(Math.random() * 89999 + 10000)}`;
      setTimeout(() => {
        triggerScanFeedback(mockCode);
        if (onPerformLiveScan) {
          onPerformLiveScan();
        } else {
          onScan(mockCode);
        }
      }, i * 180);
    }
  }, [triggerScanFeedback, onPerformLiveScan, onScan]);

  const handleCompleteScanning = useCallback(() => {
    ReactNativeHapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
    if (onComplete) {
      onComplete(sessionCount);
    } else {
      onClose();
    }
  }, [sessionCount, onComplete, onClose]);

  const handleSwitchCamera = useCallback(() => {
    ReactNativeHapticFeedback.trigger('selection', { enableVibrateFallback: true });
    setCameraPosition((prev) => (prev === 'back' ? 'front' : 'back'));
    setTorch(false);
  }, []);

  const handleToggleTorch = useCallback(() => {
    ReactNativeHapticFeedback.trigger('selection', { enableVibrateFallback: true });
    setTorch((prev) => !prev);
  }, []);

  const formattedTitle = formatCampaignTitle(activeCampaignTitle);

  // ── 1. CLEAN CAMERA ACCESS PERMISSION SCREEN FIRST (Before Showing QR Screen) ──
  if (!hasPermission && !isSimMode) {
    return (
      <Modal
        visible={true}
        animationType="fade"
        transparent={false}
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <View style={styles.permissionScreenContainer}>
          <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

          {/* Floating Top Close Bar */}
          <SafeAreaView style={styles.permissionTopSafeArea}>
            <View style={styles.permissionTopHeader}>
              <View style={styles.burstBadge}>
                <View style={styles.liveGreenDot} />
                <Text style={styles.burstBadgeText}>{title.toUpperCase()}</Text>
              </View>

              <NativePressable
                style={styles.floatingCircleBtn}
                onPress={onClose}
                hapticType="impactLight"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <X color="#FFFFFF" size={18} />
              </NativePressable>
            </View>
          </SafeAreaView>

          {/* Centered Hero Content */}
          <View style={styles.permissionHeroBody}>
            <View style={styles.permissionIconRing}>
              <View style={styles.permissionIconCircle}>
                <CameraIcon size={38} color="#10B981" strokeWidth={2.2} />
              </View>
            </View>

            <Text style={styles.permissionTitle}>Camera Access Required</Text>
            <Text style={styles.permissionSub}>
              Offfline needs camera access to scan physical QR codes on bottles and verify production batches in real time.
            </Text>

            {formattedTitle ? (
              <View style={styles.permissionCampaignPill}>
                <QrCode size={13} color="#64748B" />
                <Text style={styles.permissionCampaignPillText} numberOfLines={1}>
                  {formattedTitle}
                </Text>
              </View>
            ) : null}

            {/* Action Buttons */}
            <View style={styles.permissionActionsWrap}>
              <NativePressable
                style={styles.allowCameraPrimaryBtn}
                onPress={handleRequestPermission}
                hapticType="impactMedium"
                scaleActive={0.96}
              >
                <CameraIcon size={18} color="#FFFFFF" />
                <Text style={styles.allowCameraPrimaryBtnText}>Allow Camera Access</Text>
              </NativePressable>

              <NativePressable
                style={styles.continueSimSecondaryBtn}
                onPress={() => {
                  ReactNativeHapticFeedback.trigger('selection', { enableVibrateFallback: true });
                  setIsSimMode(true);
                }}
                hapticType="selection"
                scaleActive={0.96}
              >
                <Sparkles size={16} color="#94A3B8" />
                <Text style={styles.continueSimSecondaryBtnText}>Continue with Test Scanner</Text>
              </NativePressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // ── 2. LIVE CAMERA / BURST QR SCANNER SCREEN ──
  return (
    <Modal
      visible={true}
      animationType="fade"
      transparent={false}
      onRequestClose={handleCompleteScanning}
      statusBarTranslucent
    >
      <View style={styles.scannerModalOverlay}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Fullscreen Camera Stream */}
        {hasPermission && cameraDevice != null ? (
          <VisionCamera
            style={StyleSheet.absoluteFill}
            device={cameraDevice}
            isActive={true}
            codeScanner={codeScanner}
            torch={torch && cameraPosition === 'back' ? 'on' : 'off'}
            enableZoomGesture
          />
        ) : (
          <View style={styles.simBgCanvas} />
        )}

        {/* ── 1. MINIMAL FLOATING TOP HEADER ── */}
        <SafeAreaView style={styles.floatingHeaderSafeArea}>
          <View style={styles.floatingHeaderContainer}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.burstBadge}>
                <View style={styles.liveGreenDot} />
                <Text style={styles.burstBadgeText}>{title.toUpperCase()}</Text>
              </View>
              {formattedTitle ? (
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {formattedTitle} {activeCampaignBrand ? `• ${activeCampaignBrand}` : ''}
                </Text>
              ) : null}
            </View>

            <View style={styles.floatingHeaderActions}>
              {hasPermission && (
                <>
                  <NativePressable
                    style={styles.floatingCircleBtn}
                    onPress={handleToggleTorch}
                    hapticType="selection"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {torch ? <Flashlight color="#D6B477" size={17} /> : <FlashlightOff color="#F5F1E8" size={17} />}
                  </NativePressable>

                  <NativePressable
                    style={styles.floatingCircleBtn}
                    onPress={handleSwitchCamera}
                    hapticType="selection"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <SwitchCamera color="#F5F1E8" size={17} />
                  </NativePressable>
                </>
              )}

              <NativePressable
                style={styles.floatingCircleBtn}
                onPress={handleCompleteScanning}
                hapticType="impactLight"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X color="#F5F1E8" size={17} />
              </NativePressable>
            </View>
          </View>
        </SafeAreaView>

        {/* ── 2. MINIMAL CENTER RETICLE VIEWFINDER & HUD ── */}
        <View style={styles.scannerBody} pointerEvents="box-none">
          {/* Minimal 4-Corner Viewfinder Reticle */}
          <View style={styles.viewfinderFrame} pointerEvents="box-none">
            <View style={[styles.cornerBracket, styles.cornerTopLeft]} />
            <View style={[styles.cornerBracket, styles.cornerTopRight]} />
            <View style={[styles.cornerBracket, styles.cornerBottomLeft]} />
            <View style={[styles.cornerBracket, styles.cornerBottomRight]} />

            {/* Subtle Scanning Laser Beam (Offfline Signature Warm Gold) */}
            <Animated.View
              style={[
                styles.laserLine,
                {
                  transform: [
                    {
                      translateY: laserAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [12, SCAN_FRAME_SIZE - 12],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>

          {/* Minimal Status / Guidance Pill */}
          <Animated.View
            style={[
              styles.sessionCounterChip,
              sessionCount > 0 && styles.sessionCounterChipActive,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            {sessionCount > 0 ? (
              <CheckCircle2 size={13} color="#A7F3D0" />
            ) : (
              <View style={styles.guidanceDot} />
            )}
            <Text
              style={[
                styles.sessionCounterText,
                sessionCount > 0 && styles.sessionCounterTextActive,
              ]}
            >
              {sessionCount === 0
                ? 'Align QR code within frame'
                : `${sessionCount} ${sessionCount === 1 ? 'Can' : 'Cans'} Verified`}
            </Text>
          </Animated.View>

          {/* Minimal Last Scanned Code Pill */}
          {lastScannedCode && (
            <Animated.View style={[styles.lastScanPill, { opacity: badgeAnim }]}>
              <Check size={11} color="#A7F3D0" />
              <Text style={styles.lastScanText} numberOfLines={1}>
                {lastScannedCode}
              </Text>
            </Animated.View>
          )}
        </View>

        {/* ── 3. UNIFIED LIQUID GLASS CONTROL DOCK ── */}
        <SafeAreaView style={styles.bottomDockSafeArea}>
          <View style={styles.unifiedControlDock}>
            {/* Subtle Specular Shine on top edge */}
            <View style={styles.dockSpecularShine} pointerEvents="none" />

            {/* Multiplier Quick Chips */}
            <View style={styles.multipliersCluster}>
              <TouchableOpacity
                style={styles.multiplierChip}
                onPress={() => handleSimulateBurst(1)}
                activeOpacity={0.65}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Sparkles size={13} color="#D6B477" />
                <Text style={styles.multiplierText}>+1</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.multiplierChip}
                onPress={() => handleSimulateBurst(5)}
                activeOpacity={0.65}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Zap size={13} color="#D6B477" />
                <Text style={styles.multiplierText}>+5</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.multiplierChip}
                onPress={() => handleSimulateBurst(25)}
                activeOpacity={0.65}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Zap size={13} color="#10B981" />
                <Text style={styles.multiplierText}>+25</Text>
              </TouchableOpacity>
            </View>

            {/* Subtle Vertical Glass Separator */}
            <View style={styles.dockDivider} />

            {/* Integrated Done / Complete Action */}
            <TouchableOpacity
              style={[
                styles.dockActionBtn,
                sessionCount > 0 ? styles.dockActionBtnActive : styles.dockActionBtnEmpty,
              ]}
              onPress={handleCompleteScanning}
              activeOpacity={0.75}
            >
              {sessionCount > 0 ? (
                <>
                  <Check size={15} color="#FFFFFF" strokeWidth={2.6} />
                  <Text style={styles.dockActionTextActive} numberOfLines={1}>
                    Done ({sessionCount})
                  </Text>
                </>
              ) : (
                <Text style={styles.dockActionTextEmpty} numberOfLines={1}>
                  Done
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // ── Permission Screen Styles ──
  permissionScreenContainer: {
    flex: 1,
    backgroundColor: '#0A141A',
    justifyContent: 'space-between',
  },
  permissionTopSafeArea: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 10,
  },
  permissionTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  permissionHeroBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  permissionIconRing: {
    width: 90,
    height: 90,
    borderRadius: 34,
    backgroundColor: 'rgba(5, 107, 74, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(5, 107, 74, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#056B4A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  permissionIconCircle: {
    width: 66,
    height: 66,
    borderRadius: 24,
    backgroundColor: '#056B4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F5F1E8',
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 10,
  },
  permissionSub: {
    fontSize: 14.5,
    color: '#A8B0B3',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
    marginBottom: 20,
  },
  permissionCampaignPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(214, 180, 119, 0.25)',
    marginBottom: 32,
    maxWidth: 280,
  },
  permissionCampaignPillText: {
    color: '#D6B477',
    fontSize: 12.5,
    fontWeight: '600',
  },
  permissionActionsWrap: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  allowCameraPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#056B4A',
    borderRadius: 16,
    paddingVertical: 15,
    shadowColor: '#056B4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  allowCameraPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  continueSimSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  continueSimSecondaryBtnText: {
    color: '#F5F1E8',
    fontSize: 13.5,
    fontWeight: '600',
  },

  // ── Scanner Screen Styles ──
  scannerModalOverlay: {
    flex: 1,
    backgroundColor: '#0A141A',
  },
  simBgCanvas: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A141A',
  },
  floatingHeaderSafeArea: {
    zIndex: 10,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 0,
  },
  floatingHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitleWrap: {
    flex: 1,
    marginRight: 12,
  },
  burstBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveGreenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#056B4A',
  },
  burstBadgeText: {
    color: '#F5F1E8',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headerSubtitle: {
    color: '#D6B477',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  floatingHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  floatingCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(17, 28, 36, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  scannerBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  viewfinderFrame: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    position: 'relative',
    overflow: 'hidden',
  },
  cornerBracket: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#F5F1E8',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 18,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 18,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 18,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 18,
  },
  laserLine: {
    height: 2.5,
    backgroundColor: '#D6B477',
    shadowColor: '#D6B477',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 8,
    elevation: 6,
    borderRadius: 1.25,
    marginHorizontal: 16,
  },
  sessionCounterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(17, 28, 36, 0.88)',
    paddingHorizontal: 16,
    paddingVertical: 7.5,
    borderRadius: 9999,
    marginTop: 22,
    borderWidth: 1,
    borderColor: 'rgba(214, 180, 119, 0.25)',
  },
  sessionCounterChipActive: {
    backgroundColor: 'rgba(5, 107, 74, 0.90)',
    borderColor: 'rgba(167, 243, 208, 0.5)',
  },
  guidanceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D6B477',
  },
  sessionCounterText: {
    color: '#F5F1E8',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  sessionCounterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  lastScanPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(5, 107, 74, 0.20)',
    borderWidth: 1,
    borderColor: 'rgba(5, 107, 74, 0.45)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    marginTop: 8,
  },
  lastScanText: {
    color: '#10B981',
    fontSize: 11.5,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
  },
  bottomDockSafeArea: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 18,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  // ── Unified Minimal Liquid Glass Island Dock ──
  unifiedControlDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 360,
    height: 52,
    backgroundColor: 'rgba(17, 28, 36, 0.92)',
    borderRadius: 26,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 6,
    paddingVertical: 5,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0A141A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  dockSpecularShine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
  },
  multipliersCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  multiplierChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 38,
    paddingHorizontal: 11,
    borderRadius: 19,
    backgroundColor: 'rgba(25, 42, 52, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  multiplierText: {
    color: '#F5F1E8',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  dockDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 4,
  },
  dockActionBtn: {
    flex: 1,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 19,
    paddingHorizontal: 12,
  },
  dockActionBtnEmpty: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  dockActionBtnActive: {
    backgroundColor: '#056B4A',
    borderWidth: 1,
    borderColor: 'rgba(167, 243, 208, 0.45)',
    shadowColor: '#056B4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 4,
  },
  dockActionTextEmpty: {
    color: '#F5F1E8',
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  dockActionTextActive: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});

export default DashboardQRScannerModal;
