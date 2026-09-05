import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Bell, ArrowLeft, CheckCheck } from 'lucide-react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { notificationsApi } from '../../api/notifications';
import apiCache from '../../api/cache';
import { InAppNotification } from '../../types';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { formatDateShort } from '../../utils/formatters';
import { NativePressable } from '../../components/common/NativePressable';

interface NotificationsScreenProps {
  navigation: any;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  // 0ms instant cache hydration
  const cachedNotifs = apiCache.get<any>('notifications_{}')?.data?.notifications || [];
  const [notifications, setNotifications] = useState<InAppNotification[]>(
    Array.isArray(cachedNotifs) ? cachedNotifs : []
  );
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Background non-blocking fetch / revalidation
  const loadNotifications = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    try {
      const res = await notificationsApi.getNotifications({}, forceRefresh);
      const list = res.data?.notifications || [];
      setNotifications(list);
    } catch (e) {
      console.warn('Failed to load notifications:', e);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Instant 0ms client-side filter computation
  const displayedNotifications = useMemo(() => {
    if (filter === 'UNREAD') {
      return notifications.filter((n) => !n.is_read);
    }
    return notifications;
  }, [notifications, filter]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  // Optimistic 0ms read state update
  const handleMarkRead = async (id: string) => {
    try {
      ReactNativeHapticFeedback.trigger('selection', { enableVibrateFallback: true });
    } catch (e) {}
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await notificationsApi.markAsRead(id);
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      ReactNativeHapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
    } catch (e) {}
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await notificationsApi.markAllAsRead();
    } catch (e) {}
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <NativePressable
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            haptic="impactLight"
            hitSlop={8}
          >
            <ArrowLeft size={18} color={COLORS.slate700} />
          </NativePressable>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Notifications Center</Text>
            <Text style={styles.headerSubtitle}>Real-time bottling & delivery alerts</Text>
          </View>
          <NativePressable
            style={styles.markAllBtn}
            onPress={handleMarkAllRead}
            haptic="impactLight"
            hitSlop={8}
          >
            <CheckCheck size={16} color={COLORS.distributorAccent} />
          </NativePressable>
        </View>

        {/* Filter Tabs - Instant 0ms response */}
        <View style={styles.tabRow}>
          <NativePressable
            style={[styles.tabBtn, filter === 'ALL' && styles.tabBtnActive]}
            onPress={() => setFilter('ALL')}
            haptic="selection"
            scaleActive={0.96}
          >
            <Text style={[styles.tabBtnText, filter === 'ALL' && styles.tabBtnTextActive]}>
              All Notifications ({notifications.length})
            </Text>
          </NativePressable>

          <NativePressable
            style={[styles.tabBtn, filter === 'UNREAD' && styles.tabBtnActive]}
            onPress={() => setFilter('UNREAD')}
            haptic="selection"
            scaleActive={0.96}
          >
            <Text style={[styles.tabBtnText, filter === 'UNREAD' && styles.tabBtnTextActive]}>
              Unread {unreadCount > 0 ? `(${unreadCount})` : ''}
            </Text>
          </NativePressable>
        </View>

        {/* Notifications List */}
        <FlatList
          data={displayedNotifications}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => loadNotifications(true)} />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <NativePressable
              style={[styles.notifCard, !item.is_read && styles.notifCardUnread]}
              onPress={() => handleMarkRead(item.id)}
              haptic="selection"
              scaleActive={0.985}
            >
              <View style={styles.notifLeft}>
                <View
                  style={[
                    styles.notifIconCircle,
                    !item.is_read ? styles.notifIconUnread : styles.notifIconRead,
                  ]}
                >
                  <Bell size={16} color={!item.is_read ? COLORS.distributorAccent : COLORS.slate400} />
                </View>
              </View>

              <View style={styles.notifBody}>
                <View style={styles.notifHeaderRow}>
                  <Text style={styles.notifTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.notifTime}>{formatDateShort(item.created_at)}</Text>
                </View>
                <Text style={styles.notifMessage}>{item.message}</Text>
                {item.location_name && (
                  <Text style={styles.notifLocation}>📍 {item.location_name}</Text>
                )}
              </View>
            </NativePressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Bell size={36} color={COLORS.slate300} />
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptyDesc}>You have no pending alerts or messages.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  headerTitle: {
    ...TYPOGRAPHY.base,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.xs,
    color: COLORS.slate500,
  },
  markAllBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.distributorBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tabBtn: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.slate100,
  },
  tabBtnActive: {
    backgroundColor: COLORS.slate900,
  },
  tabBtnText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '700',
    color: COLORS.slate600,
  },
  tabBtnTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  notifCardUnread: {
    borderColor: COLORS.distributorBorder,
    backgroundColor: '#FAF5FF',
  },
  notifLeft: {
    marginRight: SPACING.md,
  },
  notifIconCircle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifIconUnread: {
    backgroundColor: COLORS.distributorBg,
  },
  notifIconRead: {
    backgroundColor: COLORS.slate100,
  },
  notifBody: {
    flex: 1,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  notifTitle: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.slate900,
    flex: 1,
  },
  notifTime: {
    fontSize: 10,
    color: COLORS.slate400,
    marginLeft: SPACING.xs,
  },
  notifMessage: {
    ...TYPOGRAPHY.xs,
    color: COLORS.slate600,
    lineHeight: 16,
  },
  notifLocation: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.slate500,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyTitle: {
    ...TYPOGRAPHY.md,
    fontWeight: '800',
    color: COLORS.slate700,
    marginTop: SPACING.md,
  },
  emptyDesc: {
    ...TYPOGRAPHY.xs,
    color: COLORS.slate400,
    marginTop: 2,
  },
});

export default NotificationsScreen;
