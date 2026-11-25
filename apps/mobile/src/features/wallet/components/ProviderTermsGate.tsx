import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ACTIVATION_FEE_TND, COMMISSION_FEE_TND } from '@el7al/shared';
import { Banknote, CreditCard, Lock } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { gutter } from '../../../shared/theme/tokens';
import { formatAmount } from '../../../shared/utils/format';
import { logger } from '../../../shared/utils/logger';
import { acceptTerms, fetchWallet } from '../api/wallet.api';
import { useAuthStore } from '../../auth';

/** Whether this artisan still has to accept the fees. The server keeps the answer, with its date, as proof. */
function useTermsGate(userId: string | null) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!userId) {
      setOpen(false);
      return;
    }
    let cancelled = false;
    fetchWallet()
      .then((wallet) => {
        if (!cancelled) setOpen(wallet.termsAccepted === false);
      })
      .catch((e) => logger.warn('Could not read the terms state:', e));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const accept = async () => {
    setSaving(true);
    setFailed(false);
    try {
      await acceptTerms();
      setOpen(false);
    } catch (e) {
      logger.warn('Could not save the agreement:', e);
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };
  return { open, accept, saving, failed };
}

/** The three points an artisan must know: the activation fee, the commission, and the block when it is unpaid. */
function useTermsRows() {
  const { t } = useTranslation();
  const money = (n: number) => `${formatAmount(n)} ${t('currency')}`;
  return [
    {
      Icon: CreditCard,
      title: t('termsActivationTitle'),
      body: t('termsActivationBody').replace('{activation}', money(ACTIVATION_FEE_TND)),
    },
    {
      Icon: Banknote,
      title: t('termsCommissionTitle'),
      body: t('termsCommissionBody')
        .replaceAll('{commission}', money(COMMISSION_FEE_TND))
        .replaceAll('{activation}', money(ACTIVATION_FEE_TND))
        .replaceAll('{total}', money(COMMISSION_FEE_TND + ACTIVATION_FEE_TND)),
    },
    { Icon: Lock, title: t('termsBlockTitle'), body: t('termsBlockBody') },
  ];
}

/**
 * Shown to an artisan the first time they sign in: the activation fee, the commission and what happens when it is
 * not paid. It stays until accepted; the server keeps the date.
 */
export function ProviderTermsGate() {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => (s.user?.role === 'PROVIDER' ? s.user.id : null));
  const { open, accept, saving, failed } = useTermsGate(userId);
  const rows = useTermsRows();

  return (
    <Modal visible={open} animationType="slide" onRequestClose={() => undefined}>
      <View style={[styles.screen, { backgroundColor: colors.hero, paddingTop: insets.top + 24 }]}>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Txt variant="title" color={colors.onBrand} accessibilityRole="header">
            {t('termsTitle')}
          </Txt>
          <Txt variant="body" color={colors.onBrandMuted}>
            {t('termsIntro')}
          </Txt>
          {rows.map(({ Icon, title, body }) => (
            <View key={title} style={styles.row}>
              <View style={styles.icon}>
                <Icon size={22} color={colors.live} strokeWidth={2.2} />
              </View>
              <View style={styles.flex}>
                <Txt variant="bodyStrong" color={colors.onBrand}>
                  {title}
                </Txt>
                <Txt variant="small" color={colors.onBrandMuted}>
                  {body}
                </Txt>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 10 }]}>
          {failed && (
            <Txt variant="small" color={colors.onBrand} accessibilityRole="alert">
              {t('termsFailed')}
            </Txt>
          )}
          <Button title={t('termsAccept')} variant="accent" onPress={() => void accept()} loading={saving} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0, gap: 4 },
  screen: { flex: 1 },
  body: { paddingHorizontal: gutter, paddingBottom: 24, gap: 18 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  footer: { paddingHorizontal: gutter, paddingTop: 10 },
});
