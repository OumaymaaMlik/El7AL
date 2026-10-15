import React from 'react';
import { Mirrored } from './Mirrored';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useTranslation } from '../store/useLanguageStore';
import { gutter, space } from '../theme/tokens';
import { IconButton } from './IconButton';
import { NotificationBellButton } from '../../features/notifications/components/NotificationBellButton';
import { Txt } from './Txt';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Shows a back button on the leading side. */
  onBack?: () => void;
  /** Replaces the notification bell on the trailing side. Pass `null` for nothing. */
  trailing?: React.ReactNode | null;
}

/**
 * The one header pattern for every tab: a title, an optional subtitle, and the
 * notification bell. Language and theme settings live in Profile, not here.
 */
export function ScreenHeader({ title, subtitle, onBack, trailing }: ScreenHeaderProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
      {onBack && (
        <IconButton accessibilityLabel={t('back')} onPress={onBack}>
          <Mirrored>
            <ChevronLeft size={20} color={colors.text} />
          </Mirrored>
        </IconButton>
      )}
      <View style={styles.titles}>
        <Txt variant="title" accessibilityRole="header" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
          {title}
        </Txt>
        {Boolean(subtitle) && (
          <Txt variant="caption" color={colors.textMuted} numberOfLines={1}>
            {subtitle}
          </Txt>
        )}
      </View>
      {trailing === undefined ? <NotificationBellButton /> : trailing}
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
  titles: {
    flex: 1,
  },
});
