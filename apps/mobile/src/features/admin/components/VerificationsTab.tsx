import { Image, Linking, Pressable, StyleSheet, View } from 'react-native';
import { FileText, ShieldCheck } from 'lucide-react-native';
import { Avatar } from '../../../shared/ui/Avatar';
import { Button } from '../../../shared/ui/Button';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { space } from '../../../shared/theme/tokens';
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
          <Surface key={p.id} style={styles.card}>
            <View style={styles.head}>
              <Avatar name={p.user.fullName} size={44} tint={{ background: colors.tint, color: colors.accentText }} />
              <View style={styles.flex}>
                <Txt variant="bodyStrong" numberOfLines={1}>
                  {p.user.fullName}
                </Txt>
                <Txt variant="small" color={trades ? colors.textSecondary : colors.textMuted} numberOfLines={1}>
                  {trades || t('noServiceListed')}
                </Txt>
              </View>
            </View>

            <View style={styles.docs}>
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
                    style={[styles.doc, { backgroundColor: colors.tint }]}
                  >
                    {isImage(url) ? (
                      <Image source={{ uri: url }} style={styles.docImage} resizeMode="cover" />
                    ) : (
                      <FileText size={22} color={colors.brand} />
                    )}
                  </Pressable>
                ))
              )}
            </View>

            <View style={styles.facts}>
              {facts.map((fact) => (
                <Txt key={fact} variant="small" color={colors.textMuted}>
                  {fact}
                </Txt>
              ))}
            </View>

            <View style={styles.actions}>
              <Button
                title={t('refuseArtisan')}
                variant="destructive"
                onPress={() => actions.setProviderToRefuse(p)}
                style={styles.flex}
              />
              <Button
                title={t('approve')}
                variant="primary"
                onPress={() => void actions.decideProvider(p, true)}
                style={styles.flexWide}
              />
            </View>
          </Surface>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  flexWide: { flex: 1.6 },
  list: { gap: space.md },
  card: { padding: 16, gap: 14 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docs: { flexDirection: 'row', gap: 8 },
  doc: { flex: 1, height: 84, borderRadius: 8, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  docImage: { width: '100%', height: '100%' },
  facts: { gap: 2 },
  actions: { flexDirection: 'row', gap: 10 },
});
