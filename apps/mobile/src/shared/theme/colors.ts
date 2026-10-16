/**
 * El 7al design tokens: colour roles.
 *
 * Use the ROLE names (background, surface, border, text, brand, action, ...) in new code.
 * The LEGACY names at the bottom of each palette are kept so that screens that have not
 * been migrated yet keep working. They map onto the same palette.
 *
 * Rules of use:
 *  - `brand` is the deep-green surface of hero panels and primary buttons (same in both themes).
 *  - `accentText` is brand green as TEXT or an icon: brand green in light mode, mint in dark mode.
 *  - `action` (lime) is a FILL for live status and the logo in dark mode. It is never text on a light background.
 *  - `pill` / `onPill` is the inverted button (near-black in light mode, near-white in dark mode).
 *  - Every text/background pair below passes WCAG AA (4.5:1) for body text.
 */
export const DarkColors = {
  // Surfaces
  background: '#0B120F',
  adminBackground: '#0B120F',
  surface: '#131D18',
  raised: '#1C2A23',
  soft: '#18241E',
  softer: '#0F1814',
  tint: '#1C2A23',
  chip: '#1E3A2A',
  selected: '#1D2E22',

  // Lines
  divider: '#22302A',
  border: '#2B3B33',
  borderStrong: '#3A4C42',
  overlay: 'rgba(0, 0, 0, 0.66)',
  shadow: 'rgba(0, 0, 0, 0.4)',

  // Text
  text: '#EEF3EC',
  textStrong: '#D6DED4',
  textSecondary: '#C3CEC1',
  textMuted: '#A3B0A2',

  // Brand surface (same in both themes)
  brand: '#0F5C3A',
  brandInset: '#0B4A2E',
  onBrand: '#FFFFFF',
  onBrandMuted: '#D5E7DB',
  onBrandFaint: '#B9D4C6',
  onBrandLine: 'rgba(255, 255, 255, 0.18)',

  // Brand as text, icons and the logo
  accentText: '#86D9A6',
  positive: '#5ED39A',
  logo: '#A3E635',

  // Primary action / live status
  action: '#A3E635',
  onAction: '#052E16',

  // Inverted button
  pill: '#EEF3EC',
  onPill: '#10140F',

  // Status
  star: '#F2B544',
  danger: '#EF4444',
  dangerText: '#F28B8B',
  dangerSoft: 'rgba(239, 68, 68, 0.16)',
  /** Fill of destructive buttons (white text on it passes AA in both themes). */
  dangerFill: '#B4232A',

  // Legacy names (screens not yet migrated)
  surfaceBorder: '#2B3B33',
  card: '#131D18',
  cardBorder: '#2B3B33',
  muted: '#1C2A23',
  mutedForeground: '#A3B0A2',
  primary: '#0F5C3A',
  primaryForeground: '#FFFFFF',
  secondary: '#1C2A23',
  secondaryForeground: '#EEF3EC',
  accent: '#A3E635',
  accentStrong: '#86D9A6',
  accentForeground: '#052E16',
  destructive: '#EF4444',
  destructiveForeground: '#FFFFFF',
  warning: '#F2B544',
  warningForeground: '#451A03',
  info: '#60A5FA',
  inputBg: '#131D18',
  inputBorder: '#3A4C42',
  inputFocusBorder: '#A3E635',
  glassBg: '#131D18',
};

export const LightColors: typeof DarkColors = {
  // Surfaces
  background: '#F2F4EE',
  adminBackground: '#E9EDE6',
  surface: '#FFFFFF',
  raised: '#E4EADF',
  soft: '#EEF2EA',
  softer: '#F7F9F4',
  tint: '#E4EADF',
  chip: '#D7EEDF',
  selected: '#F1F8E6',

  // Lines
  divider: '#E1E6DC',
  border: '#DCE2D6',
  borderStrong: '#CBD3C5',
  overlay: 'rgba(16, 20, 15, 0.5)',
  shadow: 'rgba(16, 20, 15, 0.12)',

  // Text
  text: '#10140F',
  textStrong: '#2A3328',
  textSecondary: '#3B463A',
  textMuted: '#556052',

  // Brand surface
  brand: '#0F5C3A',
  brandInset: '#0B4A2E',
  onBrand: '#FFFFFF',
  onBrandMuted: '#D5E7DB',
  onBrandFaint: '#B9D4C6',
  onBrandLine: 'rgba(255, 255, 255, 0.18)',

  // Brand as text, icons and the logo
  accentText: '#0F5C3A',
  positive: '#08744E',
  logo: '#0F5C3A',

  // Primary action / live status
  action: '#A3E635',
  onAction: '#052E16',

  // Inverted button
  pill: '#10140F',
  onPill: '#FFFFFF',

  // Status
  star: '#D97706',
  danger: '#DC2626',
  dangerText: '#B4232A',
  dangerSoft: 'rgba(220, 38, 38, 0.1)',
  dangerFill: '#B4232A',

  // Legacy names (screens not yet migrated)
  surfaceBorder: '#DCE2D6',
  card: '#FFFFFF',
  cardBorder: '#DCE2D6',
  muted: '#E4EADF',
  mutedForeground: '#556052',
  primary: '#0F5C3A',
  primaryForeground: '#FFFFFF',
  secondary: '#E4EADF',
  secondaryForeground: '#10140F',
  accent: '#A3E635',
  accentStrong: '#0F5C3A',
  accentForeground: '#052E16',
  destructive: '#DC2626',
  destructiveForeground: '#FFFFFF',
  warning: '#B45309',
  warningForeground: '#FFFFFF',
  info: '#2563EB',
  inputBg: '#FFFFFF',
  inputBorder: '#B8C4BB',
  inputFocusBorder: '#0F5C3A',
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
