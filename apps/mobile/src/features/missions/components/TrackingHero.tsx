import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HeroAddress, HeroNumeral, HeroPanel, HeroStatus } from '../../../shared/ui/HeroPanel';
import { MissionStatusRail } from '../../../shared/ui/MissionStatusRail';
import { Txt } from '../../../shared/ui/Txt';
import { numeralFont } from '../../../shared/theme/typography';
import { space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useMissionStore } from '../store/useMissionStore';

interface Props {
  status: string | null;
  statusLabel: string;
  headline: string;
  address?: string | null;
}

/** What is happening now: live status, estimated arrival or headline, address and progress rail. */
export function TrackingHero({ status, statusLabel, headline, address }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const etaMinutes = useMissionStore((state) => state.etaMinutes);
  const distanceKm = useMissionStore((state) => state.distanceKm);

  const isEnRoute = status === 'EN_ROUTE';
  const showEta = isEnRoute && etaMinutes > 0;
  const showAddress = showEta || status === 'ARRIVED' || status === 'IN_PROGRESS' || status === 'DUAL_CONFIRM';

  return (
    <HeroPanel>
      <HeroStatus
        live
        label={statusLabel}
        trailing={
          isEnRoute && distanceKm > 0 ? (
            <Text style={[styles.distance, { color: colors.onBrand }]}>{distanceKm} km</Text>
          ) : undefined
        }
      />
      {showEta ? (
        <View>
          <Txt variant="small" color={colors.onBrandMuted}>
            {t('etaEstimated')}
          </Txt>
          <HeroNumeral value={etaMinutes} unit={t('minutesShort')} size={88} />
        </View>
      ) : (
        <Txt variant="heading" color={colors.onBrand}>
          {headline}
        </Txt>
      )}
      {showAddress && <HeroAddress address={address} />}
      <MissionStatusRail status={status} onBrand style={styles.rail} />
    </HeroPanel>
  );
}

const styles = StyleSheet.create({
  distance: { fontFamily: numeralFont, fontSize: 22, lineHeight: 24 },
  rail: { marginTop: space.xs },
});
