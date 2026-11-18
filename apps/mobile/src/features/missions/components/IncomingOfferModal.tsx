import { Modal, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../shared/ui/Button';
import { LiveDot } from '../../../shared/ui/LiveDot';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { numeralFont } from '../../../shared/theme/typography';
import { CATEGORY_ICONS } from '../../home/components/categoryIcons';
import { useIncomingOffer } from '../hooks/useIncomingOffer';

/** Seconds left as m:ss, like the prototype's countdown. */
const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

/**
 * A new request for the artisan: "Nouvelle demande", the trade and the problem, who and where, a countdown to
 * answer, and two buttons: decline, or accept. It rises from the bottom over whatever screen the artisan is on.
 * The request carries no price: the artisan names the amount only at the end of the job.
 */
export function IncomingOfferModal() {
  const insets = useSafeAreaInsets();
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  const { offer, countdown, accepting, handleAccept, handleRefuse } = useIncomingOffer();

  if (!offer) return null;

  const categoryName = offer.categoryName || t('nearbyRequest');
  const lower = categoryName.toLowerCase();
  const iconKey = Object.keys(CATEGORY_ICONS).find((k) => lower.includes(k.toLowerCase())) ?? 'Wrench';
  const Icon = CATEGORY_ICONS[iconKey];
  const clientName = offer.clientName || t('client');
  const title = offer.description || categoryName;
  const urgent = countdown <= 8;

  return (
    <Modal visible transparent animationType="slide" statusBarTranslucent onRequestClose={() => undefined}>
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <View
          accessibilityRole="alert"
          aria-modal
          style={[
            styles.sheet,
            { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, 16) + 16 },
          ]}
        >
          <View style={[styles.grab, { backgroundColor: colors.borderStrong }]} />

          <View style={styles.cap}>
            <LiveDot />
            <Txt variant="overline" color={colors.textMuted}>
              {t('newRequest')}
            </Txt>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.action }]}>
            <View style={styles.top}>
              <View style={[styles.tile, { backgroundColor: colors.tint }]}>
                <Icon size={24} color={colors.accentText} strokeWidth={1.9} />
              </View>
              <View style={styles.flex}>
                <Txt variant="bodyStrong" numberOfLines={2} style={styles.title}>
                  {title}
                </Txt>
                <Txt variant="small" color={colors.textMuted} numberOfLines={2}>
                  {[clientName, offer.addressText].filter(Boolean).join(' · ')}
                </Txt>
              </View>
              <View
                style={styles.timer}
                accessible
                accessibilityLabel={`${t('answerIn')}: ${countdown}`}
                accessibilityLiveRegion="polite"
              >
                <Txt style={[styles.count, { color: urgent ? colors.dangerText : colors.text }]}>
                  {clock(countdown)}
                </Txt>
                <Txt variant="caption" color={colors.textMuted}>
                  {t('answerIn')}
                </Txt>
              </View>
            </View>

            <View style={styles.buttons}>
              <Button
                title={t('refuseShort')}
                variant="outline"
                onPress={handleRefuse}
                disabled={accepting}
                style={styles.refuse}
                textStyle={{ color: colors.textMuted }}
              />
              <Button
                title={t('acceptShort')}
                variant="primary"
                onPress={handleAccept}
                loading={accepting}
                style={styles.accept}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 14, gap: 14 },
  grab: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2 },
  cap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  card: { borderRadius: 24, borderWidth: 2, padding: 18, gap: 14 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  tile: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, lineHeight: 22 },
  timer: { alignItems: 'flex-end', gap: 2 },
  count: { fontFamily: numeralFont, fontSize: 22, lineHeight: 24, fontVariant: ['tabular-nums'] },
  buttons: { flexDirection: 'row', gap: 10 },
  refuse: { flex: 1, height: 50 },
  accept: { flex: 2, height: 50 },
});
