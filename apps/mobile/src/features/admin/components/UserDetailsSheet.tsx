import React from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { FileText } from 'lucide-react-native';
import { BottomSheet } from '../../../shared/ui/BottomSheet';
import { Hairline, Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { radius, space } from '../../../shared/theme/tokens';
import { formatAmount, toNumber } from '../../../shared/utils/format';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { tradeName, type TradeLink } from '../../../shared/types/provider';
import type { AdminUser } from '../schemas/admin.schema';

const isImage = (url: string) => /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url) || url.includes('X-Amz-Signature');

/** Everything the admin knows about one account: contact, wallet, zone, presentation, trades and identity documents. */
export function UserDetailsSheet({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const profile = user?.providerProfile;
  const trades = ((profile?.categories as TradeLink[] | undefined) ?? []).map(tradeName).filter(Boolean).join(' · ');
  const documents = (profile?.documentsUrl as string[] | undefined) ?? [];
  const wallet = toNumber(profile?.walletBalance);
  const radiusKm = toNumber(profile?.radiusKm);

  const rows: { label: string; value: string }[] = [
    { label: t('phone'), value: user?.phoneNumber ?? '' },
    { label: t('email'), value: user?.email ?? '' },
    ...(profile
      ? [
          { label: t('walletLabel'), value: wallet !== null ? `${formatAmount(wallet)} ${t('currency')}` : '' },
          { label: t('radiusLabel'), value: radiusKm !== null ? `${radiusKm} km` : '' },
          { label: t('tradesLabel'), value: trades },
          { label: t('bio'), value: String(profile.bio ?? '') },
        ]
      : []),
  ].filter((row) => row.value);

  return (
    <BottomSheet
      visible={Boolean(user)}
      onClose={onClose}
      title={user?.fullName || t('userDetails')}
      subtitle={user?.role === 'PROVIDER' ? t('provider') : t('client')}
    >
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Surface style={{ backgroundColor: colors.background }}>
          {rows.map((row, index) => (
            <React.Fragment key={row.label}>
              {index > 0 && <Hairline />}
              <View style={styles.row}>
                <Txt variant="small" color={colors.textMuted} style={styles.label}>
                  {row.label}
                </Txt>
                <Txt variant="small" style={styles.flex}>
                  {row.value}
                </Txt>
              </View>
            </React.Fragment>
          ))}
        </Surface>

        {profile && (
          <View style={styles.documents}>
            <Txt variant="overline" color={colors.textMuted}>
              {t('idDocuments')}
            </Txt>
            {documents.length === 0 ? (
              <Txt variant="small" color={colors.textMuted}>
                {t('noDocuments')}
              </Txt>
            ) : (
              documents.map((url, index) => (
                <Pressable
                  key={url}
                  accessibilityRole="link"
                  accessibilityLabel={`${t('openDocument')} ${index + 1}`}
                  onPress={() => void Linking.openURL(url)}
                >
                  {isImage(url) ? (
                    <Image
                      source={{ uri: url }}
                      style={[styles.image, { borderColor: colors.border }]}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.fileRow}>
                      <FileText size={16} color={colors.brand} />
                      <Txt variant="smallStrong" color={colors.brand}>
                        {t('openDocument')} {index + 1}
                      </Txt>
                    </View>
                  )}
                </Pressable>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { maxHeight: 460 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, padding: space.lg },
  label: { width: 96 },
  documents: { gap: space.sm, paddingTop: space.lg },
  image: { width: '100%', height: 180, borderRadius: radius.md, borderWidth: 1 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 44 },
});
