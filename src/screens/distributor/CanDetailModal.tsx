import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  X,
  QrCode,
  MapPin,
  Clock,
  Building2,
  Factory,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Navigation,
} from 'lucide-react-native';
import { DistributorScanRecord } from '../../types';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { formatTimeOnly } from '../../utils/formatters';

interface CanDetailModalProps {
  visible: boolean;
  scan: DistributorScanRecord | null;
  onClose: () => void;
}

export const CanDetailModal: React.FC<CanDetailModalProps> = ({
  visible,
  scan,
  onClose,
}) => {
  if (!visible || !scan) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <QrCode size={20} color={COLORS.distributorAccent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  CanQR Scan Record
                </Text>
                <Text style={styles.headerSubtitle}>
                  Verified Retail Delivery #{scan.can_id || scan.qr_id}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.slate400} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Status Pill */}
            <View style={styles.verifiedRow}>
              <CheckCircle2 size={16} color={COLORS.success} />
              <Text style={styles.verifiedText}>
                Cryptographically Logged & Dispatched
              </Text>
            </View>

            {/* Campaign & Brand */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>CAMPAIGN & ADVERTISER</Text>
              <Text style={styles.campaignTitle}>{scan.campaignTitle}</Text>
              <Text style={styles.brandTitle}>{scan.brandName}</Text>
            </View>

            {/* Delivery Metadata */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>RETAIL DELIVERY LOCATION</Text>
              <View style={styles.metaRow}>
                <MapPin size={14} color={COLORS.slate500} />
                <Text style={styles.metaText}>{scan.locationTitle || scan.locality}</Text>
              </View>
              <View style={styles.metaRow}>
                <Navigation size={14} color={COLORS.slate500} />
                <Text style={[styles.metaText, { fontFamily: 'monospace' }]}>
                  {scan.gpsCoords || '13.0827° N, 80.2707° E'}
                </Text>
              </View>
            </View>

            {/* Origin Plant & Timestamp */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>ORIGIN & COMMISSION</Text>
              <View style={styles.gridRow}>
                <View style={styles.gridCol}>
                  <Text style={styles.gridLabel}>Bottling Plant</Text>
                  <Text style={styles.gridValue}>Aquafina Plant #4</Text>
                </View>
                <View style={styles.gridCol}>
                  <Text style={styles.gridLabel}>Scan Time</Text>
                  <Text style={styles.gridValue}>{formatTimeOnly(scan.deliveryTime || scan.scannedAt)}</Text>
                </View>
              </View>
              <View style={styles.gridRow}>
                <View style={styles.gridCol}>
                  <Text style={styles.gridLabel}>Commission Earned</Text>
                  <Text style={[styles.gridValue, { color: COLORS.successText }]}>
                    +₹1.50 / Can
                  </Text>
                </View>
                <View style={styles.gridCol}>
                  <Text style={styles.gridLabel}>Delivery Date</Text>
                  <Text style={styles.gridValue}>{scan.deliveryDate || 'Today'}</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.dismissBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.dismissBtnText}>Close Record</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    maxHeight: '80%',
    paddingBottom: SPACING.xl,
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.distributorBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.base,
    fontWeight: '900',
    color: COLORS.slate900,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.xs,
    color: COLORS.slate500,
    marginTop: 1,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  scrollBody: {
    padding: SPACING.lg,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successBg,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
    marginBottom: SPACING.md,
  },
  verifiedText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.successText,
  },
  sectionCard: {
    backgroundColor: COLORS.slate50,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.slate400,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  campaignTitle: {
    ...TYPOGRAPHY.base,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  brandTitle: {
    ...TYPOGRAPHY.xs,
    color: COLORS.slate600,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '700',
    color: COLORS.slate800,
  },
  gridRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  gridCol: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.slate400,
  },
  gridValue: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.slate800,
    marginTop: 2,
  },
  modalFooter: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
  },
  dismissBtn: {
    backgroundColor: COLORS.slate900,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissBtnText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.white,
  },
});

export default CanDetailModal;
