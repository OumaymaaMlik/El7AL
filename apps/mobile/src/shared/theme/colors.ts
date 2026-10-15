/**
 * El 7al design tokens: colour roles.
 *
 * Use the ROLE names (background, surface, border, text, brand, action, ...) in new code.
 * The LEGACY names at the bottom of each palette are kept so that screens that have not
 * been migrated yet keep working. They map onto the same palette.
 *
 * Rules of use:
 *  - `brand` is the one deep-green surface per screen (hero panels).
 *  - `action` (lime) is a FILL for the single primary action and for live status. It is
 *    never used as text on a light background. For green text or icons use `accentText`,
 *    which is lime in dark mode and brand green in light mode.
 *  - Every text/background pair below passes WCAG AA (4.5:1) for body text.
 */
export const DarkColors = {
  // Surfaces
  background: '#0B1410',
  surface: '#131E18',
  raised: '#1B2921',
  border: '#26362D',
  overlay: 'rgba(4, 9, 7, 0.72)',

  // Text
  text: '#F2F6F2',
  textSecondary: '#B4C2B8',
  textMuted: '#8FA094',

  // Brand surface (same in both themes)
  brand: '#0D5C3A',
  brandInset: '#084229',
  onBrand: '#FFFFFF',
  onBrandMuted: '#CFE6D8',
  onBrandFaint: '#B9D4C6',
  onBrandLine: 'rgba(255, 255, 255, 0.18)',

  // Primary action / live status
  action: '#A3E635',
  onAction: '#052E16',
  accentText: '#A3E635',

  // Status
  star: '#F2B544',
  danger: '#EF4444',
  dangerText: '#FF8A80',
  dangerSoft: 'rgba(239, 68, 68, 0.16)',

  // Legacy names (screens not yet migrated)
  surfaceBorder: '#26362D',
  card: '#131E18',
  cardBorder: '#26362D',
  muted: '#1B2921',
  mutedForeground: '#8FA094',
  primary: '#0D5C3A',
  primaryForeground: '#FFFFFF',
  secondary: '#1B2921',
  secondaryForeground: '#F2F6F2',
  accent: '#A3E635',
  accentStrong: '#A3E635',
  accentForeground: '#052E16',
  destructive: '#EF4444',
  destructiveForeground: '#FFFFFF',
  warning: '#F2B544',
  warningForeground: '#451A03',
  info: '#60A5FA',
  inputBg: '#131E18',
  inputBorder: '#3A4D42',
  inputFocusBorder: '#A3E635',
  glassBg: '#131E18',
};

export const LightColors: typeof DarkColors = {
  // Surfaces
  background: '#F4F6F4',
  surface: '#FFFFFF',
  raised: '#E9EEEA',
  border: '#D3DCD5',
  overlay: 'rgba(15, 26, 20, 0.5)',

  // Text
  text: '#0F1A14',
  textSecondary: '#3D4B43',
  textMuted: '#56665C',

  // Brand surface
  brand: '#0D5C3A',
  brandInset: '#084229',
  onBrand: '#FFFFFF',
  onBrandMuted: '#CFE6D8',
  onBrandFaint: '#B9D4C6',
  onBrandLine: 'rgba(255, 255, 255, 0.18)',

  // Primary action / live status
  action: '#A3E635',
  onAction: '#052E16',
  accentText: '#0D5C3A',

  // Status
  star: '#D97706',
  danger: '#DC2626',
  dangerText: '#B42318',
  dangerSoft: 'rgba(220, 38, 38, 0.1)',

  // Legacy names (screens not yet migrated)
  surfaceBorder: '#D3DCD5',
  card: '#FFFFFF',
  cardBorder: '#D3DCD5',
  muted: '#E9EEEA',
  mutedForeground: '#56665C',
  primary: '#0D5C3A',
  primaryForeground: '#FFFFFF',
  secondary: '#E9EEEA',
  secondaryForeground: '#0F1A14',
  accent: '#A3E635',
  accentStrong: '#0D5C3A',
  accentForeground: '#052E16',
  destructive: '#DC2626',
  destructiveForeground: '#FFFFFF',
  warning: '#B45309',
  warningForeground: '#FFFFFF',
  info: '#2563EB',
  inputBg: '#FFFFFF',
  inputBorder: '#B8C4BB',
  inputFocusBorder: '#0D5C3A',
  glassBg: '#FFFFFF',
};

export type ThemeColors = typeof DarkColors;

export const Colors = DarkColors;

/**
 * Elevation. The interface is flat by default: surfaces are separated by a 1px border,
 * not by shadows. `soft` is kept for floating elements (sheets, the floating action).
 * `glow` is kept for backwards compatibility and is intentionally neutral.
 */
export const Shadows = {
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  glow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};
