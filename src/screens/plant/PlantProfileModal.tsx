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
  Factory,
  ShieldCheck,
  Building2,
  Save,
  Truck,
  Printer,
  CheckCircle2,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { plantApi } from '../../api/plant';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { NativePressable } from '../../components/common/NativePressable';
import { AppleButton } from '../../components/common/AppleButton';

import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

interface PlantProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PlantProfileModal: React.FC<PlantProfileModalProps> = ({ visible, onClose }) => {
  const { user, updateProfile } = useAuth();

  const [plantName, setPlantName] = useState(
    user?.plantName || user?.companyName || user?.fullName || ''
  );
  const [isiNumber, setIsiNumber] = useState(
    user?.isiNumber || user?.isi_registration_number || user?.plant_profile?.isi_licence_number || ''
  );
  const [dailyCapacity, setDailyCapacity] = useState(
    user?.dailyCapacity || (user?.plant_profile?.max_capacity ? `${user.plant_profile.max_capacity} Units/day` : '')
  );
  const [distributorCapacity, setDistributorCapacity] = useState(
    (user as any)?.distributorCapacity || ''
  );
  const [address, setAddress] = useState(user?.address || user?.plant_profile?.address || '');
  const [hasInhousePrinter, setHasInhousePrinter] = useState(Boolean(user?.plant_profile?.has_inhouse_printer));

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await updateProfile({
        plantName,
        companyName: plantName,
        isiNumber,
        isi_registration_number: isiNumber,
        dailyCapacity,
        address,
      });

      await plantApi.saveCapacity({
        min_capacity: 500,
        max_capacity: parseInt(dailyCapacity.replace(/[^0-9]/g, ''), 10) || 50000,
        has_inhouse_printer: hasInhousePrinter,
        city: 'Chennai',
      });

      try {
        ReactNativeHapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
      } catch (e) {}
      onClose();
    } catch (e) {
      setStatusMessage('Failed to update plant profile');
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
                <Factory size={20} color={COLORS.plantAccent} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Plant Facility & Licensing</Text>
                <Text style={styles.headerSubtitle}>ISI Certification and daily output specs</Text>
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
                <Text style={styles.label}>WATER PLANT FACILITY NAME</Text>
                <TextInput
                  style={styles.input}
                  value={plantName}
                  onChangeText={setPlantName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>ISI LICENSE REGISTRATION NUMBER</Text>
                <TextInput
                  style={[styles.input, { fontFamily: 'monospace' }]}
                  value={isiNumber}
                  onChangeText={setIsiNumber}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>DAILY BOTTLING OUTPUT CAPACITY</Text>
                <TextInput
                  style={styles.input}
                  value={dailyCapacity}
                  onChangeText={setDailyCapacity}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>MAX DISTRIBUTOR ALLOCATION</Text>
                <TextInput
                  style={styles.input}
                  value={distributorCapacity}
                  onChangeText={setDistributorCapacity}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>FACILITY ADDRESS</Text>
                <TextInput
                  style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                  value={address}
                  onChangeText={setAddress}
                  multiline
                />
              </View>

              <NativePressable
                style={styles.checkboxRow}
                onPress={() => setHasInhousePrinter(!hasInhousePrinter)}
                haptic="selection"
                scaleActive={0.99}
              >
                <View style={[styles.checkbox, hasInhousePrinter && styles.checkboxActive]}>
                  {hasInhousePrinter && <CheckCircle2 size={12} color={COLORS.white} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkboxLabel}>Facility Has In-House Label Printing</Text>
                  <Text style={styles.checkboxSubtext}>Check if plant applies shrink sleeves internally</Text>
                </View>
              </NativePressable>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <AppleButton
              title="Save Facility Profile"
              variant="plant"
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.slate50,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.slate400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.plantAccent,
    borderColor: COLORS.plantAccent,
  },
  checkboxLabel: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  checkboxSubtext: {
    fontSize: 10,
    color: COLORS.slate500,
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

export default PlantProfileModal;
