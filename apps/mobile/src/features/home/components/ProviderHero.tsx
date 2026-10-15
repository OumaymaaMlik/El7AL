import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, MapPin, MessageSquare, Navigation, Play, Square } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { Toggle } from '../../../shared/ui/Toggle';
import { Txt } from '../../../shared/ui/Txt';
import { radius, space } from '../../../shared/theme/tokens';
import { useType } from '../../../shared/theme/useType';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useAuthStore } from '../../auth';
import { useMissionStore } from '../../missions/store/useMissionStore';
import type { MissionFlow } from '../../missions/hooks/useMissionFlow';
import { providerHeadline, providerStatusLabel } from '../utils/missionLabels';
import { HeroPanel, HeroStatus } from '../../../shared/ui/HeroPanel';
import { MissionHero } from './MissionHero';
import { heroStyles } from './heroStyles';

interface Props {
  flow: MissionFlow;
  available: boolean;
  onToggleAvailability: (value: boolean) => void;
  onOpenChat: () => void;
}

/** Artisan hero: a new offer, the active mission's next action, or the online/offline panel. */
export function ProviderHero({ flow, available, onToggleAvailability, onOpenChat }: Props) {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const type = useType();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const incomingOffer = useMissionStore((state) => state.incomingOffer);
  const pairedClient = useMissionStore((state) => state.activePairingProvider);
  const status = useMissionStore((state) => state.missionStatus);

  if (incomingOffer) {
    return (
      <HeroPanel>
        <HeroStatus
          live
          label={t('newOfferReceived')}
          trailing={
            <View style={[styles.tag, { backgroundColor: colors.action }]}>
              <Txt variant="captionStrong" color={colors.onAction} numberOfLines={1}>
                {incomingOffer.categoryName || t('activeIntervention')}
              </Txt>
            </View>
          }
        />
        <Txt variant="heading" color={colors.onBrand}>
          {incomingOffer.addressText || t('nearbyRequest')}
        </Txt>
        {Boolean(incomingOffer.description) && (
          <Txt variant="small" color={colors.onBrandMuted} numberOfLines={2}>
            {incomingOffer.description}
          </Txt>
        )}
        <Button
          title={t('acceptOffer')}
          onPress={() => router.push('/(tabs)/tracking')}
          iconPosition="left"
          icon={<Check size={18} color={colors.onAction} strokeWidth={2.6} />}
        />
      </HeroPanel>
    );
  }

  if (pairedClient) {
    const icon = (Icon: typeof MapPin) => <Icon size={18} color={colors.onAction} />;
    return (
      <MissionHero statusLabel={providerStatusLabel(status, t)} headline={providerHeadline(status, t)}>
        {/* One next action at a time */}
        {status === 'ACCEPTED' || !status ? (
          <Button
            title={t('startRoute')}
            onPress={() => flow.setGpsOpen(true)}
            iconPosition="left"
            icon={icon(Navigation)}
          />
        ) : status === 'EN_ROUTE' ? (
          <Button
            title={t('arrived')}
            onPress={flow.arrived}
            loading={flow.actionLoading}
            iconPosition="left"
            icon={icon(MapPin)}
          />
        ) : status === 'ARRIVED' ? (
          <Button
            title={t('startWork')}
            onPress={flow.beginWork}
            loading={flow.actionLoading}
            iconPosition="left"
            icon={icon(Play)}
          />
        ) : status === 'IN_PROGRESS' ? (
          <Button
            title={t('finishWork')}
            onPress={flow.providerFinish}
            loading={flow.actionLoading}
            iconPosition="left"
            icon={icon(Square)}
          />
        ) : (
          <Button title={t('chatWithClient')} onPress={onOpenChat} iconPosition="left" icon={icon(MessageSquare)} />
        )}
      </MissionHero>
    );
  }

  return (
    <View style={heroStyles.hero}>
      <View style={styles.header}>
        <View style={heroStyles.pill}>
          <View style={heroStyles.pillDot} />
          <Text style={[heroStyles.pillText, { fontFamily: type.captionStrong.fontFamily }]}>{t('providerSpace')}</Text>
        </View>
        <Toggle
          accessibilityLabel={t('availableForMissions')}
          value={available}
          onValueChange={onToggleAvailability}
          onBrand
        />
      </View>

      <Text style={[heroStyles.mainTitle, styles.name, { fontFamily: type.title.fontFamily }]} numberOfLines={1}>
        {user?.fullName || t('provider')}
      </Text>

      <View style={styles.statusGroup}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: available ? '#B4EB3B' : 'rgba(255, 255, 255, 0.45)' }]} />
          <Text style={[styles.statusText, { fontFamily: type.bodyStrong.fontFamily }]}>
            {available ? t('youAreOnline') : t('offline')}
          </Text>
        </View>
        <Text style={[styles.commission, { fontFamily: type.small.fontFamily }]}>{t('receivingRequests')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { borderRadius: radius.sm, paddingHorizontal: space.sm, paddingVertical: 4, maxWidth: 160 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { color: '#FFFFFF', fontSize: 28 },
  statusGroup: { gap: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  commission: { fontSize: 13, fontWeight: '500', color: '#CFE5D7' },
});
