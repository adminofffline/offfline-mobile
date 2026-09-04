import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {
  Droplets,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  X,
  Layers,
} from 'lucide-react-native';
import { plantApi } from '../../api/plant';
import { PlantDailyOutputEntry } from '../../types';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { UserMenuModal } from '../../components/UserMenuModal';
import { PlantProfileModal } from './PlantProfileModal';

const initialLogs: PlantDailyOutputEntry[] = [
  {
    id: 'log_1',
    date: new Date().toISOString().split('T')[0],
    cans_filled: 24500,
    stickers_applied: 24500,
    batch_notes: 'Shift A & B production complete (Ad Campaign)',
    status: 'VERIFIED',
  },
  {
    id: 'log_2',
    date: '2026-07-24',
    cans_filled: 22000,
    stickers_applied: 22000,
    batch_notes: 'Automatic labeling line running at rate',
    status: 'VERIFIED',
  },
];

export const PlantOutputScreen: React.FC = () => {
  const [entries, setEntries] = useState<PlantDailyOutputEntry[]>(initialLogs);
  const [loading, setLoading] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);

  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formCansFilled, setFormCansFilled] = useState('');
  const [formStickersApplied, setFormStickersApplied] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await plantApi.getOutput().catch(() => null);
      const list = res?.data?.entries || res?.data;
      if (Array.isArray(list) && list.length > 0) {
        setEntries(list);
      }
    } catch (e) {
      console.warn('Failed to load daily output logs:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddEntry = async () => {
    if (!formCansFilled || !formStickersApplied) return;

    setIsSaving(true);
    try {
      const newLog: PlantDailyOutputEntry = {
        id: `log_${Date.now()}`,
        date: formDate,
        cans_filled: parseInt(formCansFilled, 10),
        stickers_applied: parseInt(formStickersApplied, 10),
        batch_notes: formNotes || null,
        status: 'VERIFIED',
      };

      await plantApi.saveOutput({
        date: formDate,
        cans_filled: parseInt(formCansFilled, 10),
        stickers_applied: parseInt(formStickersApplied, 10),
        batch_notes: formNotes || null,
      }).catch(() => {});

      setEntries((prev) => [newLog, ...prev]);
      setFormCansFilled('');
      setFormStickersApplied('');
      setFormNotes('');
      setShowLogModal(false);
    } catch (e) {
      console.warn('Failed to save log entry:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const totalCans = entries.reduce((s, e) => s + (e.cans_filled || 0), 0);
  const totalStickers = entries.reduce((s, e) => s + (e.stickers_applied || 0), 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Bottling Output Log"
        subtitle="Daily verified can filling & sleeve application"
        onOpenUserMenu={() => setShowUserMenu(true)}
      />

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            {/* Metric Summary Cards */}
            <View style={styles.metricsGrid}>
              <View style={[styles.metricCard, { borderLeftColor: COLORS.plantAccent }]}>
                <Text style={styles.metricLabel}>TOTAL CANS FILLED</Text>
                <Text style={[styles.metricValue, { color: COLORS.plantAccent }]}>
                  {totalCans.toLocaleString()}
                </Text>
                <Text style={styles.metricSub}>Bottled Output</Text>
              </View>

              <View style={[styles.metricCard, { borderLeftColor: COLORS.info }]}>
                <Text style={styles.metricLabel}>SLEEVES APPLIED</Text>
                <Text style={[styles.metricValue, { color: COLORS.info }]}>
                  {totalStickers.toLocaleString()}
                </Text>
                <Text style={styles.metricSub}>Roll Labels Placed</Text>
              </View>
            </View>

            {/* Action Bar */}
            <View style={styles.actionRow}>
              <Text style={styles.sectionTitle}>Shift Output Records</Text>
              <TouchableOpacity
                style={styles.logBtn}
                onPress={() => setShowLogModal(true)}
                activeOpacity={0.8}
              >
                <Plus size={14} color={COLORS.white} />
                <Text style={styles.logBtnText}>Log Today's Output</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.logCard}>
            <View style={styles.logTopRow}>
              <View style={styles.dateRow}>
                <Calendar size={13} color={COLORS.slate400} />
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <CheckCircle2 size={11} color={COLORS.success} />
                <Text style={styles.verifiedText}>Verified Log</Text>
              </View>
            </View>

            <View style={styles.logNumbersRow}>
              <View style={styles.numBox}>
                <Text style={styles.numLabel}>Cans Filled</Text>
                <Text style={[styles.numVal, { color: COLORS.plantAccent }]}>
                  {(item.cans_filled || 0).toLocaleString()}
                </Text>
              </View>
              <View style={styles.numBox}>
                <Text style={styles.numLabel}>Sleeves Placed</Text>
                <Text style={[styles.numVal, { color: COLORS.info }]}>
                  {(item.stickers_applied || 0).toLocaleString()}
                </Text>
              </View>
            </View>

            {item.batch_notes && (
              <Text style={styles.notesText} numberOfLines={2}>
                📝 {item.batch_notes}
              </Text>
            )}
          </View>
        )}
      />

      {/* Log Output Modal */}
      <Modal visible={showLogModal} transparent animationType="slide" onRequestClose={() => setShowLogModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Droplets size={20} color={COLORS.plantAccent} />
                <Text style={styles.modalTitle}>Log Daily Bottling Output</Text>
              </View>
              <TouchableOpacity onPress={() => setShowLogModal(false)} style={styles.closeBtn}>
                <X size={18} color={COLORS.slate400} />
              </TouchableOpacity>
            </View>

            <View style={styles.formBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PRODUCTION DATE (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.textInput}
                  value={formDate}
                  onChangeText={setFormDate}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CANS FILLED (UNITS) *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 24500"
                  placeholderTextColor={COLORS.slate400}
                  keyboardType="numeric"
                  value={formCansFilled}
                  onChangeText={setFormCansFilled}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>AD SLEEVES APPLIED *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 24500"
                  placeholderTextColor={COLORS.slate400}
                  keyboardType="numeric"
                  value={formStickersApplied}
                  onChangeText={setFormStickersApplied}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PRODUCTION SHIFT NOTES</Text>
                <TextInput
                  style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
                  placeholder="Shift A & B run at rate..."
                  placeholderTextColor={COLORS.slate400}
                  value={formNotes}
                  onChangeText={setFormNotes}
                  multiline
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleAddEntry}
                disabled={isSaving || !formCansFilled || !formStickersApplied}
                activeOpacity={0.8}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.submitBtnText}>Save Shift Output Log</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <UserMenuModal
        visible={showUserMenu}
        onClose={() => setShowUserMenu(false)}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      <PlantProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    gap: SPACING.sm,
  },
  headerSection: {
    gap: SPACING.md,
    marginBottom: SPACING.xs,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    ...SHADOWS.sm,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.slate400,
    letterSpacing: 0.5,
  },
  metricValue: {
    ...TYPOGRAPHY.lg,
    fontWeight: '900',
    marginTop: 2,
  },
  metricSub: {
    fontSize: 10,
    color: COLORS.slate500,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.slate700,
    textTransform: 'uppercase',
  },
  logBtn: {
    backgroundColor: COLORS.plantAccent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs + 3,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    gap: 4,
  },
  logBtnText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.white,
  },
  logCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
    ...SHADOWS.sm,
  },
  logTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
    gap: 3,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.successText,
  },
  logNumbersRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  numBox: {
    flex: 1,
    backgroundColor: COLORS.slate50,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  numLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.slate500,
  },
  numVal: {
    ...TYPOGRAPHY.md,
    fontWeight: '900',
    marginTop: 1,
  },
  notesText: {
    fontSize: 11,
    color: COLORS.slate600,
    marginTop: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 380,
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  modalTitle: {
    ...TYPOGRAPHY.base,
    fontWeight: '900',
    color: COLORS.slate900,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  formBody: {
    gap: SPACING.md,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.slate700,
  },
  textInput: {
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...TYPOGRAPHY.xs,
    color: COLORS.slate900,
  },
  submitBtn: {
    backgroundColor: COLORS.slate900,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xs,
  },
  submitBtnText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.white,
  },
});

export default PlantOutputScreen;
