import { Pressable, StyleSheet, View } from 'react-native';
import { Avatar } from '../../../shared/ui/Avatar';
import { Txt } from '../../../shared/ui/Txt';
import { numeralFont } from '../../../shared/theme/typography';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';

interface Props {
  name?: string | null;
  phone?: string | null;
  roleLabel: string;
  avatarUrl: string;
  avatarFailed: boolean;
  onAvatarError: () => void;
  onAvatarPress: () => void;
  onEdit: () => void;
  /** The artisan's figures, shown as tiles inside the card: [value, label]. */
  stats?: [string, string][];
}

/** The green identity card: the photo, the name, the number (and the role), and the "Modifier" chip. */
export function ProfileIdentity({
  name,
  phone,
  roleLabel,
  avatarUrl,
  avatarFailed,
  onAvatarError,
  onAvatarPress,
  onEdit,
  stats,
}: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  return (
    <View style={[styles.card, { backgroundColor: colors.hero }]}>
      <View style={styles.top}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('viewPhoto')}
          onPress={onAvatarPress}
          style={({ pressed }) => [pressed && { opacity: 0.8 }]}
        >
          <Avatar
            uri={avatarUrl}
            name={name}
            size={60}
            failed={avatarFailed}
            onError={onAvatarError}
            tint={{ background: colors.live, color: colors.onLive }}
          />
        </Pressable>

        <View style={styles.flex}>
          <Txt variant="heading" color={colors.onBrand} numberOfLines={1} style={styles.name}>
            {name || t('notProvided')}
          </Txt>
          <Txt variant="small" color={colors.onBrandMuted} numberOfLines={1}>
            {[phone || t('notProvided'), roleLabel].join(' · ')}
          </Txt>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('editProfile')}
          onPress={onEdit}
          style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}
        >
          <Txt variant="smallStrong" color="#fff">
            {t('edit')}
          </Txt>
        </Pressable>
      </View>

      {stats && stats.length > 0 && (
        <View style={styles.tiles}>
          {stats.map(([value, label]) => (
            <View key={label} style={styles.tile}>
              <Txt style={[styles.tileValue, { color: colors.onBrand }]} numberOfLines={1}>
                {value}
              </Txt>
              <Txt variant="caption" color={colors.onBrandMuted} numberOfLines={1}>
                {label}
              </Txt>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  card: { gap: 14, padding: 16, borderRadius: 24 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  tiles: { flexDirection: 'row', gap: 8 },
  tile: {
    flex: 1,
    minWidth: 0,
    gap: 2,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tileValue: { fontFamily: numeralFont, fontSize: 20, lineHeight: 24 },
  name: { fontFamily: numeralFont, fontSize: 22, lineHeight: 26 },
  chip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
});
