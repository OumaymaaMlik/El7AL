import { StyleSheet } from 'react-native';
import { Globe, Moon } from 'lucide-react-native';
import { LanguageSegments } from '../../../shared/ui/LanguageToggle';
import { Hairline, Surface } from '../../../shared/ui/Surface';
import { Toggle } from '../../../shared/ui/Toggle';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { SettingRow } from './SettingRow';

/** Language and theme settings, as one card of rows. */
export function SettingsSection() {
  const { mode, toggleTheme } = useThemeStore();
  const { t } = useTranslation();
  return (
    <Surface>
      <SettingRow Icon={Globe} label={t('languageLabel')} right={<LanguageSegments />} />
      <Hairline style={styles.sep} />
      <SettingRow
        Icon={Moon}
        label={t('darkTheme')}
        right={<Toggle accessibilityLabel={t('darkTheme')} value={mode === 'dark'} onValueChange={toggleTheme} />}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  sep: { marginStart: 64 },
});
