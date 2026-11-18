import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { LiveDot } from '../../../shared/ui/LiveDot';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { numeralFont } from '../../../shared/theme/typography';
import { gutter } from '../../../shared/theme/tokens';
import { useMissionStore } from '../../missions/store/useMissionStore';
import { clientHeadline, clientStatusLabel } from '../utils/missionLabels';

interface Props {
  bottom: number;
  onPress: () => void;
}

/** The green pill over the tab bar while a request is under way: who is coming and in how many minutes. */
export function ActiveMissionPill({ bottom, onPress }: Props) {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  const status = useMissionStore((s) => s.missionStatus);
  const eta = useMissionStore((s) => s.etaMinutes);
  const partner = useMissionStore((s) => s.activePairingProvider);
  const mission = useMissionStore((s) => s.activeMission);

  const firstName = partner?.fullName?.trim().split(/\s+/)[0];
  const showEta = status === 'EN_ROUTE' && eta > 0;
  const title =
    status === 'EN_ROUTE' && firstName ? t('artisanArrives').replace('{name}', firstName) : clientHeadline(status, t);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        { bottom, backgroundColor: colors.hero },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <LiveDot />
      <View style={styles.text}>
        <Txt variant="bodyStrong" color={colors.onBrand} numberOfLines={1}>
          {title}
        </Txt>
        <Txt variant="caption" color={colors.onBrandMuted} numberOfLines={1}>
          {[clientStatusLabel(status, t), mission?.description].filter(Boolean).join(' · ')}
        </Txt>
      </View>
      {showEta ? (
        <View style={styles.eta} accessible accessibilityLabel={`${eta} ${t('minutesShort')}`}>
          <Txt style={[styles.etaValue, { color: colors.live }]}>{eta}</Txt>
          <Txt variant="captionStrong" color={colors.onBrandMuted}>
            {t('minutesShort')}
          </Txt>
        </View>
      ) : (
        <View style={styles.chev}>
          <Mirrored>
            <ChevronRight size={16} color="#fff" strokeWidth={2.4} />
          </Mirrored>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    start: gutter - 4,
    end: gutter - 4,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingStart: 18,
    paddingEnd: 8,
    shadowColor: '#0D5C3A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 8,
    zIndex: 99,
  },
  text: { flex: 1, minWidth: 0 },
  eta: { minWidth: 48, height: 44, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  etaValue: { fontFamily: numeralFont, fontSize: 24, lineHeight: 26 },
  chev: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
});
