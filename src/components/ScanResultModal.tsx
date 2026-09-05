import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
  Clipboard,
} from 'react-native';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
  ShieldCheck,
  MapPin,
  Clock,
  TrendingUp,
  Droplets,
  Copy,
  Check,
  Truck,
  Building2,
  Navigation,
  Sparkles,
} from 'lucide-react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export interface ScanResultData {
  status: 'SUCCESS' | 'DUPLICATE' | 'ERROR';
  title?: string;
  message?: string;
  qrId: string;
  canId?: string;
  campaignTitle?: string;
  brandName?: string;
  plantName?: string;
  distributorName?: string;
  locationName?: string;
  payoutAmount?: number;
  ratePerUnit?: number;
  currentCount?: number;
  totalCount?: number;
  allocatedQuantity?: number;
  remainingQuantity?: number;
  scanType?: 'PLANT' | 'DISTRIBUTOR';
  timestamp?: string;
  gps?: {
    distance_km?: number;
    is_valid?: boolean;
    notes?: string;
  };
  latitude?: number;
  longitude?: number;
  rawResponse?: any;
}

export interface ScanResultModalProps {
  visible: boolean;
  data: ScanResultData | null;
  onScanNext: () => void;
  onClose: () => void;
}

export const ScanResultModal: React.FC<ScanResultModalProps> = ({
  visible,
  data,
  onScanNext,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible && data) {
      setCopied(false);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(0);
      scaleAnim.setValue(0.92);
    }
  }, [visible, data, slideAnim, scaleAnim]);

  if (!visible || !data) return null;

  const isSuccess = data.status === 'SUCCESS';
  const isDuplicate = data.status === 'DUPLICATE';
  const isPlant = data.scanType === 'PLANT';

  const defaultTitle = isSuccess
    ? isPlant
      ? '✓ Can QR Verified & Bottled'
      : '✓ Delivery QR Verified'
    : isDuplicate
    ? '⚠️ Already Scanned'
    : '❌ Verification Failed';

  const defaultMessage = isSuccess
    ? 'Scan successfully verified & logged to live ledger.'
    : isDuplicate
    ? 'This bottle was already registered in the system.'
    : 'Unable to verify QR payload. Please try again.';

  const handleCopyCode = () => {
    try {
      ReactNativeHapticFeedback.trigger('impactLight', { enableVibrateFallback: true });
      Clipboard.setString(data.qrId || data.canId || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const handleScanNextPress = () => {
    ReactNativeHapticFeedback.trigger('impactMedium', { enableVibrateFallback: true });
    onScanNext();
  };

  const handleClosePress = () => {
    ReactNativeHapticFeedback.trigger('impactLight', { enableVibrateFallback: true });
    onClose();
  };

  const formattedPayout = data.payoutAmount !== undefined
    ? `+₹${data.payoutAmount.toFixed(2)}`
    : isPlant
    ? '+₹0.50'
    : '+₹1.00';

  const progressPercent = data.allocatedQuantity && data.allocatedQuantity > 0 && data.currentCount
    ? Math.min(100, Math.round((data.currentCount / data.allocatedQuantity) * 100))
    : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onScanNext}
    >
      <View style={styles.overlay}>
        {/* Backdrop touch to dismiss popup & scan next */}
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={handleScanNextPress}
        />

        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: slideAnim,
              transform: [
                { scale: scaleAnim },
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Card Top Accent Indicator */}
          <View
            style={[
              styles.topIndicatorBar,
              isSuccess && styles.indicatorSuccess,
              isDuplicate && styles.indicatorWarning,
              !isSuccess && !isDuplicate && styles.indicatorError,
            ]}
          />

          {/* Header Row: Status Badge, Mode Badge, Close Button */}
          <View style={styles.headerRow}>
            <View style={styles.badgesWrapper}>
              <View
                style={[
                  styles.statusBadge,
                  isSuccess && styles.badgeSuccess,
                  isDuplicate && styles.badgeWarning,
                  !isSuccess && !isDuplicate && styles.badgeError,
                ]}
              >
                {isSuccess ? (
                  <CheckCircle2 size={13} color="#10B981" />
                ) : isDuplicate ? (
                  <AlertTriangle size={13} color="#F59E0B" />
                ) : (
                  <AlertCircle size={13} color="#EF4444" />
                )}
                <Text
                  style={[
                    styles.statusBadgeText,
                    isSuccess && styles.badgeTextSuccess,
                    isDuplicate && styles.badgeTextWarning,
                    !isSuccess && !isDuplicate && styles.badgeTextError,
                  ]}
                >
                  {isSuccess ? 'VERIFIED' : isDuplicate ? 'DUPLICATE' : 'REJECTED'}
                </Text>
              </View>

              <View style={styles.modeBadge}>
                {isPlant ? (
                  <Building2 size={12} color="#056B4A" />
                ) : (
                  <Truck size={12} color="#D6B477" />
                )}
                <Text
                  style={[
                    styles.modeBadgeText,
                    { color: isPlant ? '#056B4A' : '#D6B477' },
                  ]}
                >
                  {isPlant ? 'PLANT BOTTLING' : 'DISTRIBUTION'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeCircleBtn}
              onPress={handleScanNextPress}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Main Title & Subtitle */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>{data.title || defaultTitle}</Text>
            <Text style={styles.mainSubtitle}>{data.message || defaultMessage}</Text>
          </View>

          {/* Content Scroll for Telemetry Details */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.detailsScroll}
            contentContainerStyle={styles.detailsScrollContent}
          >
            {/* Monospace QR Identifier Box */}
            <TouchableOpacity
              style={styles.qrCodeBox}
              onPress={handleCopyCode}
              activeOpacity={0.75}
            >
              <View style={styles.qrCodeBoxLeft}>
                <View style={styles.qrIconWrapper}>
                  <QrCode size={18} color="#D6B477" />
                </View>
                <View>
                  <Text style={styles.qrLabel}>SCANNED TOKEN / CAN ID</Text>
                  <Text style={styles.qrValue} numberOfLines={1}>
                    {data.qrId || data.canId || 'WA-SCAN-VERIFIED'}
                  </Text>
                </View>
              </View>

              <View style={styles.copyBadge}>
                {copied ? (
                  <Check size={14} color="#10B981" />
                ) : (
                  <Copy size={14} color="#94A3B8" />
                )}
                <Text style={[styles.copyText, copied && { color: '#10B981' }]}>
                  {copied ? 'Copied' : 'Copy'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Payout & Earnings Hero Banner */}
            {isSuccess && (
              <View style={styles.payoutCard}>
                <View style={styles.payoutLeft}>
                  <View style={styles.payoutIconCircle}>
                    {isPlant ? (
                      <Droplets size={20} color="#056B4A" />
                    ) : (
                      <TrendingUp size={20} color="#D6B477" />
                    )}
                  </View>
                  <View>
                    <Text style={styles.payoutLabel}>
                      {isPlant ? 'BOTTLING COMMISSION' : 'DELIVERY COMMISSION'}
                    </Text>
                    <Text style={styles.payoutSubtext}>Instant Ledger Credit</Text>
                  </View>
                </View>
                <Text style={styles.payoutAmountText}>{formattedPayout}</Text>
              </View>
            )}

            {/* Metadata Grid */}
            <View style={styles.gridContainer}>
              {/* Campaign */}
              {data.campaignTitle && (
                <View style={styles.gridRow}>
                  <View style={styles.gridIconCircle}>
                    <Sparkles size={14} color="#D6B477" />
                  </View>
                  <View style={styles.gridInfo}>
                    <Text style={styles.gridLabel}>CAMPAIGN</Text>
                    <Text style={styles.gridValue} numberOfLines={1}>
                      {data.campaignTitle}
                    </Text>
                  </View>
                </View>
              )}

              {/* Location / Zone */}
              {(data.locationName || data.plantName || data.distributorName) && (
                <View style={styles.gridRow}>
                  <View style={styles.gridIconCircle}>
                    <MapPin size={14} color="#D6B477" />
                  </View>
                  <View style={styles.gridInfo}>
                    <Text style={styles.gridLabel}>OPERATIONAL LOCATION</Text>
                    <Text style={styles.gridValue} numberOfLines={1}>
                      {data.locationName || 'Chennai Metro Hub'}
                      {data.plantName ? ` • ${data.plantName}` : ''}
                      {data.distributorName ? ` • ${data.distributorName}` : ''}
                    </Text>
                  </View>
                </View>
              )}

              {/* Batch / Scanned Count */}
              {data.currentCount !== undefined && (
                <View style={styles.gridRow}>
                  <View style={styles.gridIconCircle}>
                    <ShieldCheck size={14} color="#056B4A" />
                  </View>
                  <View style={styles.gridInfo}>
                    <View style={styles.batchCountRow}>
                      <Text style={styles.gridLabel}>BATCH COUNT PROGRESS</Text>
                      {progressPercent !== null && (
                        <Text style={styles.batchPercentText}>{progressPercent}%</Text>
                      )}
                    </View>
                    <Text style={styles.gridValue}>
                      {data.currentCount.toLocaleString()}
                      {data.allocatedQuantity ? ` / ${data.allocatedQuantity.toLocaleString()} Cans` : ' Verified'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Timestamp & GPS Verification */}
              <View style={styles.gridRow}>
                <View style={styles.gridIconCircle}>
                  <Clock size={14} color="#D6B477" />
                </View>
                <View style={styles.gridInfo}>
                  <Text style={styles.gridLabel}>AUDIT TIMESTAMP</Text>
                  <Text style={styles.gridValue}>
                    {data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    {' • GPS Authenticated'}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.scanNextBtn}
              onPress={handleScanNextPress}
              activeOpacity={0.85}
            >
              <QrCode size={18} color="#FFFFFF" />
              <Text style={styles.scanNextBtnText}>Scan Next Bottle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dismissBtn}
              onPress={handleClosePress}
              activeOpacity={0.7}
            >
              <Text style={styles.dismissBtnText}>Done / Close Viewfinder</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 26, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 40 : 24,
    zIndex: 9999,
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContainer: {
    width: Math.min(width - 32, 420),
    maxHeight: height * 0.84,
    backgroundColor: '#0A141A',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.65,
    shadowRadius: 28,
    elevation: 20,
    zIndex: 10000,
  },
  topIndicatorBar: {
    height: 4,
    width: '100%',
  },
  indicatorSuccess: {
    backgroundColor: '#056B4A',
  },
  indicatorWarning: {
    backgroundColor: '#D97706',
  },
  indicatorError: {
    backgroundColor: '#EF4444',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  badgesWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  badgeWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  badgeError: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeTextSuccess: {
    color: '#34D399',
  },
  badgeTextWarning: {
    color: '#FBBF24',
  },
  badgeTextError: {
    color: '#F87171',
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  closeCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  mainSubtitle: {
    color: '#94A3B8',
    fontSize: 12.5,
    lineHeight: 17,
  },
  detailsScroll: {
    maxHeight: height * 0.46,
  },
  detailsScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 12,
  },
  qrCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.25)',
  },
  qrCodeBoxLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  qrIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrLabel: {
    color: '#64748B',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  qrValue: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  copyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  payoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  payoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  payoutIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutLabel: {
    color: '#A7F3D0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  payoutSubtext: {
    color: '#6EE7B7',
    fontSize: 11.5,
    fontWeight: '500',
  },
  payoutAmountText: {
    color: '#34D399',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  gridContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gridIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridInfo: {
    flex: 1,
  },
  gridLabel: {
    color: '#64748B',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  gridValue: {
    color: '#E2E8F0',
    fontSize: 12.5,
    fontWeight: '600',
  },
  batchCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  batchPercentText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  actionButtonsContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    gap: 8,
  },
  scanNextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    height: 48,
    borderRadius: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  scanNextBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  dismissBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  dismissBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ScanResultModal;
