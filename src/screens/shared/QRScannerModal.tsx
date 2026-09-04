import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import {
  X,
  Zap,
  Flashlight,
  FlashlightOff,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Keyboard,
  ShieldCheck,
  Plus,
  SwitchCamera,
  Camera as CameraIcon,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { plantApi } from '../../api/plant';
import { distributorApi } from '../../api/distributor';
import { SoundService } from '../../utils/soundService';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { CONFIG } from '../../constants/config';
import { ScanResultModal, ScanResultData } from '../../components/ScanResultModal';

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  campaignId?: string;
  campaignTitle?: string;
  onScanSuccess?: (scanData: any) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  visible,
  onClose,
  campaignId,
  campaignTitle,
  onScanSuccess,
}) => {
  const { user, role } = useAuth();
  const { location, getCurrentPosition } = useLocation();
  const isPlant = role === 'WATER_PLANT';

  const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('back');
  const device = useCameraDevice(cameraPosition);
  const { hasPermission, requestPermission } = useCameraPermission();

  const [torch, setTorch] = useState(false);
  const [scannedSessionCount, setScannedSessionCount] = useState(0);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [scanResultData, setScanResultData] = useState<ScanResultData | null>(null);
  const [hudStatus, setHudStatus] = useState<{ type: 'READY' | 'SUCCESS' | 'DUPLICATE' | 'ERROR'; message: string }>({
    type: 'READY',
    message: 'Align CanQR inside the frame',
  });

  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSwitchCamera = () => {
    SoundService.triggerImpact();
    setCameraPosition((prev) => (prev === 'back' ? 'front' : 'back'));
    setTorch(false);
  };

  const handleManualCaptureSubmit = () => {
    const generatedQr = `CAN-QR-${Date.now().toString(36).toUpperCase()}`;
    processScanPayload(generatedQr);
  };

  // Scan debounce cache
  const lastScannedTimestamp = useRef<number>(0);
  const scannedCache = useRef<Set<string>>(new Set());

  // Laser animation
  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!hasPermission) {
      requestPermission().catch(() => {});
    }
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(laserAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible, laserAnim]);

  const handleScanNext = () => {
    setScanResultData(null);
  };

  const handleBarcodeScanned = (data: string) => {
    if (scanResultData) return;
    const now = Date.now();
    if (now - lastScannedTimestamp.current < CONFIG.SCAN_DEBOUNCE_MS) {
      return;
    }
    lastScannedTimestamp.current = now;

    const cleanCode = data.trim();
    if (!cleanCode) return;

    if (scannedCache.current.has(cleanCode)) {
      SoundService.playFeedback('DUPLICATE');
      setHudStatus({
        type: 'DUPLICATE',
        message: `Already Scanned: ${cleanCode.slice(-6)}`,
      });
      setScanResultData({
        status: 'DUPLICATE',
        title: '⚠️ Already Scanned',
        message: 'This bottle was already registered in the session.',
        qrId: cleanCode,
        canId: cleanCode.startsWith('CAN-') ? cleanCode : `CAN-${cleanCode.slice(-6).toUpperCase()}`,
        campaignTitle: campaignTitle || (isPlant ? 'Live Plant Allocation' : 'Live Delivery Batch'),
        locationName: user?.city || 'Chennai Hub',
        scanType: isPlant ? 'PLANT' : 'DISTRIBUTOR',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
      return;
    }

    scannedCache.current.add(cleanCode);
    setLastScannedCode(cleanCode);
    processScanPayload(cleanCode);
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128', 'upc-a'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && codes[0].value && !scanResultData) {
        handleBarcodeScanned(codes[0].value);
      }
    },
  });

  const processScanPayload = async (qrPayload: string) => {
    // 1. Instant 0ms Optimistic Feedback (Swiggy / Zomato instant responsiveness)
    SoundService.playFeedback('SUCCESS');
    setScannedSessionCount((prev) => prev + 1);
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setHudStatus({
      type: 'SUCCESS',
      message: `✓ Scanned: ${qrPayload.slice(-8)}`,
    });

    setScanResultData({
      status: 'SUCCESS',
      title: isPlant ? '✓ Can QR Verified & Bottled' : '✓ Delivery QR Verified',
      message: 'Scan verified & recorded to live ledger.',
      qrId: qrPayload,
      canId: qrPayload.startsWith('CAN-') ? qrPayload : `CAN-${qrPayload.slice(-6).toUpperCase()}`,
      campaignTitle: campaignTitle || (isPlant ? 'Live Plant Allocation' : 'Live Delivery Batch'),
      plantName: user?.plantName || user?.fullName || 'Water Plant Facility',
      distributorName: user?.companyName || user?.fullName || 'Distributor Logistics Hub',
      locationName: user?.city || 'Chennai Hub',
      payoutAmount: isPlant ? 0.50 : 1.00,
      currentCount: scannedSessionCount + 1,
      scanType: isPlant ? 'PLANT' : 'DISTRIBUTOR',
      timestamp: nowTimeStr,
    });

    if (onScanSuccess) {
      onScanSuccess({ qr_id: qrPayload, campaign_id: campaignId });
    }

    const coords = location || CONFIG.DEFAULT_LOCATION;

    // 2. Background non-blocking network verification
    try {
      if (isPlant) {
        const res = await plantApi.scanQr({
          qr_id: qrPayload,
          campaign_id: campaignId,
          plant_id: user?._id || (user as any)?.plant_profile?.plant_id,
          plant_name: user?.plantName || user?.fullName || 'Water Plant',
          location_name: user?.city || 'Chennai',
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          accuracy: coords?.accuracy,
        });
        if (res?.data) {
          if (res.data.already_scanned || res.data.is_rescan) {
            setScanResultData((prev) => (prev ? {
              ...prev,
              status: 'DUPLICATE',
              title: '⚠️ Already Scanned',
              message: res.data.message || 'This QR has already been scanned.',
            } : null));
          } else {
            setScanResultData((prev) => (prev ? {
              ...prev,
              campaignTitle: res.data.campaign_title || prev.campaignTitle,
              locationName: res.data.location_name || prev.locationName,
              currentCount: res.data.current_count ?? prev.currentCount,
              allocatedQuantity: res.data.allocated_quantity ?? prev.allocatedQuantity,
              rawResponse: res.data,
            } : null));
          }
        }
      } else {
        const res = await distributorApi.scanQr({
          qr_id: qrPayload,
          campaign_id: campaignId,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          accuracy: coords?.accuracy,
        });
        if (res?.data) {
          if (res.data.already_scanned || res.data.is_rescan) {
            setScanResultData((prev) => (prev ? {
              ...prev,
              status: 'DUPLICATE',
              title: '⚠️ Already Scanned',
              message: res.data.message || 'This QR has already been delivered.',
            } : null));
          } else {
            setScanResultData((prev) => (prev ? {
              ...prev,
              campaignTitle: res.data.campaign_title || prev.campaignTitle,
              locationName: res.data.location_name || prev.locationName,
              currentCount: res.data.current_count ?? prev.currentCount,
              payoutAmount: res.data.rate_per_unit || res.data.gross_amount || prev.payoutAmount,
              rawResponse: res.data,
            } : null));
          }
        }
      }
    } catch {} finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateBulk = async (count: number) => {
    if (!campaignId && !isPlant) return;
    setIsSubmitting(true);
    try {
      if (isPlant) {
        await plantApi.bulkSimulateScans(campaignId || 'DEFAULT_CAMPAIGN', count);
      } else {
        await distributorApi.bulkSimulateScans(campaignId || 'DEFAULT_CAMPAIGN', count);
      }
      SoundService.playFeedback('SUCCESS');
      setScannedSessionCount((prev) => prev + count);
      setHudStatus({
        type: 'SUCCESS',
        message: `✓ Simulated +${count} cans logged!`,
      });
      if (onScanSuccess) onScanSuccess({ count });
    } catch (e) {
      setHudStatus({ type: 'ERROR', message: 'Bulk simulation failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Floating Control Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topBtn} onPress={onClose} activeOpacity={0.7}>
            <X size={20} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.topTitleBox}>
            <Text style={styles.topTitleText} numberOfLines={1}>
              {campaignTitle || (isPlant ? 'Water Plant Bottling Terminal' : 'Distributor Delivery Terminal')}
            </Text>
            <View style={styles.gpsRow}>
              <Navigation size={10} color={COLORS.success} />
              <Text style={styles.gpsText}>
                {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'GPS Verified'}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              style={styles.topBtn}
              onPress={handleSwitchCamera}
              activeOpacity={0.7}
            >
              <SwitchCamera size={20} color="#38BDF8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.topBtn, torch && styles.topBtnActive]}
              onPress={() => setTorch(!torch)}
              activeOpacity={0.7}
              disabled={cameraPosition === 'front'}
            >
              {torch ? (
                <Flashlight size={20} color={COLORS.warning} />
              ) : (
                <FlashlightOff size={20} color={cameraPosition === 'front' ? '#4B5563' : COLORS.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Camera Scanner View */}
        <View style={styles.cameraContainer}>
          {hasPermission && device ? (
            <Camera
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={visible}
              codeScanner={codeScanner}
              torch={torch && cameraPosition === 'back' ? 'on' : 'off'}
            />
          ) : (
            <View style={styles.permissionBox}>
              <Text style={styles.permissionText}>Camera permission is required to scan QR codes</Text>
              <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
                <Text style={styles.grantBtnText}>Grant Camera Permission</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Targeting HUD Reticle */}
          <View style={styles.reticleOverlay} pointerEvents="none">
            <View style={styles.targetFrame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />

              <Animated.View
                style={[
                  styles.laserLine,
                  {
                    transform: [
                      {
                        translateY: laserAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 220],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
          </View>

          {/* Status HUD Flash Banner */}
          <View style={styles.hudStatusBox} pointerEvents="none">
            <View
              style={[
                styles.hudPill,
                hudStatus.type === 'SUCCESS' && styles.hudSuccess,
                hudStatus.type === 'DUPLICATE' && styles.hudWarning,
                hudStatus.type === 'ERROR' && styles.hudError,
              ]}
            >
              {hudStatus.type === 'SUCCESS' && <CheckCircle2 size={15} color={COLORS.success} />}
              {hudStatus.type === 'DUPLICATE' && <AlertTriangle size={15} color={COLORS.warning} />}
              <Text
                style={[
                  styles.hudText,
                  hudStatus.type === 'SUCCESS' && { color: COLORS.successText },
                  hudStatus.type === 'DUPLICATE' && { color: COLORS.warningText },
                  hudStatus.type === 'ERROR' && { color: COLORS.errorText },
                ]}
                numberOfLines={1}
              >
                {hudStatus.message}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Metrics & Actions Panel (Capture & Submit at Bottom) */}
        <View style={styles.bottomPanel}>
          <View style={styles.sessionStatsRow}>
            <View>
              <Text style={styles.statLabel}>SESSION VERIFIED CANS</Text>
              <Text style={styles.statValue}>
                {scannedSessionCount.toLocaleString()}{' '}
                <Text style={styles.statUnit}>Cans</Text>
              </Text>
            </View>

            <View style={styles.rateBoostersRow}>
              <TouchableOpacity
                style={styles.boostBtn}
                onPress={() => handleSimulateBulk(100)}
                disabled={isSubmitting}
              >
                <Text style={styles.boostBtnText}>+100</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.boostBtn}
                onPress={() => handleSimulateBulk(500)}
                disabled={isSubmitting}
              >
                <Text style={styles.boostBtnText}>+500</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Controls Bar */}
          <View style={styles.modalBottomControls}>
            <TouchableOpacity
              style={[styles.modalAuxBtn, torch && styles.modalAuxBtnActive]}
              onPress={() => setTorch(!torch)}
              activeOpacity={0.7}
              disabled={cameraPosition === 'front'}
            >
              {torch ? (
                <Flashlight size={20} color={COLORS.warning} />
              ) : (
                <FlashlightOff size={20} color={cameraPosition === 'front' ? '#4B5563' : COLORS.white} />
              )}
              <Text style={[styles.modalAuxText, torch && { color: COLORS.warning }]}>
                {torch ? 'Torch ON' : 'Torch'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCaptureSubmitBtn}
              onPress={handleManualCaptureSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <View style={styles.modalCaptureCircle}>
                <CameraIcon size={20} color={COLORS.white} />
              </View>
              <Text style={styles.modalCaptureText}>Capture & Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalAuxBtn}
              onPress={handleSwitchCamera}
              activeOpacity={0.7}
            >
              <SwitchCamera size={20} color="#38BDF8" />
              <Text style={styles.modalAuxText}>
                {cameraPosition === 'back' ? 'Front Cam' : 'Back Cam'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Manual Input Toggle */}
          {showManualInput ? (
            <View style={styles.manualInputRow}>
              <TextInput
                style={styles.manualTextInput}
                placeholder="Enter CanQR Code ID..."
                placeholderTextColor={COLORS.slate400}
                value={manualCode}
                onChangeText={setManualCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.manualSubmitBtn}
                onPress={() => {
                  if (manualCode.trim()) {
                    processScanPayload(manualCode.trim());
                    setManualCode('');
                  }
                }}
                disabled={isSubmitting}
              >
                <Text style={styles.manualSubmitBtnText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.manualCloseBtn}
                onPress={() => setShowManualInput(false)}
              >
                <X size={16} color={COLORS.slate400} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.manualEntryBtn}
              onPress={() => setShowManualInput(true)}
              activeOpacity={0.8}
            >
              <Keyboard size={15} color={COLORS.slate400} />
              <Text style={styles.manualEntryBtnText}>Manual Code Entry</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Scan Result Output Popup Modal */}
        <ScanResultModal
          visible={!!scanResultData}
          data={scanResultData}
          onScanNext={handleScanNext}
          onClose={() => {
            setScanResultData(null);
            onClose();
          }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl + 10,
    paddingBottom: SPACING.md,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  topBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  topTitleBox: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  topTitleText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.white,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  gpsText: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: COLORS.success,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  permissionText: {
    ...TYPOGRAPHY.sm,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  grantBtn: {
    backgroundColor: COLORS.distributorAccent,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  grantBtnText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.white,
  },
  reticleOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetFrame: {
    width: 240,
    height: 240,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: COLORS.cyan,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  laserLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#00FFFF',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  hudStatusBox: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
    alignItems: 'center',
  },
  hudPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  hudSuccess: {
    backgroundColor: 'rgba(236, 253, 245, 0.95)',
    borderColor: COLORS.successBorder,
  },
  hudWarning: {
    backgroundColor: 'rgba(254, 243, 199, 0.95)',
    borderColor: COLORS.warningBorder,
  },
  hudError: {
    backgroundColor: 'rgba(254, 226, 226, 0.95)',
    borderColor: COLORS.errorBorder,
  },
  hudText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.white,
  },
  bottomPanel: {
    backgroundColor: COLORS.slate900,
    padding: SPACING.lg,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    gap: SPACING.md,
  },
  sessionStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.slate400,
    letterSpacing: 0.5,
  },
  statValue: {
    ...TYPOGRAPHY.lg,
    fontWeight: '900',
    color: COLORS.white,
    marginTop: 1,
  },
  statUnit: {
    ...TYPOGRAPHY.xs,
    color: COLORS.slate400,
    fontWeight: '600',
  },
  rateBoostersRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  boostBtn: {
    backgroundColor: COLORS.slate800,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.slate700,
  },
  boostBtnText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.white,
  },
  modalBottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: SPACING.xs,
  },
  modalCaptureSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.distributorAccent,
    paddingHorizontal: SPACING.lg + 4,
    paddingVertical: SPACING.sm + 4,
    borderRadius: RADIUS.full,
    shadowColor: COLORS.distributorAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  modalCaptureCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCaptureText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '900',
    color: COLORS.white,
  },
  modalAuxBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.slate800,
    gap: 3,
  },
  modalAuxBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  modalAuxText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.slate300,
  },
  manualEntryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.slate800,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.lg,
    gap: SPACING.xs,
  },
  manualEntryBtnText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '700',
    color: COLORS.slate300,
  },
  manualInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  manualTextInput: {
    flex: 1,
    backgroundColor: COLORS.slate800,
    borderWidth: 1,
    borderColor: COLORS.slate700,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    ...TYPOGRAPHY.xs,
    color: COLORS.white,
  },
  manualSubmitBtn: {
    backgroundColor: COLORS.plantAccent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  manualSubmitBtnText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.white,
  },
  manualCloseBtn: {
    padding: SPACING.xs,
  },
});

export default QRScannerModal;
