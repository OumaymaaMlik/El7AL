import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin } from 'lucide-react-native';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { wordmarkFont } from '../../../shared/theme/typography';
import { gutter, radius, space } from '../../../shared/theme/tokens';
import { NotificationBellButton } from '../../notifications/components/NotificationBellButton';
import { MarqueeText } from '../../../shared/ui/MarqueeText';
import { Txt } from '../../../shared/ui/Txt';

interface HomeHeaderProps {
  /** Artisan accounts show a "Pro" tag instead of the location. */
  isProvider: boolean;
  /** The client's current address label. Informational, not a control. */
  locationText: string;
}

export function HomeHeader({ isProvider, locationText }: HomeHeaderProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
      <Text accessibilityRole="header" accessibilityLabel="El 7al" style={[styles.wordmark, { color: colors.text }]}>
        El <Text style={{ color: colors.accentText }}>7</Text>al
      </Text>

      {isProvider ? (
        <View style={[styles.proTag, { borderColor: colors.border }]}>
          <Txt variant="overline" color={colors.accentText}>
            {t('proTag')}
          </Txt>
        </View>
      ) : (
        <View style={styles.location}>
          <MapPin size={16} color={colors.accentText} />
          <MarqueeText variant="smallStrong" color={colors.textSecondary}>
            {locationText}
          </MarqueeText>
        </View>
      )}

      {isProvider && <View style={styles.spacer} />}
      <NotificationBellButton />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: gutter,
    paddingBottom: space.md,
  },
  wordmark: {
    flexShrink: 0,
    fontFamily: wordmarkFont,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.3,
  },
  proTag: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  spacer: {
    flex: 1,
  },
  // Takes all the room between the logo and the bell; a long address scrolls inside it.
  location: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
});
