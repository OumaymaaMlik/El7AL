import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Txt } from '../../../shared/ui/Txt';
import type { TranslationKeys } from '../../../shared/i18n/translations';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';

const STEPS: TranslationKeys[] = ['stepIdentity', 'stepTrade', 'stepDocuments'];

/** Shows where the artisan is in the three registration steps. */
export function RegisterStepper({ currentStep }: { currentStep: number }) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${t('stepOf').replace('{n}', String(currentStep)).replace('{total}', '3')}: ${t(STEPS[currentStep - 1])}`}
      accessibilityValue={{ min: 1, max: 3, now: currentStep }}
      style={styles.stepper}
    >
      {STEPS.map((key, index) => {
        const step = index + 1;
        const reached = step <= currentStep;
        const isCurrent = step === currentStep;
        return (
          <View key={key} style={styles.step}>
            <View
              style={[
                styles.bar,
                isCurrent && styles.barCurrent,
                { backgroundColor: reached ? colors.accentText : colors.border },
              ]}
            />
            <Txt
              variant={isCurrent ? 'captionStrong' : 'caption'}
              color={isCurrent ? colors.text : colors.textMuted}
              numberOfLines={1}
            >
              {step}. {t(key)}
            </Txt>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stepper: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  step: { flex: 1, gap: 6 },
  bar: { height: 4, borderRadius: 2 },
  barCurrent: { height: 8 },
});
