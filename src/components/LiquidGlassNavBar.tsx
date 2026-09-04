import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
  Easing,
} from 'react-native';
import { Scan, LucideIcon } from 'lucide-react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const { width } = Dimensions.get('window');
const BAR_WIDTH = Math.min(width - 48, 330);
const TAB_PADDING = 4;
const ORB_GAP_WIDTH = 50;
const TAB_WIDTH = (BAR_WIDTH - ORB_GAP_WIDTH - TAB_PADDING * 2) / 2;
const TRAVEL_DISTANCE = TAB_WIDTH + ORB_GAP_WIDTH;

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
  // ── Composite Liquid Glass Slider (0 = Left Tab, 1 = Right Tab) ──
  const isLeft = activeTab === leftTab.key;
  const slideAnim = useRef(new Animated.Value(isLeft ? 0 : 1)).current;

  // ── Minute Liquid Ripple Animations ──
  const leftRipple = useRef(new Animated.Value(0)).current;
  const rightRipple = useRef(new Animated.Value(0)).current;
  const orbRipple = useRef(new Animated.Value(0)).current;

  // ── Orb Press State (Smooth Linear Transition, No Bounce) ──
  const orbScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Smooth composite liquid slider glide (Linear + Cubic Easing, Zero Bouncing)
    Animated.timing(slideAnim, {
      toValue: isLeft ? 0 : 1,
      duration: 260,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start();
  }, [isLeft, slideAnim]);

  const triggerMinuteRipple = (rippleAnim: Animated.Value) => {
    rippleAnim.setValue(0);
    Animated.timing(rippleAnim, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const handleTabPress = (tabKey: string, isLeftTarget: boolean) => {
    try {
      ReactNativeHapticFeedback.trigger('selection', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    } catch (e) {}

    triggerMinuteRipple(isLeftTarget ? leftRipple : rightRipple);
    onSelectTab(tabKey);
  };

  const handleOrbPressIn = () => {
    Animated.timing(orbScale, {
      toValue: 0.94,
      duration: 80,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const handleOrbPressOut = () => {
    Animated.timing(orbScale, {
      toValue: 1,
      duration: 120,
      easing: Easing.out(Easing.quad),
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

    triggerMinuteRipple(orbRipple);
    onPressCenterScan();
  };

  const LeftIcon = leftTab.icon;
  const RightIcon = rightTab.icon;

  // ── Composite Interpolations for Liquid Slider ──
  const sliderTranslateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TRAVEL_DISTANCE],
  });

  // Subtle liquid hydrodynamic stretch while traveling
  const sliderScaleX = slideAnim.interpolate({
    inputRange: [0, 0.45, 0.75, 1],
    outputRange: [1, 1.04, 1.04, 1],
  });

  const sliderScaleY = slideAnim.interpolate({
    inputRange: [0, 0.45, 0.75, 1],
    outputRange: [1, 0.97, 0.97, 1],
  });

  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      {/* ── Main Dynamic Island Liquid Glass Capsule Bar ── */}
      <View style={styles.glassCapsuleBar}>
        {/* ── Physical Sliding Liquid Glass Capsule Pill ── */}
        <Animated.View
          style={[
            styles.slidingLiquidPill,
            {
              transform: [
                { translateX: sliderTranslateX },
                { scaleX: sliderScaleX },
                { scaleY: sliderScaleY },
              ],
            },
          ]}
          pointerEvents="none"
        >
          {/* Specular Liquid Glass Top Highlight */}
          <View style={styles.pillSpecularShine} />
        </Animated.View>

        {/* ── Left Tab Target Area ── */}
        <TouchableOpacity
          style={styles.tabTarget}
          onPress={() => handleTabPress(leftTab.key, true)}
          activeOpacity={0.88}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          {/* Minute Liquid Glass Ripple */}
          <Animated.View
            style={[
              styles.liquidRippleRing,
              {
                opacity: leftRipple.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.45, 0],
                }),
                transform: [
                  {
                    scale: leftRipple.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.85, 1.3],
                    }),
                  },
                ],
              },
            ]}
            pointerEvents="none"
          />

          <View style={styles.iconBadgeWrap}>
            <LeftIcon
              color={isLeft ? '#0F172A' : '#64748B'}
              size={19}
              strokeWidth={isLeft ? 2.4 : 1.9}
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
              isLeft ? styles.activeLabel : styles.inactiveLabel,
            ]}
            numberOfLines={1}
          >
            {leftTab.label}
          </Text>
        </TouchableOpacity>

        {/* ── Center Reservation Gap for Floating Orb ── */}
        <View style={styles.orbReservedGap} />

        {/* ── Right Tab Target Area ── */}
        <TouchableOpacity
          style={styles.tabTarget}
          onPress={() => handleTabPress(rightTab.key, false)}
          activeOpacity={0.88}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          {/* Minute Liquid Glass Ripple */}
          <Animated.View
            style={[
              styles.liquidRippleRing,
              {
                opacity: rightRipple.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.45, 0],
                }),
                transform: [
                  {
                    scale: rightRipple.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.85, 1.3],
                    }),
                  },
                ],
              },
            ]}
            pointerEvents="none"
          />

          <View style={styles.iconBadgeWrap}>
            <RightIcon
              color={!isLeft ? '#0F172A' : '#64748B'}
              size={19}
              strokeWidth={!isLeft ? 2.4 : 1.9}
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
              !isLeft ? styles.activeLabel : styles.inactiveLabel,
            ]}
            numberOfLines={1}
          >
            {rightTab.label}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Center Elevated Floating Liquid Glass Scan Orb ── */}
      <View style={styles.orbAnchorWrap} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.orbContainer,
            { transform: [{ scale: orbScale }] },
          ]}
        >
          {/* Ambient Halo Diffused Glass Glow */}
          <View style={styles.orbAmbientHalo} />

          {/* Minute Liquid Ripple on Orb */}
          <Animated.View
            style={[
              styles.orbLiquidRipple,
              {
                opacity: orbRipple.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 0],
                }),
                transform: [
                  {
                    scale: orbRipple.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1.35],
                    }),
                  },
                ],
              },
            ]}
            pointerEvents="none"
          />

          {/* Liquid Frosted Glass Orb Surface */}
          <TouchableOpacity
            style={styles.orbGlassSurface}
            onPressIn={handleOrbPressIn}
            onPressOut={handleOrbPressOut}
            onPress={handleOrbPress}
            activeOpacity={0.92}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            {/* Top Glass Specular Shine */}
            <View style={styles.orbSpecularShine} />
            
            {/* 4-Corner Viewfinder Reticle Icon */}
            <Scan color="#334155" size={24} strokeWidth={2.4} />
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
    paddingBottom: Platform.OS === 'ios' ? 18 : 10,
  },
  glassCapsuleBar: {
    width: BAR_WIDTH,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 28,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: TAB_PADDING,
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  slidingLiquidPill: {
    position: 'absolute',
    top: TAB_PADDING,
    left: TAB_PADDING,
    width: TAB_WIDTH,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 1)',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  pillSpecularShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tabTarget: {
    width: TAB_WIDTH,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    position: 'relative',
  },
  liquidRippleRing: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(226, 232, 240, 0.6)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  iconBadgeWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  redBadgePill: {
    position: 'absolute',
    top: -3,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 999,
    minWidth: 15,
    height: 15,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: '#FFFFFF',
  },
  redBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
  },
  tabLabelText: {
    fontSize: 10.5,
    marginTop: 2,
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
    width: ORB_GAP_WIDTH,
    height: 36,
  },
  orbAnchorWrap: {
    position: 'absolute',
    top: -16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 110,
  },
  orbContainer: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  orbAmbientHalo: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(226, 232, 240, 0.6)',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
  },
  orbLiquidRipple: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(226, 232, 240, 0.7)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  orbGlassSurface: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#334155',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  orbSpecularShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
});

export default LiquidGlassNavBar;
