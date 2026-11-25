import { useState } from 'react';
import { Image, Linking, Pressable, View } from 'react-native';
import { Avatar } from '../../../shared/ui/Avatar';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { formatAmount, toNumber } from '../../../shared/utils/format';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import type { AdminActions } from '../hooks/useAdminActions';
import type { Topup } from '../schemas/admin.schema';
import { styles } from './AdminTabs.styles';

/** Who sent the transfer, with its reference. */
function TopupHeader({ topup }: { topup: Topup }) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const name = topup.provider?.user?.fullName;
  return (
    <View style={styles.between}>
      <Avatar name={name} size={44} tint={{ background: colors.brand, color: colors.live }} />
      <View style={styles.flex}>
        {Boolean(name) && (
          <Txt variant="bodyStrong" numberOfLines={1}>
            {name}
          </Txt>
        )}
        <Txt variant="small" color={colors.textMuted} numberOfLines={1}>
          {t('refShort').replace('{ref}', String(topup.uniqueRef ?? ''))}
        </Txt>
      </View>
    </View>
  );
}

/** The photo of the receipt; a tap opens it full size. */
function Receipt({ url }: { url?: string }) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  if (!url) return null;
  return (
    <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(url)}>
      <Image source={{ uri: url }} style={[styles.receipt, { backgroundColor: colors.tint }]} resizeMode="cover" />
      <Txt variant="caption" color={colors.accentText}>
        {t('openReceipt')}
      </Txt>
    </Pressable>
  );
}

/** One receipt: what is owed next to what was sent, the photo, and the amount really found on the bank account. */
export function TopupCard({ topup, actions }: { topup: Topup; actions: AdminActions }) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const declared = toNumber(topup.amount) ?? 0;
  const owed = topup.owed ?? declared;
  const [received, setReceived] = useState(String(declared));
  const value = Number(received.replace(',', '.'));
  const valid = Number.isFinite(value) && value > 0;
  const overdue = topup.overdue ?? owed;
  const missing = valid ? Math.max(0, overdue - value) : overdue;
  const money = (n: number) => `${formatAmount(n)} ${t('currency')}`;

  return (
    <Surface style={styles.topupCard}>
      <TopupHeader topup={topup} />
      <Txt variant="bodyStrong">{`${t('adminOwes')} ${money(owed)} · ${t('adminDeclared')} ${money(declared)}`}</Txt>
      <Receipt url={topup.receiptPhotoUrl} />
      <Input
        label={t('adminReceived')}
        keyboardType="decimal-pad"
        maxLength={8}
        value={received}
        onChangeText={setReceived}
      />
      {missing > 0 && (
        <Txt variant="smallStrong" color={colors.warnText}>
          {t('adminMissing').replace('{amount}', money(missing))}
        </Txt>
      )}
      <View style={styles.topupActions}>
        <Button
          title={t('reject')}
          variant="destructive"
          onPress={() => actions.reject(topup.id)}
          style={styles.flex}
        />
        <Button
          title={t('approve')}
          variant="primary"
          disabled={!valid}
          onPress={() => actions.approve(topup.id, value)}
          style={styles.flexWide}
        />
      </View>
    </Surface>
  );
}
