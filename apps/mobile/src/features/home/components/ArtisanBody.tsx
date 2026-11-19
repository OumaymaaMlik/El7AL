import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AlertCircle, ChevronRight } from 'lucide-react-native';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { MissionStatusRail } from '../../../shared/ui/MissionStatusRail';
import { StatusBadge } from '../../../shared/ui/StatusBadge';
import { Txt } from '../../../shared/ui/Txt';
import { LiveDot } from '../../../shared/ui/LiveDot';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { formatAmount, formatDate, initialsOf } from '../../../shared/utils/format';
import { useAuthStore } from '../../auth';
import type { Mission } from '../../missions/schemas/mission.schema';
import { useMissionStore } from '../../missions/store/useMissionStore';
import { trackingStatusLabel } from '../../missions/utils/trackingLabels';
import { TradeTile } from './TradeTile';
import { Button } from '../../../shared/ui/Button';
import { ROUTES } from '../../../navigation/routes';
import { styles } from './ArtisanHome.styles';
import { ACTIVATION_FEE_TND, COMMISSION_FEE_TND } from '@el7al/shared';

/** The mission under way, as a card that opens the live tracking screen. */
function ActiveMissionCard() {
  const router = useRouter();
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  const mission = useMissionStore((s) => s.activeMission);
  const status = useMissionStore((s) => s.missionStatus) ?? mission?.status ?? null;
  const partner = useMissionStore((s) => s.activePairingProvider);
  const clientName = mission?.client?.user?.fullName ?? partner?.fullName ?? t('client');
  const title = mission?.description || mission?.category?.name || t('activeIntervention');
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push('/(tabs)/tracking')}
      style={({ pressed }) => [
        styles.activeCard,
        { backgroundColor: colors.surface, borderColor: colors.brand },
        pressed && { opacity: 0.9 },
      ]}
    >
      <View style={styles.row}>
        <TradeTile name={mission?.category?.name} size={46} />
        <View style={styles.flex}>
          <Txt variant="bodyStrong" numberOfLines={1}>
            {title}
          </Txt>
          <Txt variant="small" color={colors.textMuted} numberOfLines={1}>
            {[clientName, mission?.addressText].filter(Boolean).join(' · ')}
          </Txt>
        </View>
        <View style={[styles.liveBadge, { backgroundColor: 'rgba(181,242,61,0.25)' }]}>
          <LiveDot />
          <Txt variant="captionStrong" color="#3F6212" numberOfLines={1}>
            {trackingStatusLabel(status, true, t)}
          </Txt>
        </View>
      </View>
      <MissionStatusRail status={status} />
    </Pressable>
  );
}

interface BodyProps {
  /** What the artisan owes El 7al (commissions), in TND. */
  due: number;
  /** Set when the artisan owes commission and so cannot receive requests. */
  block: 'COMMISSION' | null;
  available: boolean;
  missionActive: boolean;
  completed: Mission[];
}

type Translate = ReturnType<typeof useTranslation>['t'];

/** The wording of the notice at the top of the artisan home. The first debt includes the activation fee. */
function blockNotice(block: BodyProps['block'], due: number, t: Translate) {
  if (block !== 'COMMISSION') return { title: t('pausedAccountTitle'), sub: t('pausedAccountSub') };
  const money = (n: number) => `${formatAmount(n)} ${t('currency')}`;
  const first = due === COMMISSION_FEE_TND + ACTIVATION_FEE_TND;
  const sub = (first ? t('commissionBlockedFirstSub') : t('commissionBlockedSub'))
    .replace('{amount}', money(due))
    .replace('{commission}', money(COMMISSION_FEE_TND))
    .replace('{activation}', money(ACTIVATION_FEE_TND));
  return { title: t('commissionBlockedTitle'), sub };
}

/** What sits under the header: a paused-account notice, the live mission or the waiting state, and recent missions. */
export function ArtisanBody({ due, block, available, missionActive, completed }: BodyProps) {
  const router = useRouter();
  const colors = useThemeStore((s) => s.colors);
  const { t, language } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const paused = block !== null || user?.status === 'SUSPENDED_LOW_BALANCE';
  const notice = blockNotice(block, due, t);
  const recent = completed.slice(0, 3);

  return (
    <View style={styles.body}>
      {paused && (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(ROUTES.pay)}
          style={[styles.notice, { backgroundColor: colors.warnSoft }]}
        >
          <AlertCircle size={20} color={colors.warnText} />
          <View style={styles.flex}>
            <Txt variant="bodyStrong" color={colors.warnText}>
              {notice.title}
            </Txt>
            <Txt variant="small" color={colors.textMuted}>
              {notice.sub}
            </Txt>
          </View>
          <Mirrored>
            <ChevronRight size={16} color={colors.textMuted} />
          </Mirrored>
        </Pressable>
      )}

      {missionActive ? (
        <ActiveMissionCard />
      ) : (
        <View style={[styles.empty, { borderColor: colors.border }]}>
          {available && !paused && <LiveDot />}
          <Txt variant="small" color={colors.textMuted} style={styles.center}>
            {available && !paused ? t('waitingRequests') : t('offlineHint')}
          </Txt>
        </View>
      )}

      {due > 0 && (
        <View style={[styles.dueCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.flex}>
            <Txt variant="bodyStrong">{t('commissionsCard')}</Txt>
          </View>
          <Txt style={styles.dueAmount}>{`${formatAmount(due)} ${t('currency')}`}</Txt>
        </View>
      )}
      {due > 0 && <Button title={t('payElHal')} variant="secondary" onPress={() => router.push(ROUTES.pay)} />}

      {recent.length > 0 && (
        <>
          <View style={styles.sectionHead}>
            <Txt variant="overline" color={colors.textMuted}>
              {t('recentMissionsTitle')}
            </Txt>
            <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/tracking')} hitSlop={8}>
              <Txt variant="smallStrong" color={colors.accentText}>
                {t('viewAll')}
              </Txt>
            </Pressable>
          </View>
          {recent.map((mission, index) => {
            const name = mission.client?.user?.fullName || t('client');
            return (
              <View
                key={mission.id ?? index}
                style={[styles.rowCard, { backgroundColor: colors.surface, borderColor: colors.divider }]}
              >
                <TradeTile name={mission.category?.name} size={42} />
                <View style={styles.flex}>
                  <Txt variant="bodyStrong" numberOfLines={1}>
                    {mission.description || mission.category?.name || initialsOf(name)}
                  </Txt>
                  <Txt variant="caption" color={colors.textMuted} numberOfLines={1}>
                    {[name, formatDate(mission.completedAt || mission.createdAt, language)].join(' · ')}
                  </Txt>
                </View>
                <StatusBadge label={t('paidBadge')} tone="success" />
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}
