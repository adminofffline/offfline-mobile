import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';

export interface OffflineBrandWordmarkProps {
  pageTitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right';
  theme?: 'light' | 'dark';
  style?: StyleProp<ViewStyle>;
  pageTitleStyle?: StyleProp<TextStyle>;
}

export const OffflineBrandWordmark: React.FC<OffflineBrandWordmarkProps> = ({
  pageTitle,
  size = 'md',
  align = 'left',
  theme = 'light',
  style,
  pageTitleStyle,
}) => {
  const isDark = theme === 'dark';

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          main: styles.mainSm,
          tld: styles.tldSm,
          pageTitle: styles.pageTitleSm,
        };
      case 'lg':
        return {
          main: styles.mainLg,
          tld: styles.tldLg,
          pageTitle: styles.pageTitleLg,
        };
      case 'xl':
        return {
          main: styles.mainXl,
          tld: styles.tldXl,
          pageTitle: styles.pageTitleXl,
        };
      case 'md':
      default:
        return {
          main: styles.mainMd,
          tld: styles.tldMd,
          pageTitle: styles.pageTitleMd,
        };
    }
  };

  const s = getSizeStyles();

  return (
    <View
      style={[
        styles.container,
        align === 'center' && styles.alignCenter,
        align === 'right' && styles.alignRight,
        style,
      ]}
    >
      <View style={styles.wordmarkRow}>
        <Text
          style={[
            styles.wordmarkMain,
            s.main,
            isDark && styles.wordmarkMainDark,
          ]}
        >
          offfline
        </Text>
        <Text style={[styles.wordmarkTld, s.tld]}>.in</Text>
      </View>
      {pageTitle ? (
        <Text
          style={[
            styles.pageTitle,
            s.pageTitle,
            isDark && styles.pageTitleDark,
            pageTitleStyle,
          ]}
          numberOfLines={1}
        >
          {pageTitle}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordmarkMain: {
    fontWeight: '900',
    color: '#0F172A',
    includeFontPadding: false,
  },
  wordmarkMainDark: {
    color: '#FFFFFF',
  },
  wordmarkTld: {
    fontWeight: '800',
    color: '#C5A880', // Signature Offfline Gold/Tan Accent
    includeFontPadding: false,
  },
  pageTitle: {
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 2,
    includeFontPadding: false,
  },
  pageTitleDark: {
    color: '#94A3B8',
  },
  // Sizes
  mainSm: {
    fontSize: 15,
    letterSpacing: -0.4,
  },
  tldSm: {
    fontSize: 15,
    letterSpacing: -0.2,
  },
  pageTitleSm: {
    fontSize: 9,
    marginTop: 1,
  },
  mainMd: {
    fontSize: 19,
    letterSpacing: -0.5,
  },
  tldMd: {
    fontSize: 19,
    letterSpacing: -0.3,
  },
  pageTitleMd: {
    fontSize: 10,
    marginTop: 1.5,
  },
  mainLg: {
    fontSize: 23,
    letterSpacing: -0.7,
  },
  tldLg: {
    fontSize: 23,
    letterSpacing: -0.35,
  },
  pageTitleLg: {
    fontSize: 11.5,
    marginTop: 2,
  },
  mainXl: {
    fontSize: 28,
    letterSpacing: -0.9,
  },
  tldXl: {
    fontSize: 28,
    letterSpacing: -0.45,
  },
  pageTitleXl: {
    fontSize: 13,
    marginTop: 3,
  },
});

export default OffflineBrandWordmark;
