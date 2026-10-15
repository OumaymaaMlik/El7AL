import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { PRIVACY_POLICY } from '@el7al/shared';
import { BottomSheet } from '../../../shared/ui/BottomSheet';
import { Txt } from '../../../shared/ui/Txt';
import { space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';

/** The privacy policy in the app's language. The text is the one the website shows (packages/shared). */
export function PrivacyPolicySheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  const { language } = useTranslation();
  const policy = PRIVACY_POLICY[language];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={policy.title} subtitle={policy.updated}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Txt variant="body" color={colors.textSecondary} style={styles.block}>
          {policy.intro}
        </Txt>
        {policy.sections.map((section) => (
          <View key={section.heading} style={styles.block}>
            <Txt variant="bodyStrong">{section.heading}</Txt>
            {section.paragraphs.map((text) => (
              <Txt key={text} variant="small" color={colors.textSecondary} style={styles.paragraph}>
                {text}
              </Txt>
            ))}
          </View>
        ))}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: { maxHeight: 460 },
  block: { marginBottom: space.lg },
  paragraph: { marginTop: space.sm },
});
