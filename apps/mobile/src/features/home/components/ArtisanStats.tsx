import React, { useState } from 'react';
import type { Mission } from '../../missions/schemas/mission.schema';
import { Image, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, ChevronRight, Star } from 'lucide-react-native';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useType } from '../../../shared/theme/useType';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { Txt } from '../../../shared/ui/Txt';
import { Hairline } from '../../../shared/ui/Surface';
import { capitalize, formatAmount, formatDate, initialsOf } from '../../../shared/utils/format';
import { styles } from './ArtisanStats.styles';

export interface ArtisanStatsData {
  /** Number of completed missions, or null while it is not known. */
  completedCount: number | null;
  ratingAverage: number | null;
  totalRatings: number | null;
  walletBalance: number | null;
}

interface StatLedgerProps {
  stats: ArtisanStatsData;
  onOpenHistory: () => void;
}

/**
 * 2x2 statistics grid matching the refined artisan space layout.
 */
export function StatLedger({ stats, onOpenHistory }: StatLedgerProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const type = useType();

  const hasRatings = (stats.totalRatings ?? 0) > 0 && stats.ratingAverage !== null;
  const ratingString = hasRatings ? stats.ratingAverage!.toFixed(1).replace('.', ',') : '5,0';
  const reviewsString =
    stats.totalRatings !== null && stats.totalRatings > 0
      ? t('reviewsCount').replace('{n}', String(stats.totalRatings))
      : hasRatings
        ? '1 avis'
        : t('noReviewsYet');

  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: type.heading.fontFamily }]}>
        {t('yourStats')}
      </Text>

      <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.gridRow}>
          {/* 1. Missions terminées */}
          <View
            style={[styles.statCell, styles.cellBorderRight, styles.cellBorderBottom, { borderColor: colors.border }]}
          >
            <Text style={[styles.cellLabel, { color: colors.textSecondary }]}>{t('completedMissions')}</Text>
            <Text style={[styles.cellValue, { color: colors.text }]}>
              {stats.completedCount === null ? '0' : String(stats.completedCount)}
            </Text>
          </View>

          {/* 2. Note globale */}
          <View style={[styles.statCell, styles.cellBorderBottom, { borderColor: colors.border }]}>
            <Text style={[styles.cellLabel, { color: colors.textSecondary }]}>{t('globalRating')}</Text>
            <View style={styles.ratingValueRow}>
              <Text style={[styles.cellValue, { color: colors.text }]}>{ratingString}</Text>
              <Star size={22} color="#F5A623" fill="#F5A623" stroke="#F5A623" />
            </View>
            <Text style={[styles.cellHint, { color: colors.textSecondary }]}>{reviewsString}</Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          {/* 3. Solde disponible */}
          <View
            style={[styles.statCell, styles.cellBorderRight, styles.cellBorderBottom, { borderColor: colors.border }]}
          >
            <Text style={[styles.cellLabel, { color: colors.textSecondary }]}>{t('availableBalance')}</Text>
            <View style={styles.balanceValueRow}>
              <Text style={[styles.cellValue, { color: colors.text }]}>
                {stats.walletBalance === null ? '0' : formatAmount(stats.walletBalance)}
              </Text>
              <Text style={[styles.cellUnit, { color: colors.textSecondary }]}>{t('currency') || 'DT'}</Text>
            </View>
          </View>

          {/* 4. Taux d'acceptation */}
          <View style={[styles.statCell, styles.cellBorderBottom, { borderColor: colors.border }]}>
            <Text style={[styles.cellLabel, { color: colors.textSecondary }]}>{t('acceptanceRate')}</Text>
            <Text style={[styles.cellValue, { color: '#8A978E' }]}>—</Text>
            <Text style={[styles.cellHint, { color: colors.textSecondary }]}>{t('noDataYet')}</Text>
          </View>
        </View>

        {/* Bottom link: Historique des interventions */}
        <Pressable
          accessibilityRole="button"
          onPress={onOpenHistory}
          style={({ pressed }) => [styles.historyLink, pressed && { backgroundColor: colors.raised }]}
        >
          <Text style={[styles.historyLinkText, { color: colors.text, fontFamily: type.bodyStrong.fontFamily }]}>
            {t('historyTitle')}
          </Text>
          <Mirrored>
            <ChevronRight size={18} color={colors.textSecondary} strokeWidth={2.2} />
          </Mirrored>
        </Pressable>
      </View>
    </View>
  );
}

