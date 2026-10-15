import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { StatusBadge } from '../../../shared/ui/StatusBadge';
import { Hairline, Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { space } from '../../../shared/theme/tokens';
import { formatDate } from '../../../shared/utils/format';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import type { AdminActions } from '../hooks/useAdminActions';
import type { Dispute } from '../schemas/admin.schema';
import { disputeBadge } from '../utils/adminLabels';
import { ListSkeleton } from './AdminTabs';

/** Reports from clients and artisans; an open one can be resolved or dismissed. */
export function DisputesTab({
  disputes,
  loading,
  actions,
}: {
  disputes: Dispute[];
  loading: boolean;
  actions: AdminActions;
}) {
  const colors = useThemeStore((state) => state.colors);
  const { t, language } = useTranslation();
  if (loading && disputes.length === 0) return <ListSkeleton />;
  if (disputes.length === 0) {
    return (
      <Surface>
        <EmptyState icon={<AlertTriangle size={24} color={colors.textMuted} />} title={t('noDisputes')} />
      </Surface>
    );
  }
  return (
    <Surface>
      {disputes.map((d, index) => {
        const badge = disputeBadge(d.status, t);
        const reported = formatDate(d.createdAt, language);
        return (
          <React.Fragment key={d.id}>
            {index > 0 && <Hairline />}
            <View style={styles.row}>
              <View style={styles.between}>
                <StatusBadge label={badge.label} tone={badge.tone} />
                {Boolean(reported) && (
                  <Txt variant="caption" color={colors.textMuted}>
                    {reported}
                  </Txt>
                )}
              </View>
              <Txt variant="body">{d.reason}</Txt>
              {d.status === 'OPEN' && (
                <View style={styles.actions}>
                  <Button
                    title={t('dismissDispute')}
                    variant="outline"
                    onPress={() => void actions.closeDispute(d.id, 'DISMISSED')}
                    style={styles.flex}
                  />
                  <Button
                    title={t('resolveDispute')}
                    variant="primary"
                    onPress={() => void actions.closeDispute(d.id, 'RESOLVED')}
                    style={styles.flex}
                  />
                </View>
              )}
            </View>
          </React.Fragment>
        );
      })}
    </Surface>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { padding: space.lg, gap: space.sm },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  actions: { flexDirection: 'row', gap: space.md, paddingTop: space.sm },
});
