import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  FileText,
  QrCode,
  TrendingUp,
  Search,
  X,
  CheckCircle2,
  ShieldCheck,
  User,
  KeyRound,
  LogOut,
  Camera as CameraIcon,
  RotateCcw,
  Clock,
  Download,
  Truck,
  Sparkles,
  MapPin,
  SwitchCamera,
  Flashlight,
  FlashlightOff,
  ChevronDown,
  Check,
  Building2,
  Mail,
  Phone,
  FileCheck,
  CreditCard,
  Lock,
  AlertCircle,
  Gauge,
} from 'lucide-react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { extractCleanQrId, resolveLocationGps } from '../../utils/locationProfiles';
import { distributorApi } from '../../api/distributor';
import { paymentsApi } from '../../api/payments';
import { authApi } from '../../api/auth';
import { api } from '../../api/client';
import { apiCache } from '../../api/cache';
import { ScanResultModal, ScanResultData } from '../../components/ScanResultModal';
import { LiquidGlassNavBar } from '../../components/LiquidGlassNavBar';
import { PoppedBottomSheetModal } from '../../components/PoppedBottomSheetModal';
import { NativePressable } from '../../components/common/NativePressable';
import { AppleButton } from '../../components/common/AppleButton';
import { DashboardQRScannerModal } from '../../components/DashboardQRScannerModal';
import { OffflineBrandWordmark } from '../../components/common/OffflineBrandWordmark';
import { AppleCelebrationToast, ToastData } from '../../components/common/AppleCelebrationToast';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(64, Math.floor((width - 48) / 4));

