import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Star, CheckCircle2 } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { Dialog } from '../../../shared/ui/Dialog';
import { Surface, Hairline } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { numeralFont } from '../../../shared/theme/typography';
import { space } from '../../../shared/theme/tokens';

interface ProviderReviewReceivedModalProps {
  visible: boolean;
  data: {
    clientName?: string;
    rating?: number;
    comment?: string;
    amount?: string;
  } | null;
  onClose: () => void;
}

/** Shown to the artisan when the client has paid and left a review. */
export function ProviderReviewReceivedModal({ visible, data, onClose }: ProviderReviewReceivedModalProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();

  if (!visible || !data) return null;

  const ratingVal = data.rating || 0;
  const starsArray = Array.from({ length: 5 }, (_, i) => i < ratingVal);

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title={t('paymentAndReviewTitle')}
      subtitle={t('missionClosedSub')}
      icon={<CheckCircle2 size={24} color={colors.accentText} />}
    >
      <Surface>
        {/* Payment */}
        <View style={styles.paymentRow}>
          <Txt variant="small" color={colors.textSecondary} style={styles.flex}>
            {t('directPaymentValidated')}
          </Txt>
          <View style={styles.amountValue}>
            <Text style={[styles.amount, { color: colors.text }]}>{data.amount || '0'}</Text>
            <Text style={[styles.currency, { color: colors.textSecondary }]}>{t('currency')}</Text>
          </View>
        </View>

        <Hairline />

        {/* Review */}
        <View style={styles.review}>
          <Txt variant="bodyStrong">{data.clientName || t('client')}</Txt>
          {ratingVal > 0 && (
            <View
              style={styles.starsRow}
              accessible
              accessibilityLabel={t('ratingOutOfFive').replace('{n}', String(ratingVal))}
            >
              {starsArray.map((active, idx) => (
                <Star
                  key={idx}
                  size={18}
                  color={active ? colors.star : colors.inputBorder}
                  fill={active ? colors.star : 'transparent'}
                />
              ))}
              <Txt variant="smallStrong" color={colors.textSecondary} style={styles.ratingText}>
                {t('ratingOutOfFive').replace('{n}', String(ratingVal))}
              </Txt>
            </View>
          )}
          {Boolean(data.comment) && (
            <Txt variant="body" color={colors.textSecondary}>
              {data.comment}
            </Txt>
          )}
        </View>
      </Surface>

      <Button title={t('backHome')} onPress={onClose} />
    </Dialog>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
  },
  amountValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  amount: {
    fontFamily: numeralFont,
    fontSize: 34,
    lineHeight: 36,
  },
  currency: {
    fontFamily: numeralFont,
    fontSize: 22,
    lineHeight: 36,
  },
  review: {
    padding: space.lg,
    gap: space.sm,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    marginStart: space.sm,
  },
});
