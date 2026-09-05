import React, { useRef, useMemo } from 'react';
import {
  Pressable,
  Animated,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
  StyleSheet,
  Insets,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

export type HapticFeedbackType =
  | 'selection'
  | 'impactLight'
  | 'impactMedium'
  | 'impactHeavy'
  | 'notificationSuccess'
  | 'notificationWarning'
  | 'notificationError'
  | 'none';

export interface NativePressableProps {
  children: React.ReactNode | ((state: { pressed: boolean }) => React.ReactNode);
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  onPressIn?: (event: GestureResponderEvent) => void;
  onPressOut?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  activeScale?: number;
  scaleActive?: number;
  activeOpacity?: number;
  haptic?: HapticFeedbackType;
  hapticType?: HapticFeedbackType;
  disabled?: boolean;
  hitSlop?: Insets | number;
  throttleMs?: number;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityRole?: any;
}

const DEFAULT_HIT_SLOP: Insets = { top: 6, bottom: 6, left: 6, right: 6 };

export const NativePressableComponent: React.FC<NativePressableProps> = ({
  children,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  style,
  activeScale,
  scaleActive,
  activeOpacity = 0.88,
  haptic,
  hapticType,
  disabled = false,
  hitSlop = DEFAULT_HIT_SLOP,
  throttleMs = 250,
  testID,
  accessibilityLabel,
  accessibilityRole,
}) => {
  const targetScale = scaleActive ?? activeScale ?? 0.97;
  const targetHaptic = hapticType ?? haptic ?? 'impactLight';
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const lastPressTimeRef = useRef<number>(0);

  const handlePressIn = (event: GestureResponderEvent) => {
    if (disabled) return;

    if (targetHaptic !== 'none') {
      try {
        ReactNativeHapticFeedback.trigger(targetHaptic, {
          enableVibrateFallback: true,
          ignoreAndroidSystemSettings: false,
        });
      } catch (e) {}
    }

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: targetScale,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: activeOpacity,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPressIn) onPressIn(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    if (disabled) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 280,
        friction: 18,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPressOut) onPressOut(event);
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (disabled) return;

    // Hardened 0-latency throttle guard against rapid double-taps
    const now = Date.now();
    if (throttleMs > 0 && now - lastPressTimeRef.current < throttleMs) {
      return;
    }
    lastPressTimeRef.current = now;

    if (onPress) onPress(event);
  };

  // Pre-extract layout properties once when static style prop changes (eliminates per-frame flatten)
  const outerStyle = useMemo(() => {
    if (typeof style === 'function') return null;
    const flat = StyleSheet.flatten(style) || {};
    return {
      ...(flat.flex !== undefined ? { flex: flat.flex } : {}),
      ...(flat.flexGrow !== undefined ? { flexGrow: flat.flexGrow } : {}),
      ...(flat.flexShrink !== undefined ? { flexShrink: flat.flexShrink } : {}),
      ...(flat.alignSelf ? { alignSelf: flat.alignSelf } : {}),
      ...(flat.position === 'absolute'
        ? {
            position: 'absolute' as const,
            top: flat.top,
            bottom: flat.bottom,
            left: flat.left,
            right: flat.right,
            zIndex: flat.zIndex,
          }
        : {}),
      ...(flat.margin !== undefined ? { margin: flat.margin } : {}),
      ...(flat.marginTop !== undefined ? { marginTop: flat.marginTop } : {}),
      ...(flat.marginBottom !== undefined ? { marginBottom: flat.marginBottom } : {}),
      ...(flat.marginLeft !== undefined ? { marginLeft: flat.marginLeft } : {}),
      ...(flat.marginRight !== undefined ? { marginRight: flat.marginRight } : {}),
      ...(flat.marginHorizontal !== undefined ? { marginHorizontal: flat.marginHorizontal } : {}),
      ...(flat.marginVertical !== undefined ? { marginVertical: flat.marginVertical } : {}),
      ...(flat.width !== undefined ? { width: flat.width as any } : {}),
      ...(flat.height !== undefined ? { height: flat.height as any } : {}),
      ...(flat.maxWidth !== undefined ? { maxWidth: flat.maxWidth as any } : {}),
      ...(flat.minWidth !== undefined ? { minWidth: flat.minWidth as any } : {}),
    };
  }, [style]);

  return (
    <Pressable
      onPress={disabled ? undefined : handlePress}
      onLongPress={disabled ? undefined : onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={hitSlop}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      style={({ pressed }) => {
        if (typeof style === 'function') {
          const resolved = style({ pressed });
          const flat = StyleSheet.flatten(resolved) || {};
          return {
            ...(flat.flex !== undefined ? { flex: flat.flex } : {}),
            ...(flat.alignSelf ? { alignSelf: flat.alignSelf } : {}),
            ...(flat.position === 'absolute'
              ? {
                  position: 'absolute',
                  top: flat.top,
                  bottom: flat.bottom,
                  left: flat.left,
                  right: flat.right,
                  zIndex: flat.zIndex,
                }
              : {}),
            ...(flat.margin !== undefined ? { margin: flat.margin } : {}),
            ...(flat.marginTop !== undefined ? { marginTop: flat.marginTop } : {}),
            ...(flat.marginBottom !== undefined ? { marginBottom: flat.marginBottom } : {}),
            ...(flat.marginLeft !== undefined ? { marginLeft: flat.marginLeft } : {}),
            ...(flat.marginRight !== undefined ? { marginRight: flat.marginRight } : {}),
          };
        }
        return outerStyle;
      }}
    >
      {({ pressed }) => {
        const resolved = typeof style === 'function' ? style({ pressed }) : style;
        return (
          <Animated.View
            style={[
              resolved,
              outerStyle?.flex !== undefined ? { width: '100%' } : {},
              styles.resetMargin,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            {typeof children === 'function' ? children({ pressed }) : children}
          </Animated.View>
        );
      }}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  resetMargin: {
    margin: 0,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    marginHorizontal: 0,
    marginVertical: 0,
  },
});

export const NativePressable = React.memo(NativePressableComponent);
export default NativePressable;
