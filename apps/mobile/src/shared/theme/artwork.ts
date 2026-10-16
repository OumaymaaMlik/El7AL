/**
 * Colours of the El 7al illustration (the spinning 7 over green waves) and of the pixel background.
 * They are fixed: the artwork looks the same in both themes, so they are not theme roles.
 */
export const artwork = {
  hill: '#178A4A',
  ring: '#2DB35F',
  ripple: '#4FD07E',
  shadow: '#062E1C',
  sevenBack: '#B6E844',
  sevenSide: '#7DB51F',
  sevenFront: '#CCF65A',
  sevenTop: '#E4FF8F',
  /** Small caps label on the green hero panel. */
  tag: '#B5F04A',
} as const;

/** Squares of the pixel background, by theme. */
export const pixelPalette = {
  dark: ['#173A28', '#24461C', '#1B3326', '#2A4A21', '#16402C'],
  light: ['#CFE5D3', '#C6E7A4', '#BBDCC8', '#DDEFC2', '#B7D9C0'],
} as const;
