export const COLORS = {
  // Brand & Neutrals (offfline.in Palette)
  primary: '#111C24',           // Midnight Navy (Main Primary)
  primaryDark: '#0A141A',       // Deep Obsidian / Dark Elements
  white: '#FFFFFF',
  black: '#000000',
  background: '#FAF7F2',        // Soft Sandalwood / Clean Off-White
  cardBackground: '#FFFFFF',
  darkCardBackground: '#192A34',// Deep Slate (Cards / Sections)

  // offfline.in Signature Tokens
  brandNavy: '#111C24',         // Midnight Navy
  brandSand: '#D6B477',         // Warm Sand / Gold Accent
  brandGold: '#D6B477',         // Signature Gold
  brandIvory: '#F5F1E8',        // Soft Ivory
  brandGray: '#A8B0B3',         // Cool Gray
  brandSlate: '#192A34',        // Deep Slate
  brandBorder: '#30434D',       // Slate Border
  brandEmerald: '#056B4A',      // Luxury Emerald Green

  // Slate & Grayscale
  slate50: '#FAF7F2',
  slate100: '#F5F1E8',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#192A34',
  slate900: '#111C24',
  slate950: '#0A141A',

  // Plant Facility Theme (Luxury Emerald & Midnight Navy)
  plantAccent: '#056B4A',
  plantAccentDark: '#034D35',
  plantBg: '#ECF7F2',
  plantBorder: '#A7F3D0',
  plantText: '#044E35',

  // Distributor Hub Theme (Midnight Navy & Warm Sand)
  distributorAccent: '#111C24',
  distributorAccentDark: '#0A141A',
  distributorBg: '#FAF7F2',
  distributorBorder: '#E6D7C3',
  distributorText: '#111C24',
  distributorGold: '#D6B477',

  // Status & Telemetry
  success: '#056B4A',
  successBg: '#ECF7F2',
  successBorder: '#A7F3D0',
  successText: '#044E35',

  warning: '#D97706',
  warningBg: '#FFFBEB',
  warningBorder: '#FDE68A',
  warningText: '#B45309',

  error: '#EF4444',
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',
  errorText: '#B91C1C',

  info: '#0284C7',
  infoBg: '#F0F9FF',
  infoBorder: '#BAE6FD',
  infoText: '#0369A1',
  cyan: '#06B6D4',

  // Border & Dividers
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#30434D',
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
