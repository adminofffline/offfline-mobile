import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Easing,
  PanResponder,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import Svg, { Circle, Rect, Path } from 'react-native-svg';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { NativePressable } from './NativePressable';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ToastData {
  title: string;
  subtitle?: string;
  highlight?: string;
  isCelebration?: boolean;
  duration?: number;
}

interface AppleCelebrationToastProps {
  data: ToastData | string | null;
  onDismiss: () => void;
}

// ── Vibrant Confetti Particles Around Toast ──
interface ConfettiParticle {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  rotate: string;
  scale: number;
  color: string;
  size: number;
  type: 'rect' | 'circle' | 'strip';
}

const CONFETTI_COLORS = [
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#34D399', // Mint
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
];

const generateConfettiParticles = (count = 14): ConfettiParticle[] => {
  const particles: ConfettiParticle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI + (Math.random() * 0.4 - 0.2);
    const distance = Math.random() * 45 + 30;
    const isTop = Math.random() > 0.5;
    const startX = (Math.random() - 0.5) * (SCREEN_WIDTH * 0.7);
    const startY = isTop ? -10 : 25;

    particles.push({
      id: i,
      startX,
      startY,
      endX: startX + Math.cos(angle) * distance,
      endY: startY + (Math.sin(angle) * distance * 0.8) + (isTop ? -15 : 20),
      rotate: `${Math.floor(Math.random() * 360)}deg`,
      scale: Math.random() * 0.5 + 0.7,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: Math.random() * 4 + 5,
      type: i % 3 === 0 ? 'rect' : i % 3 === 1 ? 'circle' : 'strip',
    });
  }
  return particles;
};

export const AppleCelebrationToast: React.FC<AppleCelebrationToastProps> = ({
  data,
  onDismiss,
}) => {
  const toastData: ToastData | null = useMemo(() => {
    if (!data) return null;
    if (typeof data === 'string') {
      const clean = data.replace(/^✓\s*/, '').trim();
      // Auto-extract +X,XXX cans recorded!
      const match = clean.match(/^(\+[\d,]+k?|\+₹[\d,.]+)\s*(.*)/i);
      if (match) {
        return {
          title: clean,
          highlight: match[1],
          subtitle: clean.toLowerCase().includes('cans recorded')
            ? 'Great work! Keep it going.'
            : undefined,
          isCelebration: true,
        };
      }
      return {
        title: clean,
        isCelebration: clean.includes('🎉') || clean.includes('recorded') || clean.includes('boost'),
      };
    }
    return data;
  }, [data]);

  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.88)).current;
  const iconScale = useRef(new Animated.Value(0.3)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isDismissing = useRef(false);

  const particles = useMemo(() => {
    return toastData?.isCelebration ? generateConfettiParticles(16) : [];
  }, [toastData?.isCelebration]);

  const dismiss = useCallback(() => {
    if (isDismissing.current) return;
    isDismissing.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 220,
        easing: Easing.bezier(0.32, 1, 0.23, 1),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      isDismissing.current = false;
      onDismiss();
    });
  }, [translateY, opacity, scale, onDismiss]);

  // Swipe up to dismiss gesture
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_evt, gesture) => gesture.dy < -4,
        onPanResponderMove: (_evt, gesture) => {
          if (gesture.dy < 0) {
            translateY.setValue(gesture.dy);
          }
        },
        onPanResponderRelease: (_evt, gesture) => {
          if (gesture.dy < -20 || gesture.vy < -0.3) {
            dismiss();
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              damping: 18,
              stiffness: 250,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [translateY, dismiss]
  );

  useEffect(() => {
    if (toastData) {
      isDismissing.current = false;
      translateY.setValue(-100);
      opacity.setValue(0);
      scale.setValue(0.85);
      iconScale.setValue(0.2);
      confettiAnim.setValue(0);

      // Trigger Haptic
      try {
        ReactNativeHapticFeedback.trigger(
          toastData.isCelebration ? 'notificationSuccess' : 'impactMedium',
          { enableVibrateFallback: true }
        );
      } catch (e) {}

      // Enter Animation Sequence
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 15,
          mass: 0.8,
          stiffness: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          damping: 14,
          stiffness: 240,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(80),
          Animated.spring(iconScale, {
            toValue: 1,
            friction: 4,
            tension: 160,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      const displayDuration = toastData.duration || (toastData.subtitle ? 3600 : 2800);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(dismiss, displayDuration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toastData, translateY, opacity, scale, iconScale, confettiAnim, dismiss]);

  if (!toastData) return null;

  // Title rendering with highlight separation (e.g. "+5,000" in green + "cans recorded!" in navy)
  const renderTitleContent = () => {
    if (toastData.highlight && toastData.title.includes(toastData.highlight)) {
      const parts = toastData.title.split(toastData.highlight);
      const trailing = parts.slice(1).join(toastData.highlight).trim();
      return (
        <View style={styles.titleRow}>
          <Text style={styles.highlightText}>{toastData.highlight} </Text>
          <Text style={styles.titleNavyText}>{trailing}</Text>
        </View>
      );
    }

    // Check if starts with +number
    const plusMatch = toastData.title.match(/^(\+[\d,]+k?|\+₹[\d,.]+)(.*)/i);
    if (plusMatch) {
      return (
        <View style={styles.titleRow}>
          <Text style={styles.highlightText}>{plusMatch[1]} </Text>
          <Text style={styles.titleNavyText}>{plusMatch[2].trim()}</Text>
        </View>
      );
    }

    return <Text style={styles.titleNavyText}>{toastData.title}</Text>;
  };

  return (
    <View style={styles.toastOverlayContainer} pointerEvents="box-none">
      {/* ── Confetti Floating Particles ── */}
      {particles.map((p) => {
        const particleX = confettiAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [p.startX, p.endX],
        });
        const particleY = confettiAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [p.startY, p.endY],
        });
        const particleOpacity = confettiAnim.interpolate({
          inputRange: [0, 0.2, 0.75, 1],
          outputRange: [0, 1, 0.85, 0],
        });
        const particleScale = confettiAnim.interpolate({
          inputRange: [0, 0.25, 1],
          outputRange: [0.2, p.scale, p.scale * 0.6],
        });

        return (
          <Animated.View
            key={p.id}
            pointerEvents="none"
            style={[
              styles.particleWrap,
              {
                transform: [
                  { translateX: particleX },
                  { translateY: particleY },
                  { scale: particleScale },
                  { rotate: p.rotate },
                ],
                opacity: particleOpacity,
              },
            ]}
          >
            {p.type === 'circle' ? (
              <View
                style={{
                  width: p.size,
                  height: p.size,
                  borderRadius: p.size / 2,
                  backgroundColor: p.color,
                }}
              />
            ) : p.type === 'strip' ? (
              <View
                style={{
                  width: p.size * 1.8,
                  height: p.size * 0.6,
                  borderRadius: 2,
                  backgroundColor: p.color,
                }}
              />
            ) : (
              <View
                style={{
                  width: p.size,
                  height: p.size,
                  borderRadius: 1.5,
                  backgroundColor: p.color,
                }}
              />
            )}
          </Animated.View>
        );
      })}

      {/* ── Animated Toast Pill Capsule ── */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.toastPillCard,
          {
            transform: [{ translateY }, { scale }],
            opacity,
          },
        ]}
      >
        {/* Soft Ambient Inner Gradient Tint */}
        <View style={styles.pillShineBg} pointerEvents="none" />

        {/* Left Circular Emerald Check Badge */}
        <Animated.View
          style={[
            styles.emeraldCircleBadge,
            {
              transform: [{ scale: iconScale }],
            },
          ]}
        >
          <Check color="#FFFFFF" size={18} strokeWidth={3.2} />
        </Animated.View>

        {/* Center Text Container */}
        <View style={styles.textColumn}>
          {renderTitleContent()}
          {toastData.subtitle ? (
            <Text style={styles.subtitleText} numberOfLines={1}>
              {toastData.subtitle}
            </Text>
          ) : null}
        </View>

        {/* Right Dismiss '✕' Button */}
        <NativePressable
          style={styles.closeBtn}
          onPress={dismiss}
          hapticType="selection"
          scaleActive={0.88}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <X color="#64748B" size={17} strokeWidth={2.4} />
        </NativePressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  toastOverlayContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 62 : 44,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99999,
  },
  toastPillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    paddingLeft: 6,
    paddingRight: 10,
    paddingVertical: 6,
    maxWidth: SCREEN_WIDTH - 32,
    borderWidth: 1.2,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    // Soft glowing emerald/cyan drop shadow
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  pillShineBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(240, 253, 244, 0.65)',
    borderRadius: 9999,
  },
  emeraldCircleBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  textColumn: {
    justifyContent: 'center',
    paddingVertical: 1,
    paddingRight: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  highlightText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: -0.2,
  },
  titleNavyText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  subtitleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
    letterSpacing: -0.1,
  },
  closeBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(241, 245, 249, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  particleWrap: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    zIndex: 99998,
  },
});

export default AppleCelebrationToast;
