import { Pressable, StyleSheet, View } from 'react-native';
import { Clock, FileText, ShieldCheck, Wallet } from 'lucide-react-native';
import { formatAmount } from '../../../shared/utils/format';
import { Hairline, Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { SettingRow } from './SettingRow';

interface Props {
  /** Artisans only: opens "Payer El 7al"; `due` is what is owed. */
  onPay?: () => void;
  due?: number;
  isAdmin: boolean;
  onOpenHistory: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
  onOpenPrivacy: () => void;
  onDeleteAccount: () => void;
}

/** History, admin and privacy as a card of rows; then "Déconnexion" and "Supprimer le compte" as plain links. */
export function ProfileActions({
  onPay,
  due = 0,
  isAdmin,
  onOpenHistory,
  onOpenAdmin,
  onLogout,
  onOpenPrivacy,
  onDeleteAccount,
}: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();

  return (
    <>
      <Surface>
        {onPay && (
          <>
            <SettingRow
              Icon={Wallet}
              label={t('payElHal')}
              onPress={onPay}
              right={
                due > 0 ? (
                  <Txt variant="smallStrong" color={colors.textMuted}>
                    {`${formatAmount(due)} ${t('currency')}`}
                  </Txt>
                ) : undefined
              }
            />
            <Hairline style={styles.sep} />
          </>
        )}
        <SettingRow Icon={Clock} label={t('historyTitle')} onPress={onOpenHistory} />
        {isAdmin && (
          <>
            <Hairline style={styles.sep} />
            <SettingRow Icon={ShieldCheck} label={t('adminPortalTitle')} onPress={onOpenAdmin} />
          </>
        )}
        <Hairline style={styles.sep} />
        <SettingRow Icon={FileText} label={t('privacyPolicyTitle')} onPress={onOpenPrivacy} />
      </Surface>

      <View style={styles.links}>
        <Pressable accessibilityRole="button" onPress={onLogout} hitSlop={10}>
          <Txt variant="bodyStrong" style={styles.link}>
            {t('logout')}
          </Txt>
        </Pressable>
        {!isAdmin && (
          <Pressable accessibilityRole="button" onPress={onDeleteAccount} hitSlop={10}>
            <Txt variant="bodyStrong" color={colors.dangerText} style={styles.link}>
              {t('deleteAccount')}
            </Txt>
          </Pressable>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sep: { marginStart: 64 },
  links: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  link: { fontSize: 14, lineHeight: 20 },
});
