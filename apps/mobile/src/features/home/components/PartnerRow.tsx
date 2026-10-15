import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { Avatar } from '../../../shared/ui/Avatar';
import { Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { space } from '../../../shared/theme/tokens';
import { toNumber } from '../../../shared/utils/format';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import type { PairedProvider } from '../../missions/types';

/** The person on the other side of the active mission. */
export function PartnerRow({ partner, isProviderRole }: { partner: PairedProvider; isProviderRole: boolean }) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const rating = toNumber(partner?.ratingAverage);

  return (
    <Surface style={styles.row}>
      <Avatar uri={partner.avatarUrl} name={partner.fullName} size={44} />
      <View style={styles.flex}>
        <Txt variant="bodyStrong" numberOfLines={1}>
          {partner.fullName}
        </Txt>
        <Txt variant="small" color={colors.textMuted} numberOfLines={1}>
          {isProviderRole ? t('clientApplicant') : t('qualifiedAssigned')}
        </Txt>
      </View>
      {rating !== null && rating > 0 && (
        <View style={styles.rating}>
          <Star size={14} color={colors.star} fill={colors.star} />
          <Txt variant="smallStrong">{rating.toFixed(1)}</Txt>
        </View>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: 14, marginTop: -space.sm },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
