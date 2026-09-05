import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import {
  X,
  Truck,
  Building2,
  Save,
  CheckCircle2,
  MapPin,
  Landmark,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { NativePressable } from '../../components/common/NativePressable';
import { AppleButton } from '../../components/common/AppleButton';

interface DistributorProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DistributorProfileModal: React.FC<DistributorProfileModalProps> = ({
  visible,
  onClose,
}) => {
  const { user, updateProfile } = useAuth();

  const [companyName, setCompanyName] = useState(
    user?.companyName || user?.organization || user?.fullName || 'Distributor Agency'
  );
  const [ownerName, setOwnerName] = useState(user?.fullName || '');
  const [warehouseAddress, setWarehouseAddress] = useState(
    user?.distributor_profile?.warehouse_address || user?.address || 'Chennai Facility'
  );
  const [deliveryCapacity, setDeliveryCapacity] = useState(
    user?.distributor_profile?.delivery_capacity || '10,000 Cans/day'
  );
  const [bankAccount, setBankAccount] = useState(
    user?.distributor_profile?.account_no || ''
  );
  const [ifscCode, setIfscCode] = useState(
    user?.distributor_profile?.ifsc_code || ''
  );

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await updateProfile({
        companyName,
        organization: companyName,
        fullName: ownerName,
        address: warehouseAddress,
        distributor_profile: {
          delivery_capacity: deliveryCapacity,
          warehouse_address: warehouseAddress,
          account_no: bankAccount,
          ifsc_code: ifscCode,
        },
      });

      setStatusMessage('✓ Distributor profile saved to live database!');
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 1500);
    } catch (e) {
      setStatusMessage('Failed to update distributor profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Truck size={20} color={COLORS.distributorAccent} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Distributor Agency Profile</Text>
                <Text style={styles.headerSubtitle}>Warehouse logistics & payout account</Text>
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
            {statusMessage && (
              <View style={styles.statusBanner}>
                <CheckCircle2 size={16} color={COLORS.success} />
                <Text style={styles.statusBannerText}>{statusMessage}</Text>
              </View>
            )}

            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>DISTRIBUTOR AGENCY NAME</Text>
                <TextInput
                  style={styles.input}
                  value={companyName}
                  onChangeText={setCompanyName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>MANAGER / OWNER NAME</Text>
                <TextInput
                  style={styles.input}
                  value={ownerName}
                  onChangeText={setOwnerName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>WAREHOUSE / HUB ADDRESS</Text>
                <TextInput
                  style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                  value={warehouseAddress}
                  onChangeText={setWarehouseAddress}
                  multiline
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>DAILY DELIVERY CAPACITY</Text>
                <TextInput
                  style={styles.input}
                  value={deliveryCapacity}
                  onChangeText={setDeliveryCapacity}
                />
              </View>

              <View style={styles.sectionDivider}>
                <Landmark size={15} color={COLORS.distributorAccent} />
                <Text style={styles.sectionDividerTitle}>BANK SETTLEMENT DETAILS</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>SETTLEMENT BANK ACCOUNT / UPI ID</Text>
                <TextInput
                  style={[styles.input, { fontFamily: 'monospace' }]}
                  value={bankAccount}
                  onChangeText={setBankAccount}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>IFSC CODE</Text>
                <TextInput
                  style={[styles.input, { fontFamily: 'monospace' }]}
                  value={ifscCode}
                  onChangeText={setIfscCode}
                  autoCapitalize="characters"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <AppleButton
              title="Save Distributor Profile"
              variant="distributor"
              size="md"
              loading={isSaving}
              onPress={handleSave}
              icon={<Save size={16} color={COLORS.white} />}
            />
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
    maxHeight: '85%',
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
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  scrollBody: {
    padding: SPACING.lg,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successBg,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  statusBannerText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '700',
    color: COLORS.successText,
  },
  formCard: {
    gap: SPACING.md,
  },
  inputGroup: {
    gap: 4,
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
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.xs,
  },
  sectionDividerTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.slate500,
    letterSpacing: 0.5,
  },
  modalFooter: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  saveBtn: {
    backgroundColor: COLORS.slate900,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  saveBtnText: {
    ...TYPOGRAPHY.sm,
    fontWeight: '800',
    color: COLORS.white,
  },
});

export default DistributorProfileModal;
