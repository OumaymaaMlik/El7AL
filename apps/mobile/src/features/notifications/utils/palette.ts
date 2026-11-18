/** Colors of the notification page, for the light and dark themes (the app's sand and night tokens). */
export function notificationPalette(isDark: boolean) {
  return {
    sheetBg: isDark ? '#06281B' : '#F2F4EE',
    cardBg: isDark ? '#131D18' : '#FFFFFF',
    cardBorder: isDark ? '#2B3B33' : '#DAE1D3',
    hairline: isDark ? '#22302A' : '#DAE1D3',
    textTitle: isDark ? '#EEF3EC' : '#0B1F16',
    textSub: isDark ? '#C3CEC1' : '#4E6358',
    textMuted: isDark ? '#A3B0A2' : '#4E6358',
    unreadItemBg: isDark ? '#16281F' : '#FFFFFF',
    greenBrand: isDark ? '#86D9A6' : '#0D5C3A',
    unreadGreen: isDark ? '#5ED39A' : '#0D5C3A',
    redDanger: isDark ? '#EF4444' : '#B4232A',
    handle: isDark ? '#2B3B33' : '#DAE1D3',
    closeBorder: isDark ? '#2B3B33' : '#DAE1D3',
    confirmBg: isDark ? '#2A1717' : '#FEE2E2',
    emptyIconBg: isDark ? '#1C2A23' : '#E8EEE1',
    tile: isDark ? '#1C2A23' : '#E8EEE1',
  };
}

export type NotificationPalette = ReturnType<typeof notificationPalette>;
