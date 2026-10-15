import React, { useState } from 'react';
import { Pressable, StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { Globe } from 'lucide-react-native';
import { useLanguageStore, useTranslation } from '../store/useLanguageStore';
import { useNotificationStore } from '../../features/notifications/store/useNotificationStore';
import { useThemeStore } from '../store/useThemeStore';
import { Language } from '../i18n/translations';
import { controlHeight, hitTarget, radius, space } from '../theme/tokens';
import { BottomSheet } from './BottomSheet';
import { Surface, Hairline } from './Surface';
import { Txt } from './Txt';

/** Each language is named in its own language, so it can be found by anyone. */
export const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'fr', label: 'Français' },
  { id: 'ar', label: 'العربية' },
  { id: 'en', label: 'English' },
];

export function languageLabel(id: Language): string {
  return LANGUAGES.find((l) => l.id === id)?.label || id;
}

interface LanguagePickerSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** The language list, as a bottom sheet. Used from Welcome and from Profile. */
export function LanguagePickerSheet({ visible, onClose }: LanguagePickerSheetProps) {
  const { language, setLanguage } = useLanguageStore();
  const colors = useThemeStore((state) => state.colors);
  const flashToast = useNotificationStore((state) => state.flashToast);
  const { t } = useTranslation();

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    onClose();
    // On phones, switching to or from Arabic mirrors the layout at the next start.
    if (useLanguageStore.getState().needsRestart) {
      flashToast({ title: t('restartForDirection') });
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('chooseLanguage')}>
      <Surface accessibilityRole="radiogroup">
        {LANGUAGES.map(({ id, label }, index) => {
          const isSelected = language === id;
          return (
            <React.Fragment key={id}>
              {index > 0 && <Hairline />}
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                onPress={() => handleSelect(id)}
                style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.raised }]}
              >
                <Txt variant={isSelected ? 'bodyStrong' : 'body'} style={styles.flex}>
                  {label}
                </Txt>
                <View style={[styles.radio, { borderColor: isSelected ? colors.accentText : colors.inputBorder }]}>
                  {isSelected && <View style={[styles.radioDot, { backgroundColor: colors.accentText }]} />}
                </View>
              </Pressable>
            </React.Fragment>
          );
        })}
      </Surface>
    </BottomSheet>
  );
}

interface LanguageToggleProps {
  style?: StyleProp<ViewStyle>;
  /** Use on the brand-green background (the Welcome screen). */
  forceWhite?: boolean;
}

/** A compact language button for screens shown before sign-in. */
export function LanguageToggle({ style, forceWhite }: LanguageToggleProps) {
  const [open, setOpen] = useState(false);
  const language = useLanguageStore((state) => state.language);
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();

  const foreground = forceWhite ? colors.onBrand : colors.text;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t('languageLabel')}: ${languageLabel(language)}`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.button,
          forceWhite
            ? { borderColor: 'rgba(255, 255, 255, 0.35)' }
            : { borderColor: colors.border, backgroundColor: colors.surface },
          pressed && { opacity: 0.7 },
          style,
        ]}
      >
        <Globe size={16} color={foreground} />
        <Txt variant="smallStrong" color={foreground}>
          {languageLabel(language)}
        </Txt>
      </Pressable>

      <LanguagePickerSheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  button: {
    minHeight: hitTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  row: {
    minHeight: controlHeight + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
