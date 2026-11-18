import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from '../../../shared/ui/useReducedMotion';
import { Banknote, Check } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { BottomSheet } from '../../../shared/ui/BottomSheet';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { numeralFont } from '../../../shared/theme/typography';
import { radius, space } from '../../../shared/theme/tokens';

interface DualCompletionModalProps {
  visible: boolean;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
  /** The amount in TND the artisan declared. The only price the client ever sees. */
  amount: number | null;
  providerName?: string | null;
}

/**
 * End of the job, from the client's side: "C'est réparé", the amount the artisan declared,
 * and one action: confirm that it was paid in cash. When the artisan declared no amount
 * (an older app), the client just confirms the work is done.
 */
export function DualCompletionModal({
  visible,
  onConfirm,
  onClose,
  loading = false,
  amount,
  providerName,
}: DualCompletionModalProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();

  const reduce = useReducedMotion();
  const target = amount !== null && amount > 0 ? amount : 0;
  const [counted, setCounted] = useState(target);

  // The amount counts up from 0 over 0.7 s, after a short beat, like the prototype's end page.
  useEffect(() => {
    if (!visible || target <= 0 || reduce) {
      setCounted(target);
      return;
    }
    setCounted(0);
    const start = Date.now();
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start - 250) / 700);
      if (p > 0) setCounted(p >= 1 ? target : Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, target, reduce]);

  if (!visible) return null;

  const format = (n: number) => String(Math.round(n * 1000) / 1000).replace('.', ',');
  const hasAmount = target > 0;
  const shown = hasAmount ? format(target) : '';
  const shownCounting = hasAmount ? format(counted) : '';

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('jobDoneTitle')} subtitle={providerName ?? undefined}>
      <View style={styles.body}>
        <View style={[styles.check, { backgroundColor: colors.brand }]}>
          <Check size={30} color={colors.live} strokeWidth={2.8} />
        </View>

        {hasAmount && (
          <View style={styles.card}>
            <Txt variant="small" color={colors.onBrandMuted}>
              {t('amountDeclaredBy').replace('{name}', providerName || t('provider'))}
            </Txt>
            <View style={styles.amountRow} accessibilityLabel={`${shown} TND`}>
              <Text style={styles.amount}>{shownCounting}</Text>
              <Text style={[styles.currency, { color: colors.live }]}>TND</Text>
            </View>
            <View style={styles.chip}>
              <Banknote size={16} color={colors.onBrandMuted} />
              <Txt variant="captionStrong" color={colors.onBrandMuted}>
                {t('cashOnly')}
              </Txt>
            </View>
          </View>
        )}

        <Button
          title={hasAmount ? t('iPaidCash').replace('{amount}', shown) : t('confirmWorkFinish')}
          onPress={onConfirm}
          loading={loading}
        />
        <Button title={t('notNow')} variant="outline" onPress={onClose} disabled={loading} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: space.md },
  check: {
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { borderRadius: 24, padding: space.xl, alignItems: 'center', gap: 6, backgroundColor: '#0D5C3A' },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm },
  amount: { fontFamily: numeralFont, fontSize: 58, lineHeight: 62, color: '#FFFFFF', letterSpacing: -1 },
  currency: { fontFamily: numeralFont, fontSize: 20, lineHeight: 62 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 32,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
