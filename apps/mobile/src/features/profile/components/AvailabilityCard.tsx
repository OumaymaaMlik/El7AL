import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SectionHeader } from '../../../shared/ui/SectionHeader';
import { Surface } from '../../../shared/ui/Surface';
import { Toggle } from '../../../shared/ui/Toggle';
import { Txt } from '../../../shared/ui/Txt';
import { space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';

interface Props {
  available: boolean;
  onChange: (value: boolean) => void;
}

export function AvailabilityCard({ available, onChange }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  return (
    <View>
      <SectionHeader title={t('availabilityOnline')} />
      <Surface style={styles.row}>
        <View style={styles.flex}>
          <Txt variant="bodyMedium">{available ? t('availableForMissions') : t('offline')}</Txt>
          <Txt variant="small" color={colors.textMuted}>
            {available ? t('receivingNearbyOffers') : t('goOnlineToReceive')}
          </Txt>
        </View>
        <Toggle accessibilityLabel={t('availableForMissions')} value={available} onValueChange={onChange} />
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg },
});
