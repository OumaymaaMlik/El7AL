import React from 'react';
import { Image, Linking, Pressable, StyleSheet, View } from 'react-native';
import { FileText, ShieldCheck } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Hairline, Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { radius, space } from '../../../shared/theme/tokens';
import { formatDate } from '../../../shared/utils/format';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import type { AdminActions } from '../hooks/useAdminActions';
import type { PendingProvider } from '../schemas/admin.schema';
import { ListSkeleton } from './AdminTabs';

const isImage = (url: string) => /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url) || url.includes('X-Amz-Signature');

/** The artisans waiting for the identity check: their details and documents, and the two answers. */
export function VerificationsTab({
  providers,
  loading,
  actions,
}: {
  providers: PendingProvider[];
  loading: boolean;
  actions: AdminActions;
}) {
  const colors = useThemeStore((state) => state.colors);
  const { t, language } = useTranslation();

  if (loading && providers.length === 0) return <ListSkeleton />;
  if (providers.length === 0) {
    return (
      <Surface>
        <EmptyState icon={<ShieldCheck size={24} color={colors.textMuted} />} title={t('noPendingArtisans')} />
      </Surface>
    );
  }

  return (
    <View style={styles.list}>
      {providers.map((p) => {
        const trades = (p.categories ?? []).map((c) => c.category.name).join(' · ');
        const documents = p.documentsUrl ?? [];
        const registered = formatDate(p.user.createdAt, language);
        const facts = [
          p.user.phoneNumber,
          p.user.email,
          p.cinNumber ? `CIN ${p.cinNumber}` : null,
          p.licenseNumber ? `${t('licenseLabel')} ${p.licenseNumber}` : null,
          p.vehicleType,
          registered ? t('registeredOn').replace('{date}', registered) : null,
        ].filter(Boolean) as string[];

        return (
          <Surface key={p.id}>
            <View style={styles.block}>
              <Txt variant="bodyStrong">{p.user.fullName}</Txt>
              <Txt variant="small" color={trades ? colors.textSecondary : colors.textMuted}>
                {trades || t('noServiceListed')}
              </Txt>
              {facts.map((fact) => (
                <Txt key={fact} variant="small" color={colors.textMuted}>
                  {fact}
                </Txt>
              ))}
            </View>
            <Hairline />
            <View style={styles.block}>
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
            <Hairline />
            <View style={styles.actions}>
              <Button
                title={t('refuseArtisan')}
                variant="outline"
                onPress={() => actions.setProviderToRefuse(p)}
                style={styles.flex}
              />
              <Button
                title={t('approve')}
                variant="primary"
                onPress={() => void actions.decideProvider(p, true)}
                style={styles.flex}
              />
            </View>
          </Surface>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { gap: space.md },
  block: { padding: space.lg, gap: space.sm },
  image: { width: '100%', height: 180, borderRadius: radius.md, borderWidth: 1 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 44 },
  actions: { flexDirection: 'row', gap: space.md, padding: space.md },
});
