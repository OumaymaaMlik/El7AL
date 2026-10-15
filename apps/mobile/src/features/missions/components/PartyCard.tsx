import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { Avatar } from '../../../shared/ui/Avatar';
import { Hairline, Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';

interface Props {
  name: string;
  avatarUrl?: string | null;
  isProvider: boolean;
  rating: number | null;
  description?: string | null;
}

/** The other party in the mission, and the original request. */
export function PartyCard({ name, avatarUrl, isProvider, rating, description }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  return (
    <Surface>
      <View style={styles.row}>
        <Avatar uri={avatarUrl} name={name} size={44} />
        <View style={styles.flex}>
          <Txt variant="bodyStrong" numberOfLines={1}>
            {name}
          </Txt>
          <Txt variant="small" color={colors.textMuted} numberOfLines={1}>
            {isProvider ? t('clientApplicant') : t('qualifiedAssigned')}
          </Txt>
        </View>
        {rating !== null && rating > 0 && (
          <View style={styles.inline}>
            <Star size={14} color={colors.star} fill={colors.star} />
            <Txt variant="smallStrong">{rating.toFixed(1)}</Txt>
          </View>
        )}
      </View>
      {Boolean(description) && (
        <>
          <Hairline />
          <View style={styles.padded}>
            <Txt variant="caption" color={colors.textMuted}>
              {t('needDescriptionLabel')}
            </Txt>
            <Txt variant="body">{description}</Txt>
          </View>
        </>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: 14 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  padded: { padding: space.lg, gap: space.xs },
});
