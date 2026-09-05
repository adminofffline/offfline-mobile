import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Platform,
  Easing,
  Dimensions,
  StyleProp,
  ViewStyle,
  PanResponder,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Precise snap points for iOS-grade physical sheet interaction
const TOP_SAFE_INSET = Platform.OS === 'ios' ? 44 : 24;
const SNAP_FULL = TOP_SAFE_INSET; // ~95% height (full screen respecting safe area)
const SNAP_EXPANDED = Math.round(SCREEN_HEIGHT * 0.18); // ~82% height
const SNAP_COLLAPSED = Math.round(SCREEN_HEIGHT * 0.42); // ~58% height
const SNAP_DISMISSED = SCREEN_HEIGHT + 80;

export interface PoppedBottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  children:
    | React.ReactNode
    | ((helpers: {
        close: () => void;
        snapTo: (snap: 'full' | 'expanded' | 'collapsed') => void;
      }) => React.ReactNode);
  backdropColor?: string;
  overlayStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  initialSnap?: 'full' | 'expanded' | 'collapsed';
}

export const PoppedBottomSheetModal: React.FC<PoppedBottomSheetModalProps> = ({
  visible,
  onClose,
  children,
  backdropColor = 'rgba(15, 23, 42, 0.45)',
  contentContainerStyle,
  initialSnap = 'collapsed',
}) => {
  const [mounted, setMounted] = useState(visible);
  const slideAnim = useRef(new Animated.Value(SNAP_DISMISSED)).current;
  const currentSlideVal = useRef(SNAP_DISMISSED);
  const isDismissing = useRef(false);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const dragStartPos = useRef(SNAP_COLLAPSED);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Track the live animated value synchronously for seamless touch pickups
  useEffect(() => {
    const id = slideAnim.addListener(({ value }) => {
      currentSlideVal.current = value;
    });
    return () => slideAnim.removeListener(id);
  }, [slideAnim]);

  // Preserve the last non-null children so exiting transitions render complete content
  const lastChildrenRef = useRef(children);
  if (children) {
    lastChildrenRef.current = children;
  }

  // Trigger subtle tactile feedback
  const triggerHaptic = useCallback(() => {
    try {
      ReactNativeHapticFeedback.trigger('impactLight', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    } catch (_e) {}
  }, []);

  // Smooth dismiss animation
  const handleDismiss = useCallback(
    (velocity = 0) => {
      if (isDismissing.current) return;
      isDismissing.current = true;
      if (animRef.current) {
        animRef.current.stop();
      }
      triggerHaptic();

      animRef.current = Animated.timing(slideAnim, {
        toValue: SNAP_DISMISSED,
        duration: Math.max(160, Math.min(240, 220 - Math.abs(velocity) * 40)),
        easing: Easing.bezier(0.25, 1, 0.5, 1),
        useNativeDriver: true,
      });
      animRef.current.start(({ finished }) => {
        isDismissing.current = false;
        if (finished) {
          setMounted(false);
          onCloseRef.current();
        }
      });
    },
    [slideAnim, triggerHaptic]
  );

  // Smooth spring snap to a specific target point
  const snapToPosition = useCallback(
    (targetVal: number, velocity = 0) => {
      if (animRef.current) {
        animRef.current.stop();
      }
      triggerHaptic();

      animRef.current = Animated.spring(slideAnim, {
        toValue: targetVal,
        velocity: velocity,
        damping: 26,
        mass: 0.8,
        stiffness: 300,
        useNativeDriver: true,
      });
      animRef.current.start();
    },
    [slideAnim, triggerHaptic]
  );

  const snapTo = useCallback(
    (snap: 'full' | 'expanded' | 'collapsed') => {
      if (snap === 'full') snapToPosition(SNAP_FULL);
      else if (snap === 'expanded') snapToPosition(SNAP_EXPANDED);
      else snapToPosition(SNAP_COLLAPSED);
    },
    [snapToPosition]
  );

  // iOS-grade PanResponder with instant 1:1 touch tracking and physics-based snapping
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        // Claim the gesture on vertical drag with clean directional bias
        onMoveShouldSetPanResponder: (_evt, gestureState) => {
          return (
            Math.abs(gestureState.dy) > 3 &&
            Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.2
          );
        },
        onMoveShouldSetPanResponderCapture: (_evt, gestureState) => {
          return (
            Math.abs(gestureState.dy) > 4 &&
            Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.2
          );
        },
        onPanResponderGrant: () => {
          if (animRef.current) {
            animRef.current.stop();
          }
          slideAnim.stopAnimation((val) => {
            dragStartPos.current =
              typeof val === 'number' ? val : currentSlideVal.current;
          });
        },
        onPanResponderMove: (_evt, gestureState) => {
          const targetPos = dragStartPos.current + gestureState.dy;
          if (targetPos < SNAP_FULL) {
            // Gentle tactile rubber-band resistance when pulled above full screen
            const overdrag = SNAP_FULL - targetPos;
            const resistedPos = SNAP_FULL - Math.pow(overdrag, 0.72) * 1.5;
            slideAnim.setValue(resistedPos);
          } else {
            // Real-time 1:1 finger tracking
            slideAnim.setValue(targetPos);
          }
        },
        onPanResponderRelease: (_evt, gestureState) => {
          const currentVal = currentSlideVal.current;
          const vy = gestureState.vy;

          // 1. Fast downward flick or pulled past dismissal threshold -> Dismiss
          if (
            vy > 0.85 ||
            (currentVal > SNAP_COLLAPSED + 70 && vy > 0.2) ||
            currentVal > SCREEN_HEIGHT * 0.72
          ) {
            handleDismiss(vy);
            return;
          }

          // 2. Strong upward flick -> Full Screen
          if (vy < -0.85) {
            snapToPosition(SNAP_FULL, vy);
            return;
          }

          // 3. Moderate upward flick -> Expand or Full
          if (vy < -0.3) {
            if (dragStartPos.current >= SNAP_COLLAPSED - 40) {
              snapToPosition(SNAP_EXPANDED, vy);
            } else {
              snapToPosition(SNAP_FULL, vy);
            }
            return;
          }

          // 4. Moderate downward flick -> Step down snap
          if (vy > 0.3) {
            if (dragStartPos.current <= SNAP_EXPANDED + 40) {
              snapToPosition(SNAP_COLLAPSED, vy);
            } else {
              handleDismiss(vy);
            }
            return;
          }

          // 5. Positional release: Snap to nearest point
          const snapPoints = [SNAP_FULL, SNAP_EXPANDED, SNAP_COLLAPSED];
          let closest = snapPoints[0];
          let minDiff = Math.abs(currentVal - closest);
          for (let i = 1; i < snapPoints.length; i++) {
            const diff = Math.abs(currentVal - snapPoints[i]);
            if (diff < minDiff) {
              minDiff = diff;
              closest = snapPoints[i];
            }
          }
          snapToPosition(closest, vy);
        },
        onPanResponderTerminationRequest: () => false,
        onPanResponderTerminate: () => {
          snapToPosition(SNAP_COLLAPSED);
        },
      }),
    [slideAnim, handleDismiss, snapToPosition]
  );

  useEffect(() => {
    if (animRef.current) {
      animRef.current.stop();
    }

    if (visible) {
      isDismissing.current = false;
      setMounted(true);
      slideAnim.setValue(SNAP_DISMISSED);

      const targetInitial =
        initialSnap === 'full'
          ? SNAP_FULL
          : initialSnap === 'expanded'
          ? SNAP_EXPANDED
          : SNAP_COLLAPSED;

      animRef.current = Animated.spring(slideAnim, {
        toValue: targetInitial,
        damping: 24,
        mass: 0.85,
        stiffness: 280,
        useNativeDriver: true,
      });
      animRef.current.start();
    } else if (mounted && !isDismissing.current) {
      isDismissing.current = true;
      animRef.current = Animated.timing(slideAnim, {
        toValue: SNAP_DISMISSED,
        duration: 210,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
        useNativeDriver: true,
      });
      animRef.current.start(({ finished }) => {
        isDismissing.current = false;
        if (finished) {
          setMounted(false);
        }
      });
    }

    return () => {
      if (animRef.current) {
        animRef.current.stop();
      }
    };
  }, [visible, slideAnim, mounted, initialSnap]);

  if (!mounted && !visible) {
    return null;
  }

  const renderedContent = children || lastChildrenRef.current;

  // Real-time backdrop opacity smoothly interpolated with sheet slide position
  const backdropOpacity = slideAnim.interpolate({
    inputRange: [SNAP_FULL, SNAP_EXPANDED, SNAP_COLLAPSED, SNAP_DISMISSED],
    outputRange: [0.60, 0.48, 0.38, 0],
    extrapolate: 'clamp',
  });

  return (
    <Modal
      visible={mounted}
      animationType="none"
      transparent
      onRequestClose={() => handleDismiss()}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        {/* Stationary Backdrop Catching Clicks on Blank Space */}
        <TouchableWithoutFeedback onPress={() => handleDismiss()}>
          <Animated.View
            style={[
              styles.bottomSheetBackdrop,
              {
                backgroundColor: backdropColor,
                opacity: backdropOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Native Interactive Draggable Bottom Sheet Container */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.sheetContainer,
            contentContainerStyle,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {typeof renderedContent === 'function'
            ? renderedContent({ close: () => handleDismiss(), snapTo })
            : renderedContent}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  bottomSheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT + 120, // Extends beyond screen bottom so no void is exposed during upward drags
    zIndex: 10,
  },
});

export default PoppedBottomSheetModal;
