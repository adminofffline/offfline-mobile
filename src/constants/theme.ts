export const COLORS = {
  // Brand & Neutrals
  primary: '#0F172A',
  primaryDark: '#0A0A0A',
  white: '#FFFFFF',
  black: '#000000',
  background: '#F8FAFC',
  cardBackground: '#FFFFFF',
  darkCardBackground: '#121212',

  // Slate & Grayscale
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
  slate950: '#020617',

  // Plant Theme (Cyan / Teal)
  plantAccent: '#0891B2',
  plantAccentDark: '#0E7490',
  plantBg: '#ECFEFF',
  plantBorder: '#A5F3FC',
  plantText: '#155E75',

  // Distributor Theme (Indigo / Purple)
  distributorAccent: '#4F46E5',
  distributorAccentDark: '#4338CA',
  distributorBg: '#EEF2FF',
  distributorBorder: '#C7D2FE',
  distributorText: '#3730A3',

  // Status & Alerts
  success: '#10B981',
  successBg: '#ECFDF5',
  successBorder: '#A7F3D0',
  successText: '#047857',

  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  warningBorder: '#FDE68A',
  warningText: '#B45309',

  error: '#EF4444',
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',
  errorText: '#B91C1C',

  info: '#3B82F6',
  infoBg: '#EFF6FF',
  infoBorder: '#BFDBFE',
  infoText: '#1D4ED8',
  cyan: '#06B6D4',

  // Border & Shadows
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#334155',
  divider: '#F1F5F9',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const TYPOGRAPHY = {
  xs: { fontSize: 10, lineHeight: 14 },
  sm: { fontSize: 12, lineHeight: 16 },
  base: { fontSize: 14, lineHeight: 20 },
  md: { fontSize: 16, lineHeight: 24 },
  lg: { fontSize: 18, lineHeight: 26 },
  xl: { fontSize: 20, lineHeight: 28 },
  xxl: { fontSize: 24, lineHeight: 32 },
  xxxl: { fontSize: 28, lineHeight: 36 },
};

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
};

export default { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS };
