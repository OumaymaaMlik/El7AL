import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLanguageStore, useTranslation } from '../store/useLanguageStore';
import { useNotificationStore } from '../../features/notifications/store/useNotificationStore';
import { useThemeStore } from '../store/useThemeStore';
import { Language } from '../i18n/translations';
import { controlHeight, space } from '../theme/tokens';
import { BottomSheet } from './BottomSheet';
import { SegmentedControl } from './SegmentedControl';
import { Surface, Hairline } from './Surface';
import { Txt } from './Txt';

/** Each language is named in its own language, so it can be found by anyone. */
const LANGUAGES: { id: Language; label: string }[] = [
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

/** The language as three equal segments (FR, EN, عربي): one choice among a few, so a segmented control, not a switch. */
export function LanguageSegments() {
  const { language, setLanguage } = useLanguageStore();
  const flashToast = useNotificationStore((state) => state.flashToast);
  const { t } = useTranslation();
  const options: { key: Language; label: string }[] = [
    { key: 'fr', label: 'FR' },
    { key: 'en', label: 'EN' },
    { key: 'ar', label: 'عربي' },
  ];
  return (
    <SegmentedControl
      style={styles.segments}
      options={options}
      value={language}
      onChange={(lang) => {
        setLanguage(lang);
        if (useLanguageStore.getState().needsRestart) flashToast({ title: t('restartForDirection') });
      }}
    />
  );
}

const styles = StyleSheet.create({
  segments: { width: 186 },
  flex: {
    flex: 1,
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
