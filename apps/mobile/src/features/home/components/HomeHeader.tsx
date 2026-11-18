import { StyleSheet, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { Avatar } from '../../../shared/ui/Avatar';
import { MarqueeText } from '../../../shared/ui/MarqueeText';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { gutter, space } from '../../../shared/theme/tokens';
import { useAuthStore } from '../../auth';
import { NotificationBellButton } from '../../notifications/components/NotificationBellButton';
import { useTopPad } from '../../../shared/theme/useTopPad';

interface HomeHeaderProps {
  /** The client's current address label. Informational, not a control. */
  locationText: string;
}

/** The client's top row: the avatar with "Bonjour" and the first name, the address chip and the bell. */
export function HomeHeader({ locationText }: HomeHeaderProps) {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  const topPad = useTopPad();
  const user = useAuthStore((s) => s.user);
  const firstName = user?.fullName?.trim().split(/\s+/)[0] ?? '';
  const street = locationText.split(',').pop()?.trim() || locationText;

  return (
    <View style={[styles.header, { paddingTop: topPad }]}>
      <View style={styles.who}>
        <Avatar
          uri={typeof user?.avatarUrl === 'string' ? user.avatarUrl : null}
          name={user?.fullName}
          size={42}
          tint={{ background: colors.brand, color: colors.live }}
        />
        <View style={styles.flex}>
          <Txt variant="small" color={colors.textMuted} numberOfLines={1}>
            {t('hello')}
          </Txt>
          <Txt variant="bodyStrong" numberOfLines={1} style={styles.name}>
            {firstName}
          </Txt>
        </View>
      </View>

      <View style={styles.actions}>
        {Boolean(locationText) && (
          <View style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MapPin size={14} color={colors.accentText} />
            <MarqueeText variant="smallStrong" color={colors.text}>
              {street}
            </MarqueeText>
          </View>
        )}
        <NotificationBellButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flexShrink: 1, minWidth: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    paddingHorizontal: gutter,
    paddingBottom: space.sm,
  },
  who: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1, minWidth: 0 },
  name: { fontSize: 16, lineHeight: 20 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1, minWidth: 0 },
  chip: {
    height: 44,
    maxWidth: 140,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    overflow: 'hidden',
  },
});
