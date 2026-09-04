import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, MapPin, ShieldCheck, Factory, Truck } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenNotifications?: () => void;
  onOpenUserMenu?: () => void;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenNotifications,
  onOpenUserMenu,
  unreadNotificationsCount = 0,
}) => {
  const insets = useSafeAreaInsets();
  const { user, role } = useAuth();
  const isPlant = role === 'WATER_PLANT';

  const defaultTitle = isPlant
    ? (user?.plantName || user?.companyName || user?.fullName || 'Water Bottling Plant')
    : (user?.companyName || user?.organization || user?.fullName || 'South Beverages Logistics');

  const defaultSubtitle = isPlant
    ? (user?.isiNumber ? `ISI: ${user.isiNumber}` : 'ISI Certified Water Facility')
    : 'Verified Water Distributor';

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.sm }]}>
      <View style={styles.contentRow}>
        {/* Left: Role Icon & Title */}
        <View style={styles.titleGroup}>
          <View style={[styles.roleBadge, isPlant ? styles.plantBadge : styles.distributorBadge]}>
            {isPlant ? (
              <Factory size={16} color={COLORS.plantAccent} />
            ) : (
              <Truck size={16} color={COLORS.distributorAccent} />
            )}
          </View>
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.titleText} numberOfLines={1}>
                {title || defaultTitle}
              </Text>
              <ShieldCheck size={14} color={COLORS.success} style={{ marginLeft: 4 }} />
            </View>
            <View style={styles.subtitleRow}>
              <MapPin size={11} color={COLORS.slate400} />
              <Text style={styles.subtitleText} numberOfLines={1}>
                {subtitle || defaultSubtitle}
              </Text>
            </View>
          </View>
        </View>

        {/* Right: Actions (Notifications & User Avatar) */}
        <View style={styles.actionsRow}>
          {onOpenNotifications && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onOpenNotifications}
              activeOpacity={0.7}
            >
              <Bell size={18} color={COLORS.slate700} />
              {unreadNotificationsCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={onOpenUserMenu}
            activeOpacity={0.7}
          >
            {user?.avatar || user?.logoUrl ? (
              <Image source={{ uri: user.avatar || user.logoUrl }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarPlaceholder, isPlant ? styles.plantAvatar : styles.distributorAvatar]}>
                <Text style={styles.avatarText}>
                  {(user?.fullName || user?.plantName || user?.companyName || 'W').substring(0, 2).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.md,
  },
  roleBadge: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  plantBadge: {
    backgroundColor: COLORS.plantBg,
    borderWidth: 1,
    borderColor: COLORS.plantBorder,
  },
  distributorBadge: {
    backgroundColor: COLORS.distributorBg,
    borderWidth: 1,
    borderColor: COLORS.distributorBorder,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    ...TYPOGRAPHY.md,
    fontWeight: '800',
    color: COLORS.slate900,
    flexShrink: 1,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 3,
  },
  subtitleText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.slate500,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.slate100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.error,
    borderRadius: RADIUS.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  unreadBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.white,
  },
  avatarBtn: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  avatarImg: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plantAvatar: {
    backgroundColor: COLORS.plantBg,
    borderWidth: 1,
    borderColor: COLORS.plantBorder,
  },
  distributorAvatar: {
    backgroundColor: COLORS.distributorBg,
    borderWidth: 1,
    borderColor: COLORS.distributorBorder,
  },
  avatarText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.slate800,
  },
});

export default Header;
