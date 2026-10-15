import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HeroPanel, HeroStatus } from '../../../shared/ui/HeroPanel';
import { numeralFont } from '../../../shared/theme/typography';
import { space } from '../../../shared/theme/tokens';
import { formatAmount } from '../../../shared/utils/format';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';

/** Wallet balance — only artisans have a wallet. */
export function BalanceCard({ amount }: { amount: number }) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  return (
    <HeroPanel>
      <HeroStatus label={t('soldeAvailable')} />
      <View style={styles.row}>
        <Text style={[styles.amount, { color: colors.onBrand }]}>{formatAmount(amount)}</Text>
        <Text style={[styles.unit, { color: colors.onBrandMuted }]}>{t('currency')}</Text>
      </View>
    </HeroPanel>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm },
  amount: { fontFamily: numeralFont, fontSize: 64, lineHeight: 66 },
  unit: { fontFamily: numeralFont, fontSize: 28, lineHeight: 66 },
});
