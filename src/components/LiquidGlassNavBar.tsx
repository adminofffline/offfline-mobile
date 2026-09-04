import React, { useRef } from 'react';
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

  const handleOrbPressIn = () => {
    Animated.spring(orbScale, {
      toValue: 0.9,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  const handleOrbPressOut = () => {
    Animated.spring(orbScale, {
      toValue: 1,
      friction: 5,
      tension: 80,
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
        toValue: 0.94,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 90,
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
    <View style={styles.navBarWrapper} pointerEvents="box-none">
      {/* Translucent Glass Base Bar */}
      <View style={styles.navBarContainer}>
        {/* ── Left Tab ── */}
        <Animated.View style={[{ transform: [{ scale: leftTabScale }] }]}>
          <TouchableOpacity
            style={[styles.tabButton, isLeftActive && styles.activePill]}
            onPress={() => handleTabPress(leftTab.key, leftTabScale)}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <LeftIcon
              color={isLeftActive ? '#0F172A' : '#64748B'}
              size={21}
              strokeWidth={isLeftActive ? 2.4 : 1.9}
            />
            <Text
              style={[
                styles.tabLabel,
                isLeftActive ? styles.activeTabLabel : styles.inactiveTabLabel,
              ]}
              numberOfLines={1}
            >
              {leftTab.label}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Center Placeholder to reserve space for Orb ── */}
        <View style={styles.centerSpacePlaceholder} />

        {/* ── Right Tab ── */}
        <Animated.View style={[{ transform: [{ scale: rightTabScale }] }]}>
          <TouchableOpacity
            style={[styles.tabButton, isRightActive && styles.activePill]}
            onPress={() => handleTabPress(rightTab.key, rightTabScale)}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <RightIcon
              color={isRightActive ? '#0F172A' : '#64748B'}
              size={21}
              strokeWidth={isRightActive ? 2.4 : 1.9}
            />
            <Text
              style={[
                styles.tabLabel,
                isRightActive ? styles.activeTabLabel : styles.inactiveTabLabel,
              ]}
              numberOfLines={1}
            >
              {rightTab.label}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* ── Center Floating Liquid Glass Orb ── */}
      <View style={styles.floatingCenterWrap} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.floatingOrbContainer,
            { transform: [{ scale: orbScale }] },
          ]}
        >
          {/* Outer Halo Glow Layer */}
          <View style={styles.orbHaloGlow} />

          {/* Liquid Glass Circular Button */}
          <TouchableOpacity
            style={styles.floatingGlassOrb}
            onPressIn={handleOrbPressIn}
            onPressOut={handleOrbPressOut}
            onPress={handleOrbPress}
            activeOpacity={0.92}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          >
            {/* Inner Glass Highlight Gradient effect */}
            <View style={styles.innerGlassHighlight} />
            <Scan color="#475569" size={28} strokeWidth={2.4} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  navBarContainer: {
    width: '100%',
    height: Platform.OS === 'ios' ? 82 : 70,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(241, 245, 249, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 18 : 6,
    paddingTop: 6,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  tabButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 22,
    minWidth: 110,
  },
  activePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 1)',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  tabLabel: {
    fontSize: 11.5,
    marginTop: 3,
    letterSpacing: -0.1,
  },
  activeTabLabel: {
    color: '#0F172A',
    fontWeight: '700',
  },
  inactiveTabLabel: {
    color: '#64748B',
    fontWeight: '600',
  },
  centerSpacePlaceholder: {
    width: 68,
    height: 40,
  },
  floatingCenterWrap: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? -28 : -30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 105,
  },
  floatingOrbContainer: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  orbHaloGlow: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(226, 232, 240, 0.5)',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  floatingGlassOrb: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  innerGlassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
  },
});

export default LiquidGlassNavBar;
