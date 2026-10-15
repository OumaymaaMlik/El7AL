/** Colors of the notification center sheet, for the light and dark themes. */
export function notificationPalette(isDark: boolean) {
  return {
    sheetBg: isDark ? '#101B14' : '#F3F5F1',
    cardBg: isDark ? '#16241B' : '#FFFFFF',
    cardBorder: isDark ? '#263B2E' : '#E1E7DF',
    hairline: isDark ? '#203327' : '#E8ECE6',
    textTitle: isDark ? '#F2F6F2' : '#0E1F16',
    textSub: isDark ? '#D1DCD5' : '#34453A',
    textMuted: isDark ? '#8FA094' : '#5F6B63',
    unreadItemBg: isDark ? '#1B3224' : '#F3FAE3',
    greenBrand: isDark ? '#10B981' : '#0F5B3A',
    unreadGreen: isDark ? '#4ADE80' : '#17803A',
    redDanger: isDark ? '#EF4444' : '#B3261E',
    handle: isDark ? '#263B2E' : '#C9D2C8',
    closeBorder: isDark ? '#263B2E' : '#DCE3DB',
    confirmBg: isDark ? '#2A1717' : '#FEE2E2',
    emptyIconBg: isDark ? '#16241B' : '#E8ECE6',
  };
}

export type NotificationPalette = ReturnType<typeof notificationPalette>;
