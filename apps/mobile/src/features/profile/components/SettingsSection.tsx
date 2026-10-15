import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight, Globe, Moon } from 'lucide-react-native';
import { languageLabel } from '../../../shared/ui/LanguageToggle';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { SectionHeader } from '../../../shared/ui/SectionHeader';
import { Hairline, Surface } from '../../../shared/ui/Surface';
import { Toggle } from '../../../shared/ui/Toggle';
import { Txt } from '../../../shared/ui/Txt';
import { controlHeight, space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';

/** Language and theme settings. */
export function SettingsSection({ onOpenLanguage }: { onOpenLanguage: () => void }) {
  const { colors, mode, toggleTheme } = useThemeStore();
  const { t, language } = useTranslation();
  return (
    <View>
      <SectionHeader title={t('settings')} />
      <Surface>
        <Pressable
          accessibilityRole="button"
          onPress={onOpenLanguage}
          style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.raised }]}
        >
          <Globe size={18} color={colors.textMuted} />
          <Txt variant="bodyMedium" style={styles.flex}>
            {t('languageLabel')}
          </Txt>
          <Txt variant="small" color={colors.textSecondary}>
            {languageLabel(language)}
          </Txt>
          <Mirrored>
            <ChevronRight size={18} color={colors.textMuted} />
          </Mirrored>
        </Pressable>
        <Hairline />
        <View style={styles.row}>
          <Moon size={18} color={colors.textMuted} />
          <Txt variant="bodyMedium" style={styles.flex}>
            {t('darkTheme')}
          </Txt>
          <Toggle accessibilityLabel={t('darkTheme')} value={mode === 'dark'} onValueChange={toggleTheme} />
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: {
    minHeight: controlHeight + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
  },
});
