import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Banknote } from 'lucide-react-native';
import { BottomSheet } from '../../../shared/ui/BottomSheet';
import { Button } from '../../../shared/ui/Button';
import { Surface, Hairline } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { numeralFont } from '../../../shared/theme/typography';
import { controlHeight, space } from '../../../shared/theme/tokens';

interface DirectPaymentModalProps {
  visible: boolean;
  onProceed: (method: string, amount: string) => void;
  onClose: () => void;
  loading?: boolean;
}

type Method = 'CASH' | 'FLOUCI' | 'CARD';

/** The client chooses how the artisan is paid. */
export function DirectPaymentModal({ visible, onProceed, onClose, loading = false }: DirectPaymentModalProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState<Method>('CASH');
  const [amount] = useState('30');

  if (!visible) return null;

  // Cash is the only payment for now; other methods will be added when they really exist.
  const METHODS: { id: Method; label: string; icon: LucideIcon }[] = [{ id: 'CASH', label: t('cash'), icon: Banknote }];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('directPaymentTitle')} subtitle={t('directPaymentSub')}>
      <View style={styles.body}>
        {/* The amount is fixed, so it is shown as a figure, not as an input. */}
        <View style={styles.amountRow}>
          <Txt variant="small" color={colors.textSecondary}>
            {t('amountToPay')}
          </Txt>
          <View style={styles.amountValue}>
            <Text style={[styles.amount, { color: colors.text }]}>{amount}</Text>
            <Text style={[styles.currency, { color: colors.textSecondary }]}>{t('currency')}</Text>
          </View>
        </View>

        <Surface accessibilityRole="radiogroup">
          {METHODS.map((m, index) => {
            const Icon = m.icon;
            const isSelected = selectedMethod === m.id;
            return (
              <React.Fragment key={m.id}>
                {index > 0 && <Hairline />}
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setSelectedMethod(m.id)}
                  style={({ pressed }) => [styles.methodRow, pressed && { backgroundColor: colors.raised }]}
                >
                  <Icon size={20} color={isSelected ? colors.accentText : colors.textMuted} />
                  <Txt variant={isSelected ? 'bodyStrong' : 'body'} style={styles.methodLabel}>
                    {m.label}
                  </Txt>
                  <View style={[styles.radio, { borderColor: isSelected ? colors.accentText : colors.inputBorder }]}>
                    {isSelected && <View style={[styles.radioDot, { backgroundColor: colors.accentText }]} />}
                  </View>
                </Pressable>
              </React.Fragment>
            );
          })}
        </Surface>

        <Button
          title={t('validatePayment')}
          onPress={() => onProceed(selectedMethod, amount)}
          loading={loading}
          disabled={!amount || isNaN(Number(amount)) || Number(amount) <= 0}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: space.lg,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space.md,
  },
  amountValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  amount: {
    fontFamily: numeralFont,
    fontSize: 44,
    lineHeight: 46,
  },
  currency: {
    fontFamily: numeralFont,
    fontSize: 22,
    lineHeight: 46,
  },
  methodRow: {
    minHeight: controlHeight + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  methodLabel: {
    flex: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
