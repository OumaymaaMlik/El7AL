import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AlertTriangle, Briefcase, Layers, ShieldCheck, TrendingUp, Users, Wallet } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Txt } from '../../../shared/ui/Txt';
import { gutter, hitTarget, radius, space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import type { AdminTab } from '../schemas/admin.schema';

interface Props {
  active: AdminTab;
  onChange: (tab: AdminTab) => void;
  /** Waiting items per tab (artisans to verify, transfers, disputes), shown next to the label. */
  counts?: Partial<Record<AdminTab, number>>;
}

export function AdminTabBar({ active, onChange, counts = {} }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();

  const tabs: { key: AdminTab; label: string; Icon: LucideIcon }[] = [
    { key: 'ANALYTICS', label: t('adminAnalytics'), Icon: TrendingUp },
    { key: 'VERIFICATIONS', label: t('adminVerifications'), Icon: ShieldCheck },
    { key: 'USERS', label: t('adminUsers'), Icon: Users },
    { key: 'MISSIONS', label: t('adminMissions'), Icon: Briefcase },
    { key: 'SERVICES', label: t('adminServices'), Icon: Layers },
    { key: 'TOPUPS', label: t('adminWireTransfers'), Icon: Wallet },
    { key: 'DISPUTES', label: t('adminDisputes'), Icon: AlertTriangle },
  ];

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        accessibilityRole="tablist"
      >
        {tabs.map(({ key, label, Icon }) => {
          const isActive = active === key;
          const color = isActive ? colors.onBrand : colors.textSecondary;
          return (
            <Pressable
              key={key}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              onPress={() => onChange(key)}
              style={[
                styles.tab,
                {
                  borderColor: isActive ? colors.brand : colors.border,
                  backgroundColor: isActive ? colors.brand : colors.surface,
                },
              ]}
            >
              <Icon size={16} color={color} />
              <Txt variant="smallStrong" color={color}>
                {label}
              </Txt>
              {Boolean(counts[key]) && (
                <View style={[styles.count, { backgroundColor: isActive ? colors.live : colors.brand }]}>
                  <Txt style={[styles.countText, { color: isActive ? colors.onLive : '#FFFFFF' }]}>{counts[key]}</Txt>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: gutter, paddingBottom: space.md, gap: space.sm },
  tab: {
    minHeight: hitTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  count: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { fontSize: 11, lineHeight: 14, fontWeight: '700' },
});
