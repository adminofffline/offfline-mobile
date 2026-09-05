import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  Package,
  Factory,
  Printer,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useAuth } from '../../context/AuthContext';
import { plantApi } from '../../api/plant';
import apiCache from '../../api/cache';
import { PlantBatchItem } from '../../types';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { StatusBadge } from '../../components/StatusBadge';
import { Header } from '../../components/Header';
import { UserMenuModal } from '../../components/UserMenuModal';
import { PlantProfileModal } from './PlantProfileModal';
import { NativePressable } from '../../components/common/NativePressable';

export const PlantBatchesScreen: React.FC = () => {
  const { user } = useAuth();
  
  // Instant 0ms hydration from cache
  const cachedBatches = apiCache.get<any>('manufacturer_batches')?.data?.batches || [];
  const cachedProfile = apiCache.get<any>(`plant_profile_${user?._id || 'me'}`)?.data?.profile?.plant_profile;

  const [batches, setBatches] = useState<PlantBatchItem[]>(cachedBatches);
  const [loading, setLoading] = useState(cachedBatches.length === 0);
  const [savingCapacity, setSavingCapacity] = useState(false);
  const [capacityMessage, setCapacityMessage] = useState<string | null>(null);

  const [minCapacity, setMinCapacity] = useState(String(cachedProfile?.min_capacity || 500));
  const [maxCapacity, setMaxCapacity] = useState(String(cachedProfile?.max_capacity || 50000));
  const [hasInhousePrinter, setHasInhousePrinter] = useState(Boolean(cachedProfile?.has_inhouse_printer));

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const loadData = useCallback(async (forceRefresh = false) => {
    if (batches.length === 0 || forceRefresh) {
      setLoading(true);
    }
    try {
      const profRes = await plantApi.getProfile(user?._id, forceRefresh).catch(() => null);
      if (profRes?.data?.profile?.plant_profile) {
        const p = profRes.data.profile.plant_profile;
        setMinCapacity(String(p.min_capacity || 500));
        setMaxCapacity(String(p.max_capacity || 50000));
        setHasInhousePrinter(Boolean(p.has_inhouse_printer));
      }

      const res = await plantApi.getBatches(forceRefresh).catch(() => null);
      const list = res?.data?.batches || [];
      setBatches(list);
    } catch (e) {
      console.warn('Failed to load plant batches:', e);
    } finally {
      setLoading(false);
    }
  }, [batches.length, user?._id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveCapacity = async () => {
    setSavingCapacity(true);
    setCapacityMessage(null);
    try {
      await plantApi.saveCapacity({
        min_capacity: parseInt(minCapacity, 10) || 500,
        max_capacity: parseInt(maxCapacity, 10) || 50000,
        has_inhouse_printer: hasInhousePrinter,
        city: 'Chennai',
      });
      try {
        ReactNativeHapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
      } catch (e) {}
      setCapacityMessage('✓ Water Plant capacity & labeling capability updated!');
    } catch (err: any) {
      setCapacityMessage('Failed to update capacity profile');
    } finally {
      setSavingCapacity(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Plant Batch Inventory"
        subtitle="Capacity & Assigned Campaign Queue"
        onOpenUserMenu={() => setShowUserMenu(true)}
      />

      <FlatList
        data={batches}
        keyExtractor={(item, index) => item._id || item.id || `batch_${index}`}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            {capacityMessage && (
              <View style={styles.statusBanner}>
                <CheckCircle2 size={16} color={COLORS.success} />
                <Text style={styles.statusBannerText}>{capacityMessage}</Text>
              </View>
            )}

            {/* Capacity Card */}
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <Factory size={18} color={COLORS.plantAccent} />
                <Text style={styles.cardTitle}>Plant Capacity & Labeling Specs</Text>
              </View>

              <View style={styles.inputsRow}>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>MIN CANS</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={minCapacity}
                    onChangeText={setMinCapacity}
                  />
                </View>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>MAX CANS</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={maxCapacity}
                    onChangeText={setMaxCapacity}
                  />
                </View>
              </View>

              <NativePressable
                style={styles.checkboxRow}
                onPress={() => setHasInhousePrinter(!hasInhousePrinter)}
                haptic="selection"
                scaleActive={0.98}
              >
                <View style={[styles.checkbox, hasInhousePrinter && styles.checkboxActive]}>
                  {hasInhousePrinter && <CheckCircle2 size={12} color={COLORS.white} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkboxLabel}>Has In-House Label Printer</Text>
                  <Text style={styles.checkboxSub}>Applies shrink sleeves on plant site</Text>
                </View>
              </NativePressable>

              <NativePressable
                style={styles.saveBtn}
                onPress={handleSaveCapacity}
                disabled={savingCapacity}
                haptic="impactMedium"
                scaleActive={0.98}
              >
                {savingCapacity ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <Save size={14} color={COLORS.white} />
                    <Text style={styles.saveBtnText}>Update Capacity</Text>
                  </>
                )}
              </NativePressable>
            </View>

            <View style={styles.sectionDivider}>
              <Package size={16} color={COLORS.plantAccent} />
              <Text style={styles.sectionDividerTitle}>Active Assigned Campaigns</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.batchCard}>
            <View style={styles.batchLeft}>
              <Text style={styles.batchTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.batchSub}>
                ID: {item.id || item._id} &bull; Target: {(item.target_sticker_count || 1000).toLocaleString()} Cans
              </Text>
            </View>
            <StatusBadge status={item.status} size="sm" />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={36} color={COLORS.slate300} />
            <Text style={styles.emptyTitle}>No Assigned Campaigns</Text>
            <Text style={styles.emptyDesc}>
              No bottling batches currently allocated to this plant facility.
            </Text>
          </View>
        }
      />

      {showUserMenu && (
        <UserMenuModal
          visible={true}
          onClose={() => setShowUserMenu(false)}
          onOpenProfile={() => setShowProfileModal(true)}
        />
      )}

      {showProfileModal && (
        <PlantProfileModal
          visible={true}
          onClose={() => setShowProfileModal(false)}
        />
      )}
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
    marginBottom: SPACING.sm,
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
  },
  statusBannerText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '700',
    color: COLORS.successText,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  cardTitle: {
    ...TYPOGRAPHY.base,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.slate700,
    marginBottom: 4,
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
  checkboxSub: {
    fontSize: 10,
    color: COLORS.slate500,
  },
  saveBtn: {
    backgroundColor: COLORS.slate900,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  saveBtnText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.white,
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  sectionDividerTitle: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.slate700,
    textTransform: 'uppercase',
  },
  batchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  batchLeft: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  batchTitle: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  batchSub: {
    fontSize: 10,
    color: COLORS.slate500,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...TYPOGRAPHY.sm,
    fontWeight: '800',
    color: COLORS.slate700,
    marginTop: SPACING.sm,
  },
  emptyDesc: {
    ...TYPOGRAPHY.xs,
    color: COLORS.slate400,
    marginTop: 2,
  },
});

export default PlantBatchesScreen;
