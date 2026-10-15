import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { Input } from '../../../shared/ui/Input';
import { Txt } from '../../../shared/ui/Txt';
import { space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import type { RegisterWizard } from '../hooks/useRegisterWizard';
import { UploadBox } from './UploadBox';

/** Step 3 (providers): identity document number, photos and licence. */
export function DocumentsStep({ form }: { form: RegisterWizard }) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();

  return (
    <>
      <Input
        label={t('cinNumberLabel')}
        placeholder="08765432"
        keyboardType="number-pad"
        value={form.cinNumber}
        onChangeText={form.setCinNumber}
        icon={<ShieldCheck size={18} color={colors.textMuted} />}
      />

      <View style={styles.group}>
        <Txt variant="captionStrong" color={colors.textSecondary}>
          {t('cinPhotosLabel')}
        </Txt>
        <View style={styles.row}>
          <UploadBox label={t('cinFront')} uri={form.cinFrontUri} onPress={() => form.pickCin('front')} />
          <UploadBox label={t('cinBack')} uri={form.cinBackUri} onPress={() => form.pickCin('back')} />
        </View>
      </View>

      <Input
        label={t('licenseLabel')}
        placeholder="1234567/A"
        value={form.licenseNumber}
        onChangeText={form.setLicenseNumber}
      />
    </>
  );
}

const styles = StyleSheet.create({
  group: { gap: space.sm },
  row: { flexDirection: 'row', gap: space.md },
});
