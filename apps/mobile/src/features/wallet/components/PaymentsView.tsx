import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { gutter, space } from '../../../shared/theme/tokens';
import { useTopPad } from '../../../shared/theme/useTopPad';
import type { TopupTransaction, WalletCharge } from '../api/wallet.api';
import { PayHistory } from './PayHistory';

interface Props {
  charges: WalletCharge[];
  transfers: TopupTransaction[];
  onBack: () => void;
}

/** "My payments" when nothing is owed: the history, with nothing to send. */
export function PaymentsView({ charges, transfers, onBack }: Props) {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  const topPad = useTopPad();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={styles.nav}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          onPress={onBack}
          style={({ pressed }) => [
            styles.round,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Mirrored>
            <ChevronLeft size={20} color={colors.text} />
          </Mirrored>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Txt variant="title" accessibilityRole="header">
          {t('myPayments')}
        </Txt>
        <Txt variant="body" color={colors.textMuted}>
          {t('nothingDue')}
        </Txt>
        <PayHistory charges={charges} transfers={transfers} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  nav: { minHeight: 46, paddingHorizontal: gutter, justifyContent: 'center' },
  round: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: gutter, paddingTop: 18, paddingBottom: 32, gap: space.lg },
});
