import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Banknote, Delete } from 'lucide-react-native';
import { BottomSheet } from '../../../shared/ui/BottomSheet';
import { SlideToAct } from '../../../shared/ui/SlideToAct';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { numeralFont } from '../../../shared/theme/typography';
import { hitTarget, radius, space } from '../../../shared/theme/tokens';

const MAX_DIGITS = 5;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const;

interface AmountSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Sends the amount (TND) and ends the work. */
  onSend: (amount: number) => void;
  loading?: boolean;
}

/**
 * The artisan declares what the client owes, at the very end of the job and nowhere before.
 * The client pays it in cash. Sending is a slide, so it cannot be done by a stray tap.
 */
export function AmountSheet({ visible, onClose, onSend, loading = false }: AmountSheetProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const [digits, setDigits] = useState('');

  useEffect(() => {
    if (visible) setDigits('');
  }, [visible]);

  const value = Number(digits || '0');
  const press = (key: (typeof KEYS)[number]) => {
    if (key === '') return;
    if (key === 'del') setDigits((d) => d.slice(0, -1));
    else setDigits((d) => (d.length >= MAX_DIGITS || (d === '' && key === '0') ? d : d + key));
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('amountTitle')} subtitle={t('amountSub')}>
      <View style={styles.body}>
        <View style={styles.amountRow} accessibilityLabel={`${value} TND`}>
          <Text style={[styles.amount, { color: value > 0 ? colors.text : colors.textMuted }]}>
            {value > 0 ? digits : '0'}
          </Text>
          <Text style={[styles.currency, { color: colors.textMuted }]}>TND</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: colors.tint }]}>
          <Banknote size={16} color={colors.accentText} />
          <Txt variant="captionStrong" color={colors.accentText}>
            {t('cashOnly')}
          </Txt>
        </View>

        <View style={styles.keys}>
          {KEYS.map((key, i) =>
            key === '' ? (
              <View key={`e${i}`} style={styles.key} />
            ) : (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={key === 'del' ? t('deleteDigit') : key}
                onPress={() => press(key)}
                style={({ pressed }) => [
                  styles.key,
                  { backgroundColor: key === 'del' ? 'transparent' : colors.background },
                  pressed && { backgroundColor: colors.tint },
                ]}
              >
                {key === 'del' ? (
                  <Delete size={24} color={colors.text} />
                ) : (
                  <Text style={[styles.keyText, { color: colors.text }]}>{key}</Text>
                )}
              </Pressable>
            ),
          )}
        </View>

        <SlideToAct label={t('slideToSend')} onComplete={() => onSend(value)} loading={loading} disabled={value <= 0} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: space.lg, alignItems: 'stretch' },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: space.sm },
  amount: { fontFamily: numeralFont, fontSize: 64, lineHeight: 68, letterSpacing: -1 },
  currency: { fontFamily: numeralFont, fontSize: 24, lineHeight: 68 },
  chip: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingHorizontal: 14,
    borderRadius: radius.full,
  },
  keys: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  key: {
    width: '31.5%',
    flexGrow: 1,
    height: Math.max(hitTarget, 52),
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { fontFamily: numeralFont, fontSize: 24 },
});
