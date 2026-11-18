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
 *  - `action` (green #2BB673) is the FILL of every primary action: buttons, slide bars, send.
 *  - `live` (lime) marks what is happening now (online, en route, minutes). A fill, only on dark or brand surfaces, never text on a light background.
 *  - `pill` / `onPill` is the inverted button (near-black in light mode, near-white in dark mode).
 *  - Every text/background pair below passes WCAG AA (4.5:1) for body text.
 */
export const DarkColors = {
  // Surfaces
  background: '#06281B',
  adminBackground: '#06281B',
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
  brand: '#0D5C3A',
  brandInset: '#093F2A',
  /** Fill of the hero panel and headers: the brand green on a dark page, night green on the light page. */
  hero: '#0D5C3A',
  onBrand: '#FFFFFF',
  onBrandMuted: '#D5E7DB',
  onBrandFaint: '#B9D4C6',
  onBrandLine: 'rgba(255, 255, 255, 0.18)',

  // Brand as text, icons and the logo
  accentText: '#86D9A6',
  positive: '#5ED39A',
  logo: '#A3E635',

  // Primary action / live status
  action: '#2BB673',
  onAction: '#04170F',

  // Live status (online, en route, minutes). A fill on dark surfaces only.
  live: '#A3E635',
  onLive: '#12260A',

  // Inverted button
  pill: '#EEF3EC',
  onPill: '#10140F',

  // Status
  star: '#F2B544',
  danger: '#EF4444',
  dangerText: '#F28B8B',
  dangerSoft: 'rgba(239, 68, 68, 0.16)',
  /** A soft warning surface and its text (paused account, check pending). */
  warnSoft: 'rgba(242, 181, 68, 0.16)',
  warnText: '#F2B544',
  /** Fill of destructive buttons (white text on it passes AA in both themes). */
  dangerFill: '#B4232A',

  // Legacy names (screens not yet migrated)
  surfaceBorder: '#2B3B33',
  card: '#131D18',
  cardBorder: '#2B3B33',
  muted: '#1C2A23',
  mutedForeground: '#A3B0A2',
  primary: '#0D5C3A',
  primaryForeground: '#FFFFFF',
  secondary: '#1C2A23',
  secondaryForeground: '#EEF3EC',
  accent: '#2BB673',
  accentStrong: '#86D9A6',
  accentForeground: '#04170F',
  destructive: '#EF4444',
  destructiveForeground: '#FFFFFF',
  warning: '#F2B544',
  warningForeground: '#451A03',
  info: '#60A5FA',
  inputBg: '#131D18',
  inputBorder: '#3A4C42',
  inputFocusBorder: '#2BB673',
  glassBg: '#131D18',
};

export const LightColors: typeof DarkColors = {
  // Surfaces
  background: '#F2F4EE',
  adminBackground: '#E8EEE1',
  surface: '#FFFFFF',
  raised: '#E8EEE1',
  soft: '#ECF0E7',
  softer: '#F7F9F4',
  tint: '#E8EEE1',
  chip: '#DCEBE0',
  selected: '#E9F6EE',

  // Lines
  divider: '#DAE1D3',
  border: '#DAE1D3',
  borderStrong: '#C4CFBE',
  overlay: 'rgba(16, 20, 15, 0.5)',
  shadow: 'rgba(16, 20, 15, 0.12)',

  // Text
  text: '#0E2A1F',
  textStrong: '#1B2F25',
  textSecondary: '#33473B',
  textMuted: '#5E7066',

  // Brand surface
  brand: '#0D5C3A',
  brandInset: '#093F2A',
  hero: '#0D5C3A',
  onBrand: '#FFFFFF',
  onBrandMuted: '#D5E7DB',
  onBrandFaint: '#B9D4C6',
  onBrandLine: 'rgba(255, 255, 255, 0.18)',

  // Brand as text, icons and the logo
  accentText: '#0D5C3A',
  positive: '#08744E',
  logo: '#0D5C3A',

  // Primary action / live status
  action: '#2BB673',
  onAction: '#04170F',

  // Live status. On a light surface use it only inside a dark or brand container.
  live: '#A3E635',
  onLive: '#12260A',

  // Inverted button
  pill: '#0E2A1F',
  onPill: '#FFFFFF',

  // Status
  star: '#D97706',
  danger: '#DC2626',
  dangerText: '#B4232A',
  dangerSoft: 'rgba(220, 38, 38, 0.1)',
  dangerFill: '#B4232A',
  warnSoft: '#FDF0C8',
  warnText: '#8A4B05',

  // Legacy names (screens not yet migrated)
  surfaceBorder: '#DAE1D3',
  card: '#FFFFFF',
  cardBorder: '#DAE1D3',
  muted: '#E8EEE1',
  mutedForeground: '#5E7066',
  primary: '#0D5C3A',
  primaryForeground: '#FFFFFF',
  secondary: '#E8EEE1',
  secondaryForeground: '#0E2A1F',
  accent: '#2BB673',
  accentStrong: '#0D5C3A',
  accentForeground: '#04170F',
  destructive: '#DC2626',
  destructiveForeground: '#FFFFFF',
  warning: '#B45309',
  warningForeground: '#FFFFFF',
  info: '#2563EB',
  inputBg: '#FFFFFF',
  inputBorder: '#C4CFBE',
  inputFocusBorder: '#0D5C3A',
  glassBg: '#FFFFFF',
};

export const Colors = DarkColors;