interface RecentClientsProps {
  /** Completed missions, most recent first. Only the first three are shown. */
  missions: Mission[];
}

/**
 * Recent missions list displaying client profile picture (or fallback), details, and status.
 */
export function RecentClients({ missions }: RecentClientsProps) {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { t, language } = useTranslation();
  const type = useType();
  const recent = missions.slice(0, 3);

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: type.heading.fontFamily }]}>
          {t('recentMissionsTitle')}
        </Text>
        <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/tracking')} hitSlop={8}>
          <Text style={[styles.viewAllText, { color: '#0F5B3A', fontFamily: type.smallStrong.fontFamily }]}>
            {t('viewAll')}
          </Text>
        </Pressable>
      </View>

      <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {recent.length === 0 ? (
          <View style={styles.emptyBox}>
            <Txt variant="small" color={colors.textMuted}>
              {t('noCompletedYet')}
            </Txt>
          </View>
        ) : (
          recent.map((mission, index) => {
            const name: string = mission.client?.user?.fullName || t('client');
            const avatarUrl: string | undefined = mission.client?.user?.avatarUrl ?? undefined;
            const categoryName = mission.category?.name || '';
            const description = mission.description || '';
            const service = [categoryName, description].filter(Boolean).join(' · ');

            return (
              <React.Fragment key={mission.id ?? index}>
                {index > 0 && <Hairline />}
                <View style={styles.clientRow}>
                  {/* Client Avatar with image support & initials fallback */}
                  <ClientAvatar name={name} avatarUrl={avatarUrl} />

                  <View style={styles.clientInfo}>
                    <Text
                      style={[styles.clientName, { color: colors.text, fontFamily: type.bodyStrong.fontFamily }]}
                      numberOfLines={1}
                    >
                      {name}
                    </Text>
                    {Boolean(service) && (
                      <Text
                        style={[
                          styles.clientService,
                          { color: colors.textSecondary, fontFamily: type.small.fontFamily },
                        ]}
                        numberOfLines={1}
                      >
                        {service}
                      </Text>
                    )}
                    <Text
                      style={[styles.clientDate, { color: colors.textMuted, fontFamily: type.caption.fontFamily }]}
                      numberOfLines={1}
                    >
                      {formatDate(mission.completedAt || mission.createdAt, language)}
                    </Text>
                  </View>

                  {/* Status Pill: Terminée */}
                  <View style={styles.statusBadge}>
                    <Check size={12} color="#0F5B3A" strokeWidth={3.2} />
                    <Text style={[styles.statusText, { fontFamily: type.captionStrong.fontFamily }]}>
                      {capitalize(t('completed'))}
                    </Text>
                  </View>
                </View>
              </React.Fragment>
            );
          })
        )}
      </View>
    </View>
  );
}

/**
 * Client avatar component that renders profile picture when available,
 * falling back to the initials box.
 */
function ClientAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  const [loadError, setLoadError] = useState(false);

  if (avatarUrl && !loadError) {
    return (
      <View style={styles.avatarContainer}>
        <Image source={{ uri: avatarUrl }} style={styles.avatarImage} onError={() => setLoadError(true)} />
      </View>
    );
  }

  return (
    <View style={[styles.avatarContainer, styles.avatarFallback]}>
      <Text style={styles.avatarFallbackText}>{initialsOf(name)}</Text>
    </View>
  );
}
