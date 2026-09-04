import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Scan, LucideIcon } from 'lucide-react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const { width } = Dimensions.get('window');

export interface NavTabItem {
  key: string;
  label: string;
  icon: LucideIcon | React.ComponentType<any>;
  badge?: number | string;
}

export interface LiquidGlassNavBarProps {
  leftTab: NavTabItem;
  rightTab: NavTabItem;
  activeTab: string;
  onSelectTab: (key: string) => void;
  onPressCenterScan: () => void;
}

export const LiquidGlassNavBar: React.FC<LiquidGlassNavBarProps> = ({
  leftTab,
  rightTab,
  activeTab,
  onSelectTab,
  onPressCenterScan,
}) => {
  const orbScale = useRef(new Animated.Value(1)).current;
  const leftTabScale = useRef(new Animated.Value(1)).current;
  const rightTabScale = useRef(new Animated.Value(1)).current;

  // Sliding indicator animation (0 = Left, 1 = Right)
  const slideAnim = useRef(new Animated.Value(activeTab === leftTab.key ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeTab === leftTab.key ? 0 : 1,
      friction: 7,
      tension: 65,
      useNativeDriver: false,
    }).start();
  }, [activeTab, leftTab.key, slideAnim]);

  const handleOrbPressIn = () => {
    Animated.spring(orbScale, {
      toValue: 0.88,
      friction: 5,
      tension: 140,
      useNativeDriver: true,
    }).start();
  };

  const handleOrbPressOut = () => {
    Animated.spring(orbScale, {
      toValue: 1,
      friction: 4,
      tension: 90,
      useNativeDriver: true,
    }).start();
  };

  const handleOrbPress = () => {
    try {
      ReactNativeHapticFeedback.trigger('impactMedium', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    } catch (e) {}
    onPressCenterScan();
  };

  const handleTabPress = (tabKey: string, scaleAnim: Animated.Value) => {
    try {
      ReactNativeHapticFeedback.trigger('selection', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    } catch (e) {}

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onSelectTab(tabKey);
  };

  const isLeftActive = activeTab === leftTab.key;
  const isRightActive = activeTab === rightTab.key;

  const LeftIcon = leftTab.icon;
  const RightIcon = rightTab.icon;

  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      {/* ── Floating Liquid Glass Dynamic Capsule Bar ── */}
      <View style={styles.glassCapsuleBar}>
        {/* Left Tab Button */}
        <Animated.View style={[{ transform: [{ scale: leftTabScale }] }]}>
          <TouchableOpacity
            style={[styles.tabButton, isLeftActive && styles.activePillBackground]}
            onPress={() => handleTabPress(leftTab.key, leftTabScale)}
            activeOpacity={0.82}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <View style={styles.iconBadgeWrap}>
              <LeftIcon
                color={isLeftActive ? '#0F172A' : '#64748B'}
                size={21}
                strokeWidth={isLeftActive ? 2.4 : 1.9}
              />
              {leftTab.badge !== undefined && (
                <View style={styles.redBadgePill}>
                  <Text style={styles.redBadgeText}>{leftTab.badge}</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.tabLabelText,
                isLeftActive ? styles.activeLabel : styles.inactiveLabel,
              ]}
              numberOfLines={1}
            >
              {leftTab.label}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Center Reservation Gap for Floating Orb */}
        <View style={styles.orbReservedGap} />

        {/* Right Tab Button */}
        <Animated.View style={[{ transform: [{ scale: rightTabScale }] }]}>
          <TouchableOpacity
            style={[styles.tabButton, isRightActive && styles.activePillBackground]}
            onPress={() => handleTabPress(rightTab.key, rightTabScale)}
            activeOpacity={0.82}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <View style={styles.iconBadgeWrap}>
              <RightIcon
                color={isRightActive ? '#0F172A' : '#64748B'}
                size={21}
                strokeWidth={isRightActive ? 2.4 : 1.9}
              />
              {rightTab.badge !== undefined && (
                <View style={styles.redBadgePill}>
                  <Text style={styles.redBadgeText}>{rightTab.badge}</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.tabLabelText,
                isRightActive ? styles.activeLabel : styles.inactiveLabel,
              ]}
              numberOfLines={1}
            >
              {rightTab.label}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* ── Center Elevated Floating Liquid Glass Scan Orb ── */}
      <View style={styles.orbAnchorWrap} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.orbSpringContainer,
            { transform: [{ scale: orbScale }] },
          ]}
        >
          {/* Ambient Radial Halo Glow */}
          <View style={styles.orbAmbientHalo} />

          {/* Liquid Frosted Glass Orb Surface */}
          <TouchableOpacity
            style={styles.orbGlassSurface}
            onPressIn={handleOrbPressIn}
            onPressOut={handleOrbPressOut}
            onPress={handleOrbPress}
            activeOpacity={0.92}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            {/* Specular Top Glass Reflection */}
            <View style={styles.orbSpecularShine} />
            
            {/* 4-Corner Viewfinder Reticle Icon */}
            <Scan color="#334155" size={28} strokeWidth={2.4} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: Platform.OS === 'ios' ? 22 : 14,
  },
  glassCapsuleBar: {
    width: Math.min(width - 32, 400),
    height: 66,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 33,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 14,
  },
  tabButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 7,
    borderRadius: 24,
    minWidth: 116,
    height: 52,
  },
  activePillBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 1)',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  iconBadgeWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  redBadgePill: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#EF4444',
    borderRadius: 999,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  redBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  tabLabelText: {
    fontSize: 11.5,
    marginTop: 3,
    letterSpacing: -0.15,
  },
  activeLabel: {
    color: '#0F172A',
    fontWeight: '700',
  },
  inactiveLabel: {
    color: '#64748B',
    fontWeight: '600',
  },
  orbReservedGap: {
    width: 60,
    height: 40,
  },
  orbAnchorWrap: {
    position: 'absolute',
    top: -20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 110,
  },
  orbSpringContainer: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  orbAmbientHalo: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(226, 232, 240, 0.6)',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 10,
  },
  orbGlassSurface: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#334155',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  orbSpecularShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
  },
});

export default LiquidGlassNavBar;
