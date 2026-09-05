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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface PoppedBottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode | ((helpers: { close: () => void }) => React.ReactNode);
  backdropColor?: string;
  overlayStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const PoppedBottomSheetModal: React.FC<PoppedBottomSheetModalProps> = ({
  visible,
  onClose,
  children,
  backdropColor = 'rgba(15, 23, 42, 0.40)',
  overlayStyle,
  contentContainerStyle,
}) => {
  const [mounted, setMounted] = useState(visible);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const isDismissing = useRef(false);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Preserve the last non-null children in a ref so exiting animation has full content without extra state renders
  const lastChildrenRef = useRef(children);
  if (children) {
    lastChildrenRef.current = children;
  }

  // Smooth dismiss helper with Apple slide-down easing
  const handleDismiss = useCallback(() => {
    if (isDismissing.current) return;
    isDismissing.current = true;
    if (animRef.current) {
      animRef.current.stop();
    }
    animRef.current = Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      easing: Easing.bezier(0.32, 1, 0.23, 1),
      useNativeDriver: true,
    });
    animRef.current.start(({ finished }) => {
      isDismissing.current = false;
      if (finished) {
        setMounted(false);
        onCloseRef.current();
      }
    });
  }, [slideAnim]);

  // Apple-grade interactive slide drag-to-dismiss gesture responder
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        // Immediately capture downward dragging (> 1px) in capture phase before child views
        onMoveShouldSetPanResponder: (_evt, gestureState) => {
          return gestureState.dy > 1 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
        },
        onMoveShouldSetPanResponderCapture: (_evt, gestureState) => {
          return gestureState.dy > 1 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
        },
        onPanResponderGrant: () => {
          if (animRef.current) {
            animRef.current.stop();
          }
          slideAnim.stopAnimation();
        },
        onPanResponderMove: (_evt, gestureState) => {
          if (gestureState.dy > 0) {
            // Real-time 1:1 downward dragging / sliding
            slideAnim.setValue(gestureState.dy);
          } else {
            // Tactile rubber-band upward resistance
            slideAnim.setValue(gestureState.dy * 0.15);
          }
        },
        onPanResponderRelease: (_evt, gestureState) => {
          // Effortless dismiss threshold: dragged down > 60px OR flicked down with velocity (> 0.25)
          const isDismissGesture =
            gestureState.dy > 60 || (gestureState.vy > 0.25 && gestureState.dy > 15);

          if (isDismissGesture) {
            isDismissing.current = true;
            Animated.timing(slideAnim, {
              toValue: SCREEN_HEIGHT,
              duration: 190,
              easing: Easing.bezier(0.32, 1, 0.23, 1),
              useNativeDriver: true,
            }).start(({ finished }) => {
              isDismissing.current = false;
              if (finished) {
                setMounted(false);
                onCloseRef.current();
              }
            });
          } else {
            Animated.spring(slideAnim, {
              toValue: 0,
              damping: 24,
              mass: 0.85,
              stiffness: 280,
              useNativeDriver: true,
            }).start();
          }
        },
        onPanResponderTerminationRequest: () => false,
        onPanResponderTerminate: () => {
          Animated.spring(slideAnim, {
            toValue: 0,
            damping: 24,
            mass: 0.85,
            stiffness: 280,
            useNativeDriver: true,
          }).start();
        },
      }),
    [slideAnim]
  );

  useEffect(() => {
    if (animRef.current) {
      animRef.current.stop();
    }

    if (visible) {
      isDismissing.current = false;
      setMounted(true);
      slideAnim.setValue(SCREEN_HEIGHT);

      animRef.current = Animated.spring(slideAnim, {
        toValue: 0,
        damping: 24,
        mass: 0.85,
        stiffness: 280,
        useNativeDriver: true,
      });
      animRef.current.start();
    } else if (mounted && !isDismissing.current) {
      // Smooth exit animation down to full SCREEN_HEIGHT
      isDismissing.current = true;
      animRef.current = Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 210,
        easing: Easing.bezier(0.32, 1, 0.23, 1),
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
  }, [visible, slideAnim, mounted]);

  if (!mounted && !visible) {
    return null;
  }

  const renderedContent = children || lastChildrenRef.current;

  // Realtime backdrop opacity smoothly interpolated with sheet slide position
  const backdropOpacity = slideAnim.interpolate({
    inputRange: [0, SCREEN_HEIGHT * 0.6, SCREEN_HEIGHT],
    outputRange: [1, 0.2, 0],
    extrapolate: 'clamp',
  });

  return (
    <Modal
      visible={mounted}
      animationType="none"
      transparent
      onRequestClose={handleDismiss}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        {/* Stationary Backdrop Catching Clicks on Blank Space */}
        <TouchableWithoutFeedback onPress={handleDismiss}>
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

        {/* Floating Bottom Sheet Container */}
        <View style={[styles.bottomSheetOverlay, overlayStyle]} pointerEvents="box-none">
          {/* Floating Interactive Sheet Card with Pan Gesture */}
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.cardWrapper,
              contentContainerStyle,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {typeof renderedContent === 'function'
              ? renderedContent({ close: handleDismiss })
              : renderedContent}
          </Animated.View>
        </View>
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
  bottomSheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  cardWrapper: {
    width: '100%',
  },
});

export default PoppedBottomSheetModal;
