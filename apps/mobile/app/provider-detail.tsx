import React, { useCallback, useEffect, useState } from 'react';
import type { ProviderPublicProfile, ProviderReview, TradeLink } from '../src/shared/types/provider';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Star, User } from 'lucide-react-native';
import { Button } from '../src/shared/ui/Button';
import { EmptyState } from '../src/shared/ui/EmptyState';
import { ScreenHeader } from '../src/shared/ui/ScreenHeader';
import { SectionHeader } from '../src/shared/ui/SectionHeader';
import { Skeleton } from '../src/shared/ui/Skeleton';
import { StatusBadge } from '../src/shared/ui/StatusBadge';
import { Surface, Hairline } from '../src/shared/ui/Surface';
import { Txt } from '../src/shared/ui/Txt';
import { useThemeStore } from '../src/shared/store/useThemeStore';
import { useTranslation } from '../src/shared/store/useLanguageStore';
import { numeralFont } from '../src/shared/theme/typography';
import { gutter, radius, space } from '../src/shared/theme/tokens';
import { initialsOf, toNumber } from '../src/shared/utils/format';
import { api } from '../src/services/http/client';
import { logger } from '../src/shared/utils/logger';

export default function ProviderDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<ProviderPublicProfile | null>(null);

  const providerId = params.id;
  const fetchProviderDetail = useCallback(async () => {
    if (!providerId) return;
    setLoading(true);
    try {
      const res = await api.get(`/geo/providers/${providerId}/profile`);
      if (res.data.success) {
        setProvider(res.data.data);
      }
    } catch (e) {
      logger.warn('Failed to fetch provider detail:', e);
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    void fetchProviderDetail();
  }, [fetchProviderDetail]);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
  };

  const name: string = provider?.user?.fullName || t('providersTitle');
  const reviews: ProviderReview[] = provider?.reviews || [];
  const totalRatings = toNumber(provider?.totalRatings) ?? reviews.length;
  const ratingAverage = toNumber(provider?.ratingAverage);
  const hasRating = totalRatings > 0 && ratingAverage !== null && ratingAverage > 0;
  const specialties: TradeLink[] = provider?.categories || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={name} onBack={goBack} trailing={null} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, space.lg) + space.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <>
            <Skeleton style={{ height: 96, borderRadius: radius.md }} />
            <Skeleton style={{ height: 72, borderRadius: radius.md }} />
            <Skeleton style={{ height: 140, borderRadius: radius.md }} />
          </>
        ) : !provider ? (
          <Surface>
            <EmptyState icon={<User size={24} color={colors.textMuted} />} title={t('providerNotFound')} />
          </Surface>
        ) : (
          <>
            {/* Who the artisan is */}
            <Surface style={styles.identity}>
              <View style={[styles.avatar, { backgroundColor: colors.raised }]}>
                <Text style={[styles.avatarText, { color: colors.text }]}>{initialsOf(provider.user?.fullName)}</Text>
              </View>
              <View style={styles.flex}>
                <Txt variant="heading" numberOfLines={1}>
                  {name}
                </Txt>
                {hasRating ? (
                  <View style={styles.ratingRow}>
                    <Star size={14} color={colors.star} fill={colors.star} />
                    <Txt variant="smallStrong">{ratingAverage!.toFixed(1)}</Txt>
                    <Txt variant="small" color={colors.textMuted}>
                      {t('reviewsCount').replace('{n}', String(totalRatings))}
                    </Txt>
                  </View>
                ) : (
                  <Txt variant="small" color={colors.textMuted}>
                    {t('noReviewsYet')}
                  </Txt>
                )}
              </View>
              {provider.user?.status === 'ACTIVE' && <StatusBadge label={t('certified')} tone="success" />}
            </Surface>

            {specialties.length > 0 && (
              <View>
                <SectionHeader title={t('specialties')} />
                <View style={styles.tags}>
                  {specialties.map((cItem, index) => (
                    <StatusBadge
                      key={cItem.categoryId || index}
                      label={cItem.category?.name || ''}
                      tone="neutral"
                      icon="none"
                    />
                  ))}
                </View>
              </View>
            )}

            <View>
              <SectionHeader title={t('experience')} />
              <Surface style={styles.padded}>
                <Txt variant="body" color={provider.bio ? colors.text : colors.textMuted}>
                  {provider.bio || t('noDescription')}
                </Txt>
              </Surface>
            </View>

            <View>
              <SectionHeader title={t('clientReviews')} meta={reviews.length > 0 ? String(reviews.length) : undefined} />
              <Surface>
                {reviews.length === 0 ? (
                  <View style={styles.padded}>
                    <Txt variant="small" color={colors.textMuted}>
                      {t('noReviewsPublished')}
                    </Txt>
                  </View>
                ) : (
                  reviews.map((rev, idx) => (
                    <React.Fragment key={rev.id || idx}>
                      {idx > 0 && <Hairline />}
                      <View style={styles.review}>
                        <View style={styles.reviewHeader}>
                          <Txt variant="bodyStrong" numberOfLines={1} style={styles.flex}>
                            {rev.client?.user?.fullName || t('anonymousClient')}
                          </Txt>
                          <View style={styles.ratingRow}>
                            <Star size={14} color={colors.star} fill={colors.star} />
                            <Txt variant="smallStrong">{rev.rating}</Txt>
                          </View>
                        </View>
                        {Boolean(rev.comment) && (
                          <Txt variant="small" color={colors.textSecondary}>
                            {rev.comment}
                          </Txt>
                        )}
                      </View>
                    </React.Fragment>
                  ))
                )}
              </Surface>
            </View>

            <Button title={t('requestThisPro')} onPress={() => router.push('/(tabs)/home')} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: gutter,
    paddingTop: space.xs,
    gap: space.xxl,
  },
  padded: {
    padding: space.lg,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: numeralFont,
    fontSize: 22,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  review: {
    padding: space.lg,
    gap: space.xs,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
});
