import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { numeralFont } from '../../../shared/theme/typography';
import { space } from '../../../shared/theme/tokens';
import { Txt } from '../../../shared/ui/Txt';
import { MissionStatusRail } from '../../../shared/ui/MissionStatusRail';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useMissionStore } from '../../missions/store/useMissionStore';
import { HeroAddress, HeroNumeral, HeroPanel, HeroStatus } from '../../../shared/ui/HeroPanel';

interface MissionHeroProps {
  statusLabel: string;
  headline: string;
  /** Status rail fallback when the store has no status yet. */
  railFallback?: string;
  children: React.ReactNode;
}

/**
 * Green panel for an active mission: status, estimated arrival (or a headline),
 * address, progress rail and the single next action passed as children.
 */
export function MissionHero({ statusLabel, headline, railFallback, children }: MissionHeroProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const missionStatus = useMissionStore((state) => state.missionStatus);
  const etaMinutes = useMissionStore((state) => state.etaMinutes);
  const distanceKm = useMissionStore((state) => state.distanceKm);
  const address: string | undefined = useMissionStore((state) => state.activeMission?.addressText ?? undefined);

  const isEnRoute = missionStatus === 'EN_ROUTE';
  const showEta = isEnRoute && etaMinutes > 0;
  const distance =
    isEnRoute && distanceKm > 0 ? (
      <Text style={[styles.distance, { color: colors.onBrand }]}>{distanceKm} km</Text>
    ) : undefined;

  return (
    <HeroPanel>
      <HeroStatus live label={statusLabel} trailing={distance} />
      {showEta ? (
        <View>
          <Txt variant="small" color={colors.onBrandMuted}>
            {t('etaEstimated')}
          </Txt>
          <HeroNumeral value={etaMinutes} unit="min" size={64} />
        </View>
      ) : (
        <Txt variant="heading" color={colors.onBrand}>
          {headline}
        </Txt>
      )}
      <HeroAddress address={address} />
      <MissionStatusRail status={missionStatus || (railFallback as never)} onBrand style={styles.rail} />
      {children}
    </HeroPanel>
  );
}

const styles = StyleSheet.create({
  distance: { fontFamily: numeralFont, fontSize: 22, lineHeight: 24 },
  rail: { marginTop: space.xs, marginBottom: space.xs },
});
