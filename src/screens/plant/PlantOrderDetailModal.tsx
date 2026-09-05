import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import {
  X,
  Package,
  Layers,
  FileCheck,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  QrCode,
  Droplets,
} from 'lucide-react-native';
import { PlantBottlingOrder } from '../../types';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { StatusBadge } from '../../components/StatusBadge';
import { NativePressable } from '../../components/common/NativePressable';
import { AppleButton } from '../../components/common/AppleButton';

interface PlantOrderDetailModalProps {
  visible: boolean;
  order: PlantBottlingOrder | null;
  onClose: () => void;
  onOpenScanner?: () => void;
}

const formatCampaignTitle = (title: string) => {
  if (!title) return 'Commercial Bottling Order';
  const clean = String(title).trim();
  if (clean.startsWith('REGRESSION_CAMP_')) {
    const parts = clean.split('_');
    const num = parts[2] || '1';
    return `Regression Campaign #${num}`;
  }
  if (clean.startsWith('CMP_')) {
    return clean.replace(/^CMP_/, '').replace(/_/g, ' ');
  }
  return clean;
};

export const PlantOrderDetailModal: React.FC<PlantOrderDetailModalProps> = ({
  visible,
  order,
  onClose,
  onOpenScanner,
}) => {
  if (!visible || !order) return null;

  const progressPercent = Math.min(
    100,
    Math.round((order.bottledNum / Math.max(1, order.quantityNum)) * 100)
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Package size={20} color={COLORS.plantAccent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {formatCampaignTitle(order.campaign)}
                </Text>
                <Text style={styles.headerSubtitle}>{order.brand} &bull; {order.id}</Text>
              </View>
            </View>
            <NativePressable
              onPress={onClose}
              style={styles.closeBtn}
              haptic="selection"
              hitSlop={8}
            >
              <X size={20} color={COLORS.slate400} />
            </NativePressable>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Progress Section */}
            <View style={styles.sectionCard}>
              <View style={styles.progressHeaderRow}>
                <Text style={styles.sectionLabel}>BOTTLING & SCAN PROGRESS</Text>
                <StatusBadge status={order.status} />
              </View>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>

              <View style={styles.progressStatsRow}>
                <Text style={styles.progressText}>
                  {order.bottledNum.toLocaleString()} / {order.quantityNum.toLocaleString()} Bottled
                </Text>
                <Text style={styles.percentText}>{progressPercent}%</Text>
              </View>
            </View>

            {/* Design & Sleeve Specifications */}
            <View style={styles.sectionCard}>
              <View style={styles.specHeaderRow}>
                <Layers size={16} color={COLORS.plantAccent} />
                <Text style={styles.sectionLabel}>APPROVED SLEEVE ARTWORK SPECS</Text>
              </View>

              <View style={styles.specsGrid}>
                <View style={styles.specItem}>
                  <Text style={styles.specItemLabel}>Dimensions</Text>
                  <Text style={styles.specItemValue}>{order.designSpecs.dimensions}</Text>
                </View>

                <View style={styles.specItem}>
                  <Text style={styles.specItemLabel}>Color Profile</Text>
                  <Text style={styles.specItemValue}>{order.designSpecs.colorProfile}</Text>
                </View>

                <View style={styles.specItem}>
                  <Text style={styles.specItemLabel}>Winding Direction</Text>
                  <Text style={styles.specItemValue}>{order.designSpecs.windingDirection}</Text>
                </View>

                <View style={styles.specItem}>
                  <Text style={styles.specItemLabel}>Bleed Margin</Text>
                  <Text style={styles.specItemValue}>{order.designSpecs.bleedMargin}</Text>
                </View>

                <View style={styles.specItem}>
                  <Text style={styles.specItemLabel}>Embedded QR Type</Text>
                  <Text style={styles.specItemValue}>{order.designSpecs.embeddedQr}</Text>
                </View>

                <View style={styles.specItem}>
                  <Text style={styles.specItemLabel}>Artwork File</Text>
                  <Text style={styles.specItemValue} numberOfLines={1}>
                    {order.designSpecs.fileName}
                  </Text>
                </View>
              </View>
            </View>

            {/* Commercial Terms */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>COMMERCIAL TERMS & TIMELINE</Text>
              <View style={styles.termsRow}>
                <View style={styles.termBox}>
                  <Text style={styles.termLabel}>Plant Commission Rate</Text>
                  <Text style={styles.termValue}>₹0.50 / bottle</Text>
                </View>
                <View style={styles.termBox}>
                  <Text style={styles.termLabel}>Est. Total Payout</Text>
                  <Text style={[styles.termValue, { color: COLORS.plantAccent }]}>
                    ₹{((order.quantityNum || 0) * 0.5).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>
              <View style={styles.timelineRow}>
                <Text style={styles.timelineText}>
                  📅 Production Window: {order.startDate} — {order.endDate}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Bottom Bar */}
          <View style={styles.modalFooter}>
            {onOpenScanner && order.status !== 'COMPLETED' && (
              <AppleButton
                title="Open QR Scanner for this Batch"
                variant="plant"
                size="md"
                onPress={() => {
                  onClose();
                  onOpenScanner();
                }}
                icon={<QrCode size={16} color={COLORS.white} />}
              />
            )}
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
    maxHeight: '90%',
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
    backgroundColor: COLORS.plantBg,
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
    color: COLORS.slate500,
    letterSpacing: 0.5,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.slate200,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginVertical: SPACING.xs,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.plantAccent,
    borderRadius: RADIUS.full,
  },
  progressStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  progressText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '700',
    color: COLORS.slate700,
  },
  percentText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.plantAccent,
  },
  specHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  specItem: {
    width: '48%',
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  specItemLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.slate400,
    textTransform: 'uppercase',
  },
  specItemValue: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.slate800,
    marginTop: 2,
  },
  termsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  termBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  termLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.slate500,
  },
  termValue: {
    ...TYPOGRAPHY.sm,
    fontWeight: '900',
    color: COLORS.slate900,
    marginTop: 2,
  },
  timelineRow: {
    marginTop: SPACING.sm,
  },
  timelineText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.slate600,
  },
  modalFooter: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  scanBtn: {
    backgroundColor: COLORS.plantAccent,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  scanBtnText: {
    ...TYPOGRAPHY.sm,
    fontWeight: '800',
    color: COLORS.white,
  },
});

export default PlantOrderDetailModal;