// ── Custom Pixel-Perfect SVG Icons (Apple Minimalist Redesign) ──
const MapPinIcon = ({ size = 20, color = '#2563EB' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8.13401 2 5 5.13401 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13401 15.866 2 12 2Z"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="9" r="2.8" stroke={color} strokeWidth="2.2" />
  </Svg>
);

const DocSheetIcon = ({ size = 20, color = '#2563EB' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 4C5 2.89543 5.89543 2 7 2H13.8L19 7.2V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V4Z"
      fill={color}
    />
    <Path
      d="M13.8 2V6.2C13.8 6.75228 14.2477 7.2 14.8 7.2H19L13.8 2Z"
      fill="#FFFFFF"
      fillOpacity={0.35}
    />
    <Rect x="8" y="10.5" width="8" height="1.8" rx="0.9" fill="#FFFFFF" />
    <Rect x="8" y="14" width="8" height="1.8" rx="0.9" fill="#FFFFFF" />
    <Rect x="8" y="17.5" width="5" height="1.8" rx="0.9" fill="#FFFFFF" />
  </Svg>
);

const BottleBadgeIcon = ({ size = 20, color = '#0891B2' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="10" y="2" width="4" height="2" rx="0.8" fill={color} />
    <Path d="M10 4H14V6.2H10V4Z" fill={color} />
    <Path
      d="M8.2 7.2C7.5 7.9 7 9.1 7 10.5V19C7 20.6569 8.34315 22 10 22H14C15.6569 22 17 20.6569 17 19V10.5C17 9.1 16.5 7.9 15.8 7.2C15.2 6.6 14.2 6.2 14.2 6.2H9.8C9.8 6.2 8.8 6.6 8.2 7.2Z"
      fill={color}
    />
    <Rect x="9" y="11" width="6" height="6.5" rx="1.5" fill="#FFFFFF" fillOpacity={0.92} />
    <Path
      d="M12 12.6C12 12.6 10.6 14.1 10.6 15C10.6 15.77 11.23 16.4 12 16.4C12.77 16.4 13.4 15.77 13.4 15C13.4 14.1 12 12.6 12 12.6Z"
      fill={color}
    />
  </Svg>
);

const TruckBadgeIcon = ({ size = 20, color = '#16A34A' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 5.5C2 4.67157 2.67157 4 3.5 4H14C14.5523 4 15 4.44772 15 5V15H3.5C2.67157 15 2 14.3284 2 13.5V5.5Z"
      fill={color}
    />
    <Path
      d="M15 7.5H18.2C18.65 7.5 19.08 7.7 19.38 8.04L21.78 10.74C21.92 10.9 22 11.11 22 11.33V14C22 14.5523 21.5523 15 21 15H15V7.5Z"
      fill={color}
    />
    <Path
      d="M16.5 9H18.2C18.35 9 18.5 9.08 18.6 9.2L20.2 11.2C20.27 11.28 20.3 11.39 20.3 11.5V11.8H16.5V9Z"
      fill="#FFFFFF"
    />
    <Circle cx="6.5" cy="16.5" r="2.6" fill="#FFFFFF" stroke={color} strokeWidth="1.8" />
    <Circle cx="6.5" cy="16.5" r="1.1" fill={color} />
    <Circle cx="17.5" cy="16.5" r="2.6" fill="#FFFFFF" stroke={color} strokeWidth="1.8" />
    <Circle cx="17.5" cy="16.5" r="1.1" fill={color} />
  </Svg>
);

const RupeeBadgeIcon = ({ size = 20, color = '#7C3AED' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 3H18M6 8H18M6 13L15 22M6 13H10C12.7614 13 15 10.7614 15 8C15 5.23858 12.7614 3 10 3"
      stroke={color}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Apple Shimmer Skeleton Block ──
const ShimmerBlock: React.FC<{ style?: any; borderRadius?: number }> = ({
  style,
  borderRadius = 8,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerAnim]);

  return (
    <Animated.View
      style={[
        {
          backgroundColor: '#E2E8F0',
          borderRadius,
          opacity: shimmerAnim,
        },
        style,
      ]}
    />
  );
};

interface AnimatedGlassMetricTileProps {
  icon: React.ReactNode;
  iconBgColor: string;
  unitText: string;
  unitTextColor?: string;
  unitBgColor?: string;
  value: string | number;
  label: string;
  delay?: number;
  loading?: boolean;
  onPress?: () => void;
}

const AnimatedGlassMetricTileComponent: React.FC<AnimatedGlassMetricTileProps> = ({
  icon,
  iconBgColor,
  unitText,
  unitTextColor = '#64748B',
  unitBgColor = 'rgba(241, 245, 249, 0.9)',
  value,
  label,
  delay = 0,
  loading = false,
  onPress,
}) => {
  const pressScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 340,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  // Pulse effect when number value changes
  useEffect(() => {
    if (!loading) {
      pulseAnim.setValue(1.06);
      Animated.spring(pulseAnim, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }).start();
    }
  }, [value, loading]);

  const handlePressIn = () => {
    if (loading) return;
    Animated.timing(pressScale, {
      toValue: 0.96,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (loading) return;
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (loading) return;
    try {
      ReactNativeHapticFeedback.trigger('selection', {
        enableVibrateFallback: true,
      });
    } catch (e) {}
    if (onPress) onPress();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <Animated.View
        style={[
          styles.glassMetricTile,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: pressScale },
            ],
          },
        ]}
      >
        {/* Top Header Row (Icon + Unit Pill) */}
        <View style={styles.tileHeaderRow}>
          {loading ? (
            <>
              <ShimmerBlock style={{ width: 32, height: 32 }} borderRadius={10} />
              <ShimmerBlock style={{ width: 44, height: 20 }} borderRadius={7} />
            </>
          ) : (
            <>
              <View style={[styles.tileIconSquircle, { backgroundColor: iconBgColor }]}>
                {icon}
              </View>
              <View style={[styles.tileUnitPill, { backgroundColor: unitBgColor }]}>
                <Text style={[styles.tileUnitText, { color: unitTextColor }]}>
                  {unitText}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Big Apple Bold Counter */}
        <View style={styles.tileCounterWrap}>
          {loading ? (
            <ShimmerBlock style={{ width: 70, height: 22 }} borderRadius={5} />
          ) : (
            <Animated.Text
              style={[
                styles.tileCounter,
                { transform: [{ scale: pulseAnim }] },
                String(value).length > 7 && { fontSize: 16 },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {value}
            </Animated.Text>
          )}
        </View>

        {/* Label Row */}
        <View style={styles.tileLabelWrap}>
          {loading ? (
            <ShimmerBlock style={{ width: '85%', height: 13 }} borderRadius={4} />
          ) : (
            <Text style={styles.tileLabel} numberOfLines={2}>
              {label}
            </Text>
          )}
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const AnimatedGlassMetricTile = React.memo(AnimatedGlassMetricTileComponent);

// ── Apple Scan Card Skeleton Placeholder ──
const ScanCardSkeleton = () => (
  <View style={styles.scanCardSkeleton}>
    <View style={styles.scanCardLeft}>
      <View style={{ flex: 1, gap: 5 }}>
        <ShimmerBlock style={{ width: '55%', height: 15 }} borderRadius={5} />
        <ShimmerBlock style={{ width: '70%', height: 11 }} borderRadius={3} />
      </View>
    </View>
    <View style={{ alignItems: 'flex-end', gap: 5 }}>
      <ShimmerBlock style={{ width: 60, height: 20 }} borderRadius={10} />
      <ShimmerBlock style={{ width: 40, height: 10 }} borderRadius={3} />
    </View>
  </View>
);

const formatCampaignTitle = (title: string) => {
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

// ── Apple Settlement Card Skeleton Placeholder ──
const SettlementCardSkeleton = () => (
  <View style={styles.settlementCardSkeleton}>
    <View style={{ flex: 1, gap: 5, marginRight: 10 }}>
      <ShimmerBlock style={{ width: '60%', height: 14 }} borderRadius={4} />
      <ShimmerBlock style={{ width: '38%', height: 11 }} borderRadius={3} />
    </View>
    <View style={{ alignItems: 'flex-end', gap: 5 }}>
      <ShimmerBlock style={{ width: 60, height: 14 }} borderRadius={4} />
      <ShimmerBlock style={{ width: 48, height: 18 }} borderRadius={9} />
    </View>
  </View>
);

interface ScanRecord {
  id: string;
  can_id: string;
  campaign_title: string;
  location_name: string;
  deliveryTime: string;
  payout_amount: number;
  status: string;
}

interface SettlementRecord {
  id: string;
  campaignTitle: string;
  brandName: string;
  bottlesCount: number;
  commission: number;
  deliveryDate: string;
  settlementStatus: 'SETTLED' | 'PENDING';
}

const DistributorScanCardItem = React.memo(({
  scan,
  onSelect,
}: {
  scan: ScanRecord;
  onSelect: (scan: ScanRecord) => void;
}) => {
  return (
    <NativePressable
      style={styles.scanCard}
      onPress={() => onSelect(scan)}
      hapticType="selection"
      scaleActive={0.98}
    >
      <View style={styles.scanCardLeft}>
        <View style={styles.scanCardTextWrap}>
          <Text style={styles.scanCanId}>{scan.can_id}</Text>
          <Text style={styles.scanCampaignSub} numberOfLines={1}>
            {scan.campaign_title} • {scan.location_name}
          </Text>
        </View>
      </View>
      <View style={styles.scanCardRight}>
        <View style={styles.appleVerifiedPill}>
          <View style={styles.verifiedDot} />
          <Text style={styles.appleVerifiedText}>Verified</Text>
        </View>
        <Text style={styles.scanTime}>{scan.deliveryTime}</Text>
      </View>
    </NativePressable>
  );
});

const DistributorSettlementCardItem = React.memo(({ record }: { record: SettlementRecord }) => {
  const isSettled = record.settlementStatus === 'SETTLED';
  const displayTitle = formatCampaignTitle(record.campaignTitle);
  const formattedAmount = `+₹${record.commission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedBottles = `${record.bottlesCount.toLocaleString('en-IN')} cans`;

  return (
    <View style={styles.settlementCard}>
      <View style={styles.settlementCardMiddle}>
        <Text style={styles.settlementCardTitle} numberOfLines={1}>
          {displayTitle}
        </Text>
        <Text style={styles.settlementCardSub} numberOfLines={1}>
          {record.brandName || 'Brand Partner'} • {formattedBottles}
        </Text>
      </View>

      <View style={styles.settlementCardRight}>
        <Text style={styles.settlementCardAmount}>{formattedAmount}</Text>
        <View
          style={[
            styles.appleSettleBadge,
            isSettled ? styles.appleSettleBadgeSettled : styles.appleSettleBadgePending,
          ]}
        >
          <View
            style={[
              styles.settleDot,
              isSettled ? styles.settleDotSettled : styles.settleDotPending,
            ]}
          />
          <Text
            style={[
              styles.appleSettleBadgeText,
              isSettled ? styles.appleSettleBadgeTextSettled : styles.appleSettleBadgeTextPending,
            ]}
          >
            {isSettled ? 'Settled' : 'Pending'}
          </Text>
        </View>
      </View>
    </View>
  );
});

export function DistributorDashboardScreen({ navigation }: any) {
  const { user, signOut, refreshProfile } = useAuth();
  const { location } = useLocation();
  const currentUser = user;

  const [activeTab, setActiveTab] = useState<'scan-reports' | 'settlement-report'>('scan-reports');

  const handleTabSelect = useCallback((tabKey: string) => {
    setActiveTab(tabKey as any);
  }, []);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastData, setToastData] = useState<ToastData | string | null>(null);

  // Data
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [ledgerRecords, setLedgerRecords] = useState<SettlementRecord[]>([]);

  // Lazy Loading / Pagination (10 items per page with infinite scroll)
  const PAGE_SIZE = 10;
  const [scansLimit, setScansLimit] = useState(PAGE_SIZE);
  const [settlementsLimit, setSettlementsLimit] = useState(PAGE_SIZE);

  // Modals
  const [showQrModal, setShowQrModal] = useState(false);
  const [scanResultData, setScanResultData] = useState<ScanResultData | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ScanRecord | null>(null);
  const activeRecordRef = useRef<ScanRecord | null>(null);
  if (selectedRecord) {
    activeRecordRef.current = selectedRecord;
  }
  const currentRecord = selectedRecord || activeRecordRef.current;

  // Profile Form States
  const [profileOrgName, setProfileOrgName] = useState(
    currentUser?.companyName || currentUser?.fullName || 'Distributor Facility'
  );
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileGstin, setProfileGstin] = useState(currentUser?.distributor_profile?.gstin || '');
  const [profileLicenseId, setProfileLicenseId] = useState(currentUser?.distributor_profile?.license_id || '');
  const [profileBankName, setProfileBankName] = useState(currentUser?.distributor_profile?.bank_name || '');
  const [profileAccountNo, setProfileAccountNo] = useState(currentUser?.distributor_profile?.account_no || '');
  const [profileIfsc, setProfileIfsc] = useState(currentUser?.distributor_profile?.ifsc_code || '');
  const [profileDeliveryCapacity, setProfileDeliveryCapacity] = useState(currentUser?.distributor_profile?.delivery_capacity || '15,000 cans/day');
  const [profileAddress, setProfileAddress] = useState(currentUser?.distributor_profile?.warehouse_address || currentUser?.address || 'Chennai Facility');

  // Password Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Scanner Simulator Count
  const [scannerCount, setScannerCount] = useState(0);

  const triggerToast = (
    msg: string | ToastData,
    subtitle?: string,
    options?: { highlight?: string; isCelebration?: boolean }
  ) => {
    if (typeof msg === 'string') {
      setToastData({
        title: msg,
        subtitle,
        highlight: options?.highlight,
        isCelebration: options?.isCelebration ?? (msg.includes('recorded') || msg.includes('🎉') || msg.includes('+')),
      });
    } else {
      setToastData(msg);
    }
  };

  // ── Load Real Production Data for Distributor with 0ms Cache & SWR ──
  const loadProductionData = useCallback(async (forceRefresh = false) => {
    try {
      const [distRes, publicRes, settRes, profileRes] = await Promise.all([
        distributorApi.getScans({ limit: 100 }, forceRefresh).catch(() => null),
        apiCache.fetchWithCache('public_scan_audit', () => api.get('/public/scan-audit'), { forceRefresh, ttlMs: 15000 }).catch(() => null),
        paymentsApi.getSettlements({}, forceRefresh).catch(() => null),
        apiCache.fetchWithCache('distributor_auth_me', () => authApi.me(), { forceRefresh, ttlMs: 60000 }).catch(() => null),
      ]);

      if (profileRes?.data?.user) {
        const u = profileRes.data.user;
        if (u.companyName || u.fullName) setProfileOrgName(u.companyName || u.fullName);
        if (u.email) setProfileEmail(u.email);
        if (u.phone) setProfilePhone(u.phone);
        if (u.gstin) setProfileGstin(u.gstin);
        if (u.license_id) setProfileLicenseId(u.license_id);
      }

      const backendScans = distRes?.data?.scans || [];
      const auditScans = publicRes?.data?.scans || [];

      const mappedScans: ScanRecord[] = [];
      const seenCanIds = new Set<string>();

      // 1. Process Real Scans from Network in O(N)
      if (Array.isArray(backendScans) && backendScans.length > 0) {
        backendScans.forEach((s: any, idx: number) => {
          const cId = s.can_id || s.qr_id || `CAN-${String(idx).padStart(5, '0')}`;
          seenCanIds.add(cId);
          mappedScans.push({
            id: s.id || s._id || `SCN_${idx}`,
            can_id: cId,
            campaign_title: s.campaign_name || s.campaign_title || 'Offfline Campaign',
            location_name: s.location_name || 'Chennai Hub',
            deliveryTime: s.scanned_at ? new Date(s.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '11:30 AM',
            payout_amount: Number(s.payout_amount || 0.50),
            status: 'VERIFIED',
          });
        });
      }

      if (Array.isArray(auditScans) && auditScans.length > 0) {
        auditScans.forEach((s: any, idx: number) => {
          const cId = s.can_id || s.qr_id || `CAN-000${idx}`;
          if (!seenCanIds.has(cId)) {
            seenCanIds.add(cId);
            mappedScans.push({
              id: s.scan_id || `AUD_${idx}`,
              can_id: cId,
              campaign_title: s.campaign_title || 'Offfline Partner Campaign',
              location_name: s.location_name || 'Chennai Zone',
              deliveryTime: s.scanned_at ? new Date(s.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '11:30 AM',
              payout_amount: 0.50,
              status: 'VERIFIED',
            });
          }
        });
      }

      setScans(mappedScans);

      // 2. Map Real Settlements from Production
      const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const productionSettlements: SettlementRecord[] = [];

      if (settRes?.data?.settlements && Array.isArray(settRes.data.settlements) && settRes.data.settlements.length > 0) {
        settRes.data.settlements.forEach((s: any) => {
          const rawAmount = s.grossAmount ?? s.netPayout ?? s.amount;
          const parsedCommission = typeof rawAmount === 'number'
            ? rawAmount
            : Number(String(rawAmount || '').replace(/[^0-9.]/g, '')) || 0;

          const bCount = Number(s.bottlesFilled || s.completedQuantity || s.scans_count || s.total_scans || 100);

          productionSettlements.push({
            id: String(s.id || s._id || `SET_${Math.random()}`),
            campaignTitle: String(s.campaignTitle || s.campaign_title || s.campaign_name || 'Distributor Batch'),
            brandName: String(s.entityName || s.payeeName || s.brand_name || 'Logistics Partner'),
            bottlesCount: bCount,
            commission: parsedCommission > 0 ? parsedCommission : bCount * 0.50,
            deliveryDate: String(s.settlementDate || s.deliveryDate || (s.created_at ? new Date(s.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : todayStr)),
            settlementStatus: String(s.status || s.settlementStatus || '').toUpperCase().includes('PAID') || String(s.status || s.settlementStatus || '').toUpperCase().includes('SETTLED') ? 'SETTLED' : 'PENDING',
          });
        });
      }

      setLedgerRecords(productionSettlements);
    } catch (e) {
      console.warn('Failed to load distributor data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProductionData();
  }, [loadProductionData]);

  // ── Real Camera & Vision Code Burst Scanner Handlers (Web Parity) ──
  const handleRealQrScanned = useCallback(
    async (scannedCode: string) => {
      const cleanQr = extractCleanQrId(scannedCode);
      if (!cleanQr) return;

      const coords = location
        ? { latitude: location.latitude, longitude: location.longitude, accuracy: location.accuracy }
        : resolveLocationGps(profileAddress || 'Chennai Central Hub');

      const scanPayload = {
        qr_id: cleanQr,
        campaign_id: 'CMP_LIVE_DIST_1',
        latitude: coords.latitude || 13.0827,
        longitude: coords.longitude || 80.2707,
        accuracy: coords.accuracy || 5.0,
      };

      try {
        const res = await distributorApi.scanQr(scanPayload);
        if (res.data?.success) {
          const isRescan = Boolean(res.data.is_rescan || res.data.already_scanned);
          if (isRescan) {
            triggerToast(`⚠️ Already Scanned: QR (${res.data.can_id || cleanQr}) was already delivered!`);
            return res.data;
          }

          const canId = res.data.can_id || (cleanQr.startsWith('CAN-') ? cleanQr : `CAN-${cleanQr.slice(-6).toUpperCase()}`);
          const formattedDeliveryTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const payoutVal = Number(res.data.rate_per_unit || res.data.gross_amount || 0.40);

          const newScan: ScanRecord = {
            id: res.data.scan_id || `SCN_${Date.now()}_${Math.random()}`,
            can_id: canId,
            campaign_title: res.data.campaign_title || res.data.campaign?.title || 'Live Delivery Batch',
            location_name: res.data.location_name || 'Chennai Central Hub',
            deliveryTime: formattedDeliveryTime,
            payout_amount: payoutVal,
            status: 'VERIFIED',
          };

          setScans((prev) => [newScan, ...prev]);
          setScannerCount((c) => c + 1);

          // Add to distributor ledger
          const newLedgerItem: SettlementRecord = {
            id: `DIST-${Date.now().toString().slice(-4)}`,
            campaignTitle: res.data.campaign_title || res.data.campaign?.title || 'Live Delivery Batch',
            brandName: res.data.brand_name || res.data.campaign?.brand || 'Offfline Advertiser',
            bottlesCount: 1,
            commission: payoutVal,
            deliveryDate: 'Today, ' + formattedDeliveryTime,
            settlementStatus: 'SETTLED',
          };
          setLedgerRecords((prev) => [newLedgerItem, ...prev]);

          triggerToast(`✓ Can ${canId} delivered & verified!`);
          return res.data;
        }
        return res.data;
      } catch (err: any) {
        const isDup =
          err?.response?.status === 409 ||
          err?.response?.data?.already_scanned ||
          err?.response?.data?.code === 'QR_ALREADY_SCANNED' ||
          err?.response?.data?.message?.toLowerCase?.()?.includes('already');

        if (isDup) {
          triggerToast(`⚠️ Already Scanned: QR (${cleanQr}) was already delivered!`);
          return { success: false, already_scanned: true, is_rescan: true, can_id: cleanQr };
        }

        const errMsg = err?.response?.data?.message || 'Delivery scan verification failed';
        triggerToast(`❌ ${errMsg}`);
        throw err;
      }
    },
    [location, profileAddress]
  );

  const handleSimulateBulkDistributor = useCallback(
    async (amount: number) => {
      const campId = 'CMP_LIVE_DIST_1';
      try {
        await distributorApi.bulkSimulateScans(campId, amount);
        setScannerCount((c) => c + amount);

        const formattedDeliveryTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const bulkScans: ScanRecord[] = Array.from({ length: Math.min(amount, 5) }).map((_, idx) => ({
          id: `SCN_BULK_${Date.now()}_${idx}`,
          can_id: `CAN-${Math.floor(100000 + Math.random() * 900000)}`,
          campaign_title: 'Live Delivery Batch',
          location_name: 'Chennai Central Hub',
          deliveryTime: formattedDeliveryTime,
          payout_amount: 0.40,
          status: 'VERIFIED',
        }));

        setScans((prev) => [...bulkScans, ...prev]);
        triggerToast(`🎉 Bulk batch of ${amount.toLocaleString()} deliveries recorded & verified!`);
      } catch (e) {
        triggerToast(`❌ Bulk simulation failed`);
      }
    },
    []
  );

  const handleCompleteScanSession = useCallback((totalScannedInSession: number) => {
    setShowQrModal(false);
    if (totalScannedInSession > 0) {
      triggerToast(`🎉 Batch of ${totalScannedInSession} deliveries recorded & verified!`);
      loadProductionData().catch(() => {});
    }
  }, [loadProductionData]);

  // ── Handle Real QR Scan Submission on Production ──
  const handlePerformLiveScan = useCallback(() => {
    const generatedQrId = `WA-DST-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 8999 + 1000)}`;
    handleRealQrScanned(generatedQrId);
  }, [handleRealQrScanned]);

  // ── Handle Save Profile to Production Server ──
  const handleSaveProfile = async () => {
    try {
      await authApi.updateProfile({
        companyName: profileOrgName,
        fullName: profileOrgName,
        email: profileEmail,
        phone: profilePhone,
        gstin: profileGstin,
        license_id: profileLicenseId,
        bank_name: profileBankName,
        account_no: profileAccountNo,
        ifsc: profileIfsc,
        capacity: profileDeliveryCapacity,
        address: profileAddress,
      });
      await refreshProfile().catch(() => null);
      triggerToast('✓ Distributor profile synced to production!');
      setShowProfileModal(false);
    } catch (e) {
      triggerToast('Failed to save profile');
    }
  };

  // ── Handle Change Password on Production ──
  const handleChangePassword = async () => {
    setPasswordError('');
    if (!oldPassword || !newPassword) return setPasswordError('All fields required');
    try {
      await authApi.changePassword({ current_password: oldPassword, new_password: newPassword });
      triggerToast('✓ Password updated on production server!');
      setShowChangePasswordModal(false);
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Password update failed');
    }
  };

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return scans.filter((s) => {
      if (activeFilter === 'COMPLETED' && s.status !== 'VERIFIED') return false;
      if (activeFilter === 'PENDING' && s.status === 'VERIFIED') return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        s.can_id.toLowerCase().includes(q) ||
        s.campaign_title.toLowerCase().includes(q) ||
        s.location_name.toLowerCase().includes(q)
      );
    });
  }, [scans, searchQuery, activeFilter]);

  // Reset pagination on filter or search change
  useEffect(() => {
    setScansLimit(PAGE_SIZE);
  }, [searchQuery, activeFilter]);

  // Lazy Loaded / Paginated Slices
  const displayedScans = useMemo(() => {
    return filteredRecords.slice(0, scansLimit);
  }, [filteredRecords, scansLimit]);

  const displayedSettlements = useMemo(() => {
    return ledgerRecords.slice(0, settlementsLimit);
  }, [ledgerRecords, settlementsLimit]);

  // Smooth Infinite Scroll Lazy Loading
  const handleScroll = useCallback(
    (event: any) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 150;
      if (isCloseToBottom) {
        if (activeTab === 'scan-reports') {
          setScansLimit((prev) => (prev < filteredRecords.length ? Math.min(prev + PAGE_SIZE, filteredRecords.length) : prev));
        } else if (activeTab === 'settlement-report') {
          setSettlementsLimit((prev) => (prev < ledgerRecords.length ? Math.min(prev + PAGE_SIZE, ledgerRecords.length) : prev));
        }
      }
    },
    [activeTab, filteredRecords.length, ledgerRecords.length]
  );

  const todayLabel = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const uniqueCampaignsCount = useMemo(() => {
    return new Set(scans.map((s) => s.campaign_title)).size;
  }, [scans]);

  const uniqueRoutesCount = useMemo(() => {
    return new Set(scans.map((s) => s.location_name)).size;
  }, [scans]);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── 0. FLOATING APPLE CELEBRATION TOAST ── */}
      <AppleCelebrationToast
        data={toastData}
        onDismiss={() => setToastData(null)}
      />

      {/* ── 1. FLOATING TOP BAR (Apple Pill Header) ── */}
      <View style={styles.header}>
        <View style={styles.headerLeftCol}>
          <OffflineBrandWordmark
            pageTitle={activeTab === 'scan-reports' ? 'Distributor Dashboard' : 'Distributor Settlements'}
            size="lg"
          />
        </View>
        <NativePressable
          style={styles.avatarRingWrap}
          onPress={() => setShowUserMenu(!showUserMenu)}
          hapticType="selection"
          scaleActive={0.92}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>DI</Text>
          </View>
        </NativePressable>
      </View>

      {/* ── 2. SCROLLABLE BODY ── */}
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadProductionData(true);
            }}
          />
        }
      >
        {/* ── TAB 1: SCAN REPORTS (Persistent layout container for 0ms instant tab switching) ── */}
        <View style={{ display: activeTab === 'scan-reports' ? 'flex' : 'none' }}>
          {/* ── UNIFIED MASTER METRICS CARD (Apple Liquid Frosted Glass) ── */}
          <View style={styles.unifiedGlassMasterCard}>
            <View style={styles.glassCardSpecularShine} />

            {/* Row 1 */}
            <View style={styles.metricsGridRow}>
              {/* 1. Active Orders */}
              <AnimatedGlassMetricTile
                icon={<DocSheetIcon size={17} color="#2563EB" />}
                iconBgColor="#EFF6FF"
                unitText="Batches"
                unitTextColor="#64748B"
                value={uniqueCampaignsCount}
                label="Active Orders"
                delay={0}
                loading={loading}
              />

              {/* 2. Delivered Bottles */}
              <AnimatedGlassMetricTile
                icon={<BottleBadgeIcon size={18} color="#0891B2" />}
                iconBgColor="#ECFEFF"
                unitText="Cans"
                unitTextColor="#64748B"
                value={scans.length.toLocaleString('en-IN')}
                label="Delivered Bottles"
                delay={60}
                loading={loading}
              />
            </View>

            {/* Row 2 */}
            <View style={styles.metricsGridRow}>
              {/* 3. Active Routes */}
              <AnimatedGlassMetricTile
                icon={<TruckBadgeIcon size={17} color="#16A34A" />}
                iconBgColor="#F0FDF4"
                unitText="Routes"
                unitTextColor="#64748B"
                value={uniqueRoutesCount}
                label="Active Routes"
                delay={120}
                loading={loading}
              />

              {/* 4. Distribution Commission */}
              <AnimatedGlassMetricTile
                icon={<RupeeBadgeIcon size={17} color="#7C3AED" />}
                iconBgColor="#F5F3FF"
                unitText="@ ₹0.50/can"
                unitTextColor="#7C3AED"
                unitBgColor="rgba(245, 243, 255, 0.95)"
                value={`₹${(scans.length * 0.50).toLocaleString('en-IN', { maximumFractionDigits: 1 })}`}
                label="Commission Earned"
                delay={180}
                loading={loading}
              />
            </View>
          </View>

          {/* ── SEARCH BAR (Pill Rounded Search Bar Matching Attachment) ── */}
          <View style={styles.searchContainer}>
            <Search color="#94A3B8" size={17} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search campaign, brand, or location..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <NativePressable
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchBtn}
                hapticType="selection"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X color="#94A3B8" size={18} />
              </NativePressable>
            )}
          </View>

          {/* ── STATUS FILTER TABS (All | Pending | Completed Matching Attachment) ── */}
          <View style={styles.filterPills}>
            {(['ALL', 'PENDING', 'COMPLETED'] as const).map((tab) => {
              const label = tab === 'ALL' ? 'All' : tab === 'PENDING' ? 'Pending' : 'Completed';
              const isActive = activeFilter === tab;
              return (
                <NativePressable
                  key={tab}
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                  onPress={() => setActiveFilter(tab)}
                  hapticType="selection"
                  scaleActive={0.96}
                >
                  <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                    {label}
                  </Text>
                </NativePressable>
              );
            })}
          </View>

          {/* Scans List (Memoized Cards) */}
          <View style={styles.scansList}>
            {loading && scans.length === 0 ? (
              <>
                <ScanCardSkeleton />
                <ScanCardSkeleton />
                <ScanCardSkeleton />
                <ScanCardSkeleton />
              </>
            ) : filteredRecords.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <QrCode color="#111C24" size={26} />
                </View>
                <Text style={styles.emptyTitle}>No Cans Found For Current Filter</Text>
                <Text style={styles.emptySubtitle}>
                  Scan bottles using the QR Scanner below to record live delivery events on production.
                </Text>
                <NativePressable
                  style={styles.emptyActionBtn}
                  onPress={() => setShowQrModal(true)}
                  hapticType="impactLight"
                  scaleActive={0.96}
                >
                  <CameraIcon color="#FFFFFF" size={14} />
                  <Text style={styles.emptyActionBtnText}>Scan Bottle Delivery</Text>
                </NativePressable>
              </View>
            ) : (
              <>
                {displayedScans.map((scan) => (
                  <DistributorScanCardItem
                    key={scan.id}
                    scan={scan}
                    onSelect={setSelectedRecord}
                  />
                ))}

                {/* ── Pagination / Lazy Loading Footer ── */}
                {filteredRecords.length > PAGE_SIZE && (
                  <View style={styles.paginationContainer}>
                    {filteredRecords.length > scansLimit ? (
                      <NativePressable
                        style={styles.loadMoreBtn}
                        onPress={() => setScansLimit((prev) => Math.min(prev + PAGE_SIZE, filteredRecords.length))}
                        hapticType="selection"
                        scaleActive={0.95}
                      >
                        <Text style={styles.loadMoreBtnText}>
                          Load More (+{Math.min(PAGE_SIZE, filteredRecords.length - scansLimit)})
                        </Text>
                        <ChevronDown size={15} color="#111C24" />
                      </NativePressable>
                    ) : (
                      <View style={styles.allLoadedBadge}>
                        <Check size={13} color="#059669" />
                        <Text style={styles.allLoadedText}>Showing all {filteredRecords.length} deliveries</Text>
                      </View>
                    )}
                    <Text style={styles.paginationCountSub}>
                      {displayedScans.length} of {filteredRecords.length} deliveries loaded
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* ── TAB 2: SETTLEMENT REPORT (Persistent layout container for 0ms instant tab switching) ── */}
        <View style={{ display: activeTab === 'settlement-report' ? 'flex' : 'none' }}>
          <View style={styles.settlementSection}>
            <View style={styles.settlementTitleRow}>
              <Text style={styles.settlementHeaderTitle}>Settlement Report Overview</Text>
              <NativePressable
                style={styles.exportPdfBtn}
                onPress={() => triggerToast('✓ Exporting official PDF settlement statement...')}
                hapticType="impactLight"
                scaleActive={0.96}
              >
                <Download color="#FFFFFF" size={12} />
                <Text style={styles.exportPdfBtnText}>Export PDF</Text>
              </NativePressable>
            </View>
            <Text style={styles.settlementSubheader}>PRODUCTION & PAYOUT RECORDS</Text>

            {/* Date Divider */}
            <View style={styles.dateDividerRow}>
              <View style={styles.dateDividerLine} />
              <Text style={styles.dateDividerText}>{todayLabel} • {ledgerRecords.length} entries</Text>
              <View style={styles.dateDividerLine} />
            </View>

            {/* Settlement Cards */}
            <View style={styles.settlementList}>
              {loading && ledgerRecords.length === 0 ? (
                <>
                  <SettlementCardSkeleton />
                  <SettlementCardSkeleton />
                  <SettlementCardSkeleton />
                </>
              ) : ledgerRecords.length === 0 ? (
                <View style={styles.emptyState}>
                  <TrendingUp color="#94A3B8" size={32} />
                  <Text style={styles.emptyTitle}>No settlements recorded</Text>
                  <Text style={styles.emptySubtitle}>Dispatched delivery batches will generate financial settlements here.</Text>
                </View>
              ) : (
                <>
                  {displayedSettlements.map((record) => (
                    <DistributorSettlementCardItem key={record.id} record={record} />
                  ))}

                  {/* ── Pagination / Lazy Loading Footer ── */}
                  {ledgerRecords.length > PAGE_SIZE && (
                    <View style={styles.paginationContainer}>
                      {ledgerRecords.length > settlementsLimit ? (
                        <NativePressable
                          style={styles.loadMoreBtn}
                          onPress={() => setSettlementsLimit((prev) => Math.min(prev + PAGE_SIZE, ledgerRecords.length))}
                          hapticType="selection"
                          scaleActive={0.95}
                        >
                          <Text style={styles.loadMoreBtnText}>
                            Load More (+{Math.min(PAGE_SIZE, ledgerRecords.length - settlementsLimit)})
                          </Text>
                          <ChevronDown size={15} color="#111C24" />
                        </NativePressable>
                      ) : (
                        <View style={styles.allLoadedBadge}>
                          <Check size={13} color="#059669" />
                          <Text style={styles.allLoadedText}>Showing all {ledgerRecords.length} records</Text>
                        </View>
                      )}
                      <Text style={styles.paginationCountSub}>
                        {displayedSettlements.length} of {ledgerRecords.length} records loaded
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── 4. FIXED LIQUID GLASS BOTTOM NAVIGATION BAR ── */}
      <LiquidGlassNavBar
        leftTab={{
          key: 'scan-reports',
          label: 'Scan Report',
          icon: FileText,
        }}
        rightTab={{
          key: 'settlement-report',
          label: 'Settlement',
          icon: TrendingUp,
        }}
        activeTab={activeTab}
        onSelectTab={handleTabSelect}
        onPressCenterScan={() => setShowQrModal(true)}
      />

      {/* ── MODAL 1: LAZY DASHBOARD QR SCANNER WITH LIVE PRODUCTION SYNC ── */}
      <DashboardQRScannerModal
        visible={showQrModal}
        onClose={() => setShowQrModal(false)}
        onComplete={handleCompleteScanSession}
        onScan={handleRealQrScanned}
        onSimulateBulk={handleSimulateBulkDistributor}
        onPerformLiveScan={handlePerformLiveScan}
        title="Burst Scanner"
        activeCampaignTitle="Live Delivery Batch"
        isPlant={false}
      />

      {/* ── Scan Result Output Popup Modal ── */}
      <ScanResultModal
        visible={!!scanResultData}
        data={scanResultData}
        onScanNext={() => setScanResultData(null)}
        onClose={() => {
          setScanResultData(null);
          setShowQrModal(false);
        }}
      />

      {/* ── MODAL 2: EDIT DISTRIBUTOR PROFILE (Optimized Non-Scrollable Apple Layout) ── */}
      <Modal
        visible={showProfileModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.centerModalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowProfileModal(false)}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          <View style={styles.profileModalCard}>
            {/* Header */}
            <View style={styles.profileModalHeader}>
              <View style={styles.profileModalHeaderLeft}>
                <View style={styles.modalIconSquircle}>
                  <Truck color="#0284C7" size={19} strokeWidth={2.2} />
                </View>
                <View style={styles.modalHeaderTitleCol}>
                  <Text style={styles.profileModalTitle}>Edit Distributor Profile</Text>
                  <Text style={styles.profileModalSubtitle}>Fleet operations & business specs</Text>
                </View>
              </View>
              <NativePressable
                onPress={() => setShowProfileModal(false)}
                style={styles.modalCloseCircle}
                hapticType="selection"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X color="#64748B" size={16} strokeWidth={2.4} />
              </NativePressable>
            </View>

            {/* Non-Scrollable Optimized Grid Form */}
            <View style={styles.profileFormContainer}>
              {/* Row 1 (Full Width): Organization Name */}
              <View style={styles.formFieldGroup}>
                <Text style={styles.inputLabel}>ORGANIZATION / HUB NAME</Text>
                <View style={styles.inputFieldContainer}>
                  <Building2 size={14} color="#0284C7" strokeWidth={2} />
                  <TextInput
                    style={styles.modalTextInput}
                    value={profileOrgName}
                    onChangeText={setProfileOrgName}
                    placeholder="Enter hub name"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              {/* Row 2 (2 Columns): Email & Phone */}
              <View style={styles.formRow2Col}>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                  <View style={styles.inputFieldContainer}>
                    <Mail size={14} color="#0284C7" strokeWidth={2} />
                    <TextInput
                      style={styles.modalTextInput}
                      value={profileEmail}
                      onChangeText={setProfileEmail}
                      placeholder="Email"
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>PHONE NUMBER</Text>
                  <View style={styles.inputFieldContainer}>
                    <Phone size={14} color="#0284C7" strokeWidth={2} />
                    <TextInput
                      style={styles.modalTextInput}
                      value={profilePhone}
                      onChangeText={setProfilePhone}
                      placeholder="Phone"
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>

              {/* Row 3 (2 Columns): GSTIN & License ID */}
              <View style={styles.formRow2Col}>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>GSTIN NUMBER</Text>
                  <View style={styles.inputFieldContainer}>
                    <FileCheck size={14} color="#0284C7" strokeWidth={2} />
                    <TextInput
                      style={[styles.modalTextInput, styles.monoInputText]}
                      value={profileGstin}
                      onChangeText={setProfileGstin}
                      placeholder="GSTIN"
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="characters"
                    />
                  </View>
                </View>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>PARTNER LICENSE ID</Text>
                  <View style={styles.inputFieldContainer}>
                    <ShieldCheck size={14} color="#0284C7" strokeWidth={2} />
                    <TextInput
                      style={[styles.modalTextInput, styles.monoInputText]}
                      value={profileLicenseId}
                      onChangeText={setProfileLicenseId}
                      placeholder="License ID"
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="characters"
                    />
                  </View>
                </View>
              </View>

              {/* Row 4 (2 Columns): Bank Name & Daily Capacity */}
              <View style={styles.formRow2Col}>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>SETTLEMENT BANK</Text>
                  <View style={styles.inputFieldContainer}>
                    <CreditCard size={14} color="#0284C7" strokeWidth={2} />
                    <TextInput
                      style={styles.modalTextInput}
                      value={profileBankName}
                      onChangeText={setProfileBankName}
                      placeholder="Bank name"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>DAILY CAPACITY</Text>
                  <View style={styles.inputFieldContainer}>
                    <Gauge size={14} color="#0284C7" strokeWidth={2} />
                    <TextInput
                      style={styles.modalTextInput}
                      value={profileDeliveryCapacity}
                      onChangeText={setProfileDeliveryCapacity}
                      placeholder="10,000 cans/day"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>
              </View>

              {/* Row 5 (2 Columns): Account No & IFSC */}
              <View style={styles.formRow2Col}>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>ACCOUNT NUMBER</Text>
                  <View style={styles.inputFieldContainer}>
                    <CreditCard size={14} color="#0284C7" strokeWidth={2} />
                    <TextInput
                      style={[styles.modalTextInput, styles.monoInputText]}
                      value={profileAccountNo}
                      onChangeText={setProfileAccountNo}
                      placeholder="Account No"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>IFSC CODE</Text>
                  <View style={styles.inputFieldContainer}>
                    <Building2 size={14} color="#0284C7" strokeWidth={2} />
                    <TextInput
                      style={[styles.modalTextInput, styles.monoInputText]}
                      value={profileIfsc}
                      onChangeText={setProfileIfsc}
                      placeholder="IFSC"
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="characters"
                    />
                  </View>
                </View>
              </View>

              {/* Primary Action CTA */}
              <NativePressable
                style={styles.saveProfileBtn}
                onPress={handleSaveProfile}
                hapticType="impactMedium"
                scaleActive={0.97}
              >
                <ShieldCheck color="#FFFFFF" size={17} strokeWidth={2.2} />
                <Text style={styles.saveProfileBtnText}>Save Profile Details</Text>
              </NativePressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── 3. USER MENU (Anchored Directly Below Top Bar) ── */}
      {showUserMenu && (
        <View style={styles.userMenuDropdownOverlay} pointerEvents="box-none">
          <TouchableWithoutFeedback onPress={() => setShowUserMenu(false)}>
            <View style={styles.userMenuBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.userMenuCard}>
            <View style={styles.userMenuEmailBox}>
              <Text style={styles.userMenuName}>{profileOrgName}</Text>
              <Text style={styles.userMenuEmail}>{profileEmail}</Text>
            </View>

            <NativePressable
              style={styles.userMenuItem}
              onPress={() => {
                setShowUserMenu(false);
                setShowProfileModal(true);
              }}
              hapticType="selection"
              scaleActive={0.98}
            >
              <User color="#0284C7" size={17} />
              <Text style={styles.userMenuItemText}>Edit Profile</Text>
            </NativePressable>

            <NativePressable
              style={styles.userMenuItem}
              onPress={() => {
                setShowUserMenu(false);
                setShowChangePasswordModal(true);
              }}
              hapticType="selection"
              scaleActive={0.98}
            >
              <KeyRound color="#0284C7" size={17} />
              <Text style={styles.userMenuItemText}>Change Password</Text>
            </NativePressable>

            <View style={styles.menuDivider} />

            <NativePressable
              style={styles.userMenuItem}
              onPress={() => {
                setShowUserMenu(false);
                signOut();
              }}
              hapticType="impactMedium"
              scaleActive={0.98}
            >
              <LogOut color="#EF4444" size={17} />
              <Text style={[styles.userMenuItemText, { color: '#EF4444' }]}>Log Out</Text>
            </NativePressable>
          </View>
        </View>
      )}

      {/* ── MODAL 4: CHANGE PASSWORD (Apple Themed Redesign) ── */}
      <Modal
        visible={showChangePasswordModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowChangePasswordModal(false)}
      >
        <View style={styles.centerModalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowChangePasswordModal(false)}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          <View style={styles.profileModalCard}>
            <View style={styles.profileModalHeader}>
              <View style={styles.profileModalHeaderLeft}>
                <View style={styles.modalIconSquircle}>
                  <KeyRound color="#0284C7" size={20} strokeWidth={2.2} />
                </View>
                <View style={styles.modalHeaderTitleCol}>
                  <Text style={styles.profileModalTitle}>Change Password</Text>
                  <Text style={styles.profileModalSubtitle}>Secure your distributor account</Text>
                </View>
              </View>
              <NativePressable
                onPress={() => setShowChangePasswordModal(false)}
                style={styles.modalCloseCircle}
                hapticType="selection"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X color="#64748B" size={16} strokeWidth={2.4} />
              </NativePressable>
            </View>

            {passwordError ? (
              <View style={styles.modalErrorBanner}>
                <AlertCircle size={14} color="#EF4444" />
                <Text style={styles.errorText}>{passwordError}</Text>
              </View>
            ) : null}

            <View style={styles.formFieldGroup}>
              <Text style={styles.inputLabel}>CURRENT PASSWORD</Text>
              <View style={styles.inputFieldContainer}>
                <Lock size={16} color="#0284C7" strokeWidth={2} />
                <TextInput
                  style={styles.modalTextInput}
                  secureTextEntry
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder="Enter current password"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <View style={styles.formFieldGroup}>
              <Text style={styles.inputLabel}>NEW PASSWORD</Text>
              <View style={styles.inputFieldContainer}>
                <KeyRound size={16} color="#0284C7" strokeWidth={2} />
                <TextInput
                  style={styles.modalTextInput}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <NativePressable
              style={styles.saveProfileBtn}
              onPress={handleChangePassword}
              hapticType="impactMedium"
              scaleActive={0.97}
            >
              <KeyRound color="#FFFFFF" size={18} strokeWidth={2.2} />
              <Text style={styles.saveProfileBtnText}>Update Password</Text>
            </NativePressable>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 5: SCAN DELIVERY DETAILS (Apple Popped Bottom Sheet) ── */}
      {currentRecord && (
        <PoppedBottomSheetModal
          visible={Boolean(selectedRecord)}
          onClose={() => setSelectedRecord(null)}
        >
          {({ close }) => (
            <View style={styles.bottomSheetCard}>
              {/* Specular Shine Overlay */}
              <View style={styles.sheetCardSpecularShine} pointerEvents="none" />

              {/* Drag Indicator Handle Touch Area */}
              <View style={styles.sheetHandleTouchArea}>
                <View style={styles.sheetHandleIndicator} />
              </View>

              {/* Header: Squircle Icon + Title/Sub */}
              <View style={styles.sheetHeaderRow}>
                <View style={styles.sheetHeaderLeft}>
                  <View style={styles.sheetHeaderIconSquircle}>
                    <BottleBadgeIcon size={22} color="#111C24" />
                  </View>
                  <View style={styles.sheetHeaderTitleWrap}>
                    <Text style={styles.sheetHeaderTitle} numberOfLines={1}>
                      {currentRecord.can_id}
                    </Text>
                    <View style={styles.sheetHeaderSubRow}>
                      <Text style={styles.sheetHeaderBrandText} numberOfLines={1}>
                        {currentRecord.campaign_title}
                      </Text>
                      <View style={styles.appleVerifiedPill}>
                        <View style={styles.verifiedDot} />
                        <Text style={styles.appleVerifiedText}>Verified</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* ── Delivery Time Banner ── */}
              <View style={styles.sheetDeliveryBanner}>
                <View style={styles.sheetDeliveryIconCircle}>
                  <Check size={16} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetDeliveryBannerTitle}>Delivery Logged to Production</Text>
                  <Text style={styles.sheetDeliveryBannerSub}>Recorded {currentRecord.deliveryTime}</Text>
                </View>
              </View>

              {/* ── Apple Inset Grouped Specs List ── */}
              <View style={styles.sheetSpecsGroupCard}>
                {/* Row 1: Target Route */}
                <View style={styles.sheetSpecRow}>
                  <View style={[styles.sheetSpecIconWrap, { backgroundColor: '#EFF6FF' }]}>
                    <MapPinIcon size={16} color="#2563EB" />
                  </View>
                  <Text style={styles.sheetSpecLabel}>Delivery Route</Text>
                  <Text style={styles.sheetSpecValue} numberOfLines={2}>
                    {currentRecord.location_name}
                  </Text>
                </View>

                <View style={styles.sheetSpecDivider} />

                {/* Row 2: Campaign */}
                <View style={styles.sheetSpecRow}>
                  <View style={[styles.sheetSpecIconWrap, { backgroundColor: '#ECFEFF' }]}>
                    <DocSheetIcon size={16} color="#0891B2" />
                  </View>
                  <Text style={styles.sheetSpecLabel}>Campaign Batch</Text>
                  <Text style={styles.sheetSpecValue} numberOfLines={1}>
                    {currentRecord.campaign_title}
                  </Text>
                </View>

                <View style={styles.sheetSpecDivider} />

                {/* Row 3: Bottle Identifier */}
                <View style={styles.sheetSpecRow}>
                  <View style={[styles.sheetSpecIconWrap, { backgroundColor: '#F0FDF4' }]}>
                    <QrCode size={16} color="#16A34A" />
                  </View>
                  <Text style={styles.sheetSpecLabel}>Can Serial ID</Text>
                  <Text style={[styles.sheetSpecValue, { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>
                    {currentRecord.can_id}
                  </Text>
                </View>

                <View style={styles.sheetSpecDivider} />

                {/* Row 4: Distributor Commission */}
                <View style={styles.sheetSpecRow}>
                  <View style={[styles.sheetSpecIconWrap, { backgroundColor: '#F5F3FF' }]}>
                    <RupeeBadgeIcon size={16} color="#7C3AED" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetSpecLabel}>Earned Commission</Text>
                    <Text style={styles.sheetSpecSubLabel}>@ ₹0.50 / verified can</Text>
                  </View>
                  <Text style={styles.sheetSpecCommissionValue}>+₹0.50</Text>
                </View>
              </View>

              {/* ── Full Width Apple Done Button ── */}
              <NativePressable
                style={styles.sheetDoneBtn}
                onPress={close}
                hapticType="impactLight"
                scaleActive={0.97}
              >
                <Text style={styles.sheetDoneBtnText}>Close Details</Text>
              </NativePressable>
            </View>
          )}
        </PoppedBottomSheetModal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    zIndex: 9999,
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },

  // ── Floating Apple Pill Top Bar ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: Platform.OS === 'ios' ? 4 : 8,
    marginBottom: 4,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  headerLeftCol: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  headerCategoryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
    textTransform: 'uppercase',
  },
  avatarRingWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.2,
    borderColor: '#E6D7C3',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111C24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#D6B477',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  mainScroll: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 220 : 190,
  },
  titleRow: {
    marginBottom: 10,
  },
  pageTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#111827',
  },

  // ── Unified Apple Liquid Glass Master Metrics Card ──
  unifiedGlassMasterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    marginTop: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    gap: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  glassCardSpecularShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  metricsGridRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  glassMetricTile: {
    flex: 1,
    height: 108,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'space-between',
  },
  tileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 32,
  },
  tileIconSquircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIconBlue: {
    backgroundColor: '#EFF6FF',
  },
  tileIconCyan: {
    backgroundColor: '#ECFEFF',
  },
  tileIconGreen: {
    backgroundColor: '#F0FDF4',
  },
  tileIconPurple: {
    backgroundColor: '#F5F3FF',
  },
  tileUnitPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileUnitText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  tileCounterWrap: {
    height: 26,
    justifyContent: 'center',
  },
  tileCounter: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  tileLabelWrap: {
    height: 28,
    justifyContent: 'flex-start',
  },
  tileLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    lineHeight: 14.5,
    letterSpacing: -0.1,
  },

  // ── Search Bar (Pill Rounded) ──
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 15,
    marginBottom: 12,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    paddingVertical: 0,
    fontWeight: '500',
  },
  clearSearchBtn: {
    padding: 3,
  },

  // ── Filter Segment Pills (All | Pending | Completed) ──
  filterPills: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 3.5,
    marginBottom: 14,
    height: 42,
    alignItems: 'center',
  },
  filterPill: {
    flex: 1,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  filterPillActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },

  // Scans List (Apple Minimalist)
  scansList: {
    gap: 8,
  },
  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 22,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 14,
  },
  scanCardSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 22,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 14,
  },
  scanCardLeft: {
    flex: 1,
    marginRight: 8,
  },
  scanCardTextWrap: {
    gap: 2,
  },
  scanCanId: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  scanCampaignSub: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748B',
  },
  scanCardRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  appleVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  verifiedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  appleVerifiedText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },
  scanTime: {
    fontSize: 11.5,
    color: '#8E8E93',
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    padding: 28,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 3,
  },
  emptySubtitle: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 14,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111C24',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: 'bold',
  },

  // Settlement Section
  settlementSection: {
    paddingTop: 4,
  },
  settlementTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  settlementHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  exportPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#111C24',
    paddingHorizontal: 12,
    paddingVertical: 6.5,
    borderRadius: 14,
  },
  exportPdfBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  settlementSubheader: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  dateDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dateDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dateDividerText: {
    fontSize: 11.5,
    color: '#6B7280',
    fontWeight: '600',
    paddingHorizontal: 10,
  },
  settlementList: {
    gap: 8,
  },
  settlementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  settlementCardSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  settlementCardMiddle: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  settlementCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  settlementCardSub: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748B',
  },
  settlementCardRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 3,
  },
  settlementCardAmount: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: -0.2,
  },
  appleSettleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4.5,
  },
  appleSettleBadgeSettled: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  appleSettleBadgePending: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  settleDot: {
    width: 5.5,
    height: 5.5,
    borderRadius: 2.75,
  },
  settleDotSettled: {
    backgroundColor: '#10B981',
  },
  settleDotPending: {
    backgroundColor: '#F59E0B',
  },
  appleSettleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  appleSettleBadgeTextSettled: {
    color: '#059669',
  },
  appleSettleBadgeTextPending: {
    color: '#D97706',
  },
  settleBadgeTextGreen: {
    color: '#047857',
  },

  // Bottom Nav Bar
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 66,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  navTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 3,
  },
  navTabTextActiveIndigo: {
    color: '#111C24',
    fontWeight: '800',
  },
  floatingCenterWrap: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingQrBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111C24',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#111C24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },

  // ── Floating Transparent Scanner Layout (Matching User Reference) ──
  scannerModalOverlay: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  floatingHeaderSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  floatingHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 36 : 10,
    paddingBottom: 10,
  },
  floatingHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 6,
    letterSpacing: -0.3,
  },
  floatingHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  floatingCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerBody: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  viewfinderFrame: {
    width: width * 0.74,
    height: width * 0.74,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerBracket: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderColor: '#D6B477',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderTopLeftRadius: 20,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderTopRightRadius: 20,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderBottomLeftRadius: 20,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderBottomRightRadius: 20,
  },
  laserLine: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 2.5,
    backgroundColor: '#D6B477',
    shadowColor: '#D6B477',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  standbyContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cameraIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(15, 35, 29, 0.8)',
    borderWidth: 1,
    borderColor: '#056B4A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  standbyTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  standbySub: {
    color: '#CBD5E1',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  retryCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111C24',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryCameraBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  floatingBottomSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  floatingBottomContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    gap: 12,
  },
  floatingInstructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  floatingInstructionText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 6,
  },
  floatingScannedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  floatingPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#D6B477',
    shadowColor: '#D6B477',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  floatingScannedText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 6,
  },
  floatingScannedBold: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // ── Apple Themed Profile & Action Modals ──
  centerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.60)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  profileModalCard: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 18,
  },
  profileModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  profileModalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalIconSquircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderTitleCol: {
    flex: 1,
  },
  profileModalTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  profileModalSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  modalCloseCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  profileFormContainer: {
    width: '100%',
  },
  formRow2Col: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  formCol: {
    flex: 1,
  },
  formFieldGroup: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  inputFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 11,
    paddingHorizontal: 10,
    height: 38,
  },
  modalTextInput: {
    flex: 1,
    height: '100%',
    paddingLeft: 6,
    paddingVertical: 0,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  monoInputText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.3,
  },
  saveProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#0284C7',
    height: 44,
    borderRadius: 13,
    marginTop: 6,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveProfileBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  modalErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 14,
  },

  // User Menu Dropdown (Anchored Directly Below Top Bar)
  userMenuDropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  userMenuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  userMenuCard: {
    position: 'absolute',
    top: 80,
    right: 16,
    width: 255,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  userMenuEmailBox: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    marginBottom: 6,
  },
  userMenuName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.1,
  },
  userMenuEmail: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  userMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    minHeight: 44,
  },
  userMenuItemText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#334155',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginBottom: 8,
  },
  activeOverlayControls: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    zIndex: 10,
  },

  // ── Pagination & Lazy Loading ──
  paginationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E6D7C3',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#111C24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  loadMoreBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#111C24',
  },
  allLoadedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  allLoadedText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  paginationCountSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },

  // ── Apple Popped-Out Sheet (No Dark Background) ──
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  bottomSheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.12)',
  },
  bottomSheetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 25,
    overflow: 'hidden',
  },
  sheetCardSpecularShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  sheetHandleTouchArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    paddingBottom: 16,
  },
  sheetHandleIndicator: {
    width: 48,
    height: 5.5,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetHeaderIconSquircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHeaderTitleWrap: {
    flex: 1,
    marginLeft: 12,
  },
  sheetHeaderTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  sheetHeaderSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 8,
  },
  sheetHeaderBrandText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
    flexShrink: 1,
  },

  // Delivery Banner in Sheet
  sheetDeliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  sheetDeliveryIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetDeliveryBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  sheetDeliveryBannerSub: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#16A34A',
    marginTop: 1,
  },

  // Apple Inset Grouped Specs List
  sheetSpecsGroupCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  sheetSpecRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    justifyContent: 'space-between',
  },
  sheetSpecIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sheetSpecLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  sheetSpecSubLabel: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 1,
  },
  sheetSpecValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
    maxWidth: '50%',
  },
  sheetSpecCommissionValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
    textAlign: 'right',
  },
  sheetSpecDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 56,
  },

  // Done Button
  sheetDoneBtn: {
    backgroundColor: '#111C24',
    borderRadius: 20,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#111C24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  sheetDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
