import { Vibration, Platform } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const SoundService = {
  async playFeedback(type: 'SUCCESS' | 'DUPLICATE' | 'ERROR'): Promise<void> {
    try {
      if (type === 'SUCCESS') {
        ReactNativeHapticFeedback.trigger('notificationSuccess', hapticOptions);
      } else if (type === 'DUPLICATE') {
        ReactNativeHapticFeedback.trigger('notificationWarning', hapticOptions);
        Vibration.vibrate([0, 80, 50, 80]);
      } else {
        ReactNativeHapticFeedback.trigger('notificationError', hapticOptions);
        Vibration.vibrate(200);
      }
    } catch (e) {
      if (type === 'SUCCESS') Vibration.vibrate(60);
      else if (type === 'DUPLICATE') Vibration.vibrate([0, 80, 50, 80]);
      else Vibration.vibrate(200);
    }
  },

  async triggerImpact(): Promise<void> {
    try {
      ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
    } catch (e) {
      Vibration.vibrate(40);
    }
  },
};

export default SoundService;
