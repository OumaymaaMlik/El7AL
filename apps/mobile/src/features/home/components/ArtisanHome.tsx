import { Pressable, View } from 'react-native';
import { Avatar } from '../../../shared/ui/Avatar';
import { Toggle } from '../../../shared/ui/Toggle';
import { Txt } from '../../../shared/ui/Txt';
import { LiveDot } from '../../../shared/ui/LiveDot';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useAuthStore } from '../../auth';
import { styles } from './ArtisanHome.styles';
import { useTopPad } from '../../../shared/theme/useTopPad';

export interface ArtisanStatsData {
  /** Number of completed missions, or null while it is not known. */
  completedCount: number | null;
  ratingAverage: number | null;
  totalRatings: number | null;
  walletBalance: number | null;
}

/** The trade of the artisan, as written on their profile (an artisan has exactly one). */
function tradeOf(user: ReturnType<typeof useAuthStore.getState>['user']): string | null {
  const list = user?.providerProfile?.categories as { category?: { name?: string }; name?: string }[] | undefined;
  return list?.[0]?.category?.name ?? list?.[0]?.name ?? null;
}

function shortName(full?: string | null): string {
  const parts = (full ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] ?? '';
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

interface HeaderProps {
  stats: ArtisanStatsData;
  /** The artisan's single trade, from their loaded profile. */
  trade?: string | null;
  available: boolean;
  onToggleAvailability: (value: boolean) => void;
}

/**
 * The artisan's header, as in the prototype: the brand-green block with rounded bottom corners, who they are,
 * the online switch, and two figures (missions, rating).
 */
export function ArtisanHeader({ stats, trade, available, onToggleAvailability }: HeaderProps) {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  const topPad = useTopPad();
  const user = useAuthStore((s) => s.user);
  const paused = user?.status === 'SUSPENDED_LOW_BALANCE';
  const live = available && !paused;
  const status = paused ? t('artisanPaused') : live ? t('artisanOnline') : t('artisanOffline');

  const rating =
    stats.ratingAverage !== null && (stats.totalRatings ?? 0) > 0
      ? stats.ratingAverage.toFixed(1).replace('.', ',')
      : '—';
  const tiles: [string, string][] = [
    [String(stats.completedCount ?? 0), t('statMissions')],
    [rating, t('statRating')],
  ];

  return (
    <View style={[styles.header, { backgroundColor: colors.hero, paddingTop: topPad }]}>
      <View style={styles.top}>
        <View style={styles.who}>
          <Avatar
            uri={user?.avatarUrl as string | null | undefined}
            name={user?.fullName}
            size={44}
            tint={{ background: colors.live, color: '#0D5C3A' }}
          />
          <View style={styles.flex}>
            <Txt variant="small" color={colors.onBrandMuted} numberOfLines={1}>
              {trade ?? tradeOf(user) ?? t('provider')}
            </Txt>
            <Txt variant="bodyStrong" color={colors.onBrand} numberOfLines={1} style={styles.name}>
              {shortName(user?.fullName) || t('provider')}
            </Txt>
          </View>
        </View>

        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: live }}
          accessibilityLabel={t('availableForMissions')}
          onPress={() => onToggleAvailability(!available)}
          style={[styles.pill, { backgroundColor: live ? 'rgba(181,242,61,0.16)' : 'rgba(255,255,255,0.1)' }]}
        >
          {live && <LiveDot />}
          <Txt variant="smallStrong" color={live ? colors.live : colors.onBrandMuted}>
            {status}
          </Txt>
          <View pointerEvents="none">
            <Toggle
              value={live}
              onValueChange={() => undefined}
              accessibilityLabel={status}
              onBrand
              disabled={paused}
            />
          </View>
        </Pressable>
      </View>

      <View style={styles.tiles}>
        {tiles.map(([value, label]) => (
          <View key={label} style={styles.tile}>
            <Txt
              variant="heading"
              color={colors.onBrand}
              style={styles.tileValue}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {value}
            </Txt>
            <Txt variant="caption" color={colors.onBrandMuted} numberOfLines={1}>
              {label}
            </Txt>
          </View>
        ))}
      </View>
    </View>
  );
}
