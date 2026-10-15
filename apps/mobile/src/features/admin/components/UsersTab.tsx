import React from 'react';
import type { TradeLink } from '../../../shared/types/provider';
import { StyleSheet, View } from 'react-native';
import { Briefcase, Calendar, Check, Eye, Search, Star, Trash2, Users, X } from 'lucide-react-native';
import { Avatar } from '../../../shared/ui/Avatar';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { IconButton } from '../../../shared/ui/IconButton';
import { Input } from '../../../shared/ui/Input';
import { SegmentedControl } from '../../../shared/ui/SegmentedControl';
import { Skeleton } from '../../../shared/ui/Skeleton';
import { StatusBadge } from '../../../shared/ui/StatusBadge';
import { Hairline, Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { radius, space } from '../../../shared/theme/tokens';
import { formatDate, toNumber } from '../../../shared/utils/format';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import type { AdminActions } from '../hooks/useAdminActions';
import type { AdminUser, UserRoleFilter } from '../schemas/admin.schema';
import { accountBadge } from '../utils/adminLabels';
import { ActionChip } from './ActionChip';

interface Props {
  users: AdminUser[];
  loading: boolean;
  search: string;
  onSearch: (text: string) => void;
  role: UserRoleFilter;
  onRoleChange: (role: UserRoleFilter) => void;
  actions: AdminActions;
  onOpenInterventions: (user: AdminUser) => void;
  onOpenDetails: (user: AdminUser) => void;
}

export function UsersTab({
  users,
  loading,
  search,
  onSearch,
  role,
  onRoleChange,
  actions,
  onOpenInterventions,
  onOpenDetails,
}: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();

  const visible = users.filter((u) => role === 'ALL' || u.role === role);

  return (
    <>
      <Input
        placeholder={t('adminSearchUsers')}
        accessibilityLabel={t('adminSearchUsers')}
        value={search}
        onChangeText={onSearch}
        autoCapitalize="none"
        autoCorrect={false}
        icon={<Search size={18} color={colors.textMuted} />}
      />

      <SegmentedControl<UserRoleFilter>
        options={[
          { key: 'ALL', label: t('filterAll') },
          { key: 'CLIENT', label: t('filterClients') },
          { key: 'PROVIDER', label: t('filterProviders') },
        ]}
        value={role}
        onChange={onRoleChange}
      />

      {loading && users.length === 0 ? (
        <View style={styles.list}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} style={styles.skeletonRow} />
          ))}
        </View>
      ) : visible.length === 0 ? (
        <Surface>
          <EmptyState icon={<Users size={24} color={colors.textMuted} />} title={t('noUsers')} />
        </Surface>
      ) : (
        <View style={styles.list}>
          {visible.map((u) => (
            <UserCard
              key={u.id}
              user={u}
              actions={actions}
              onOpenInterventions={onOpenInterventions}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </View>
      )}
    </>
  );
}

function UserCard({
  user,
  actions,
  onOpenInterventions,
  onOpenDetails,
}: {
  user: AdminUser;
  actions: AdminActions;
  onOpenInterventions: (user: AdminUser) => void;
  onOpenDetails: (user: AdminUser) => void;
}) {
  const colors = useThemeStore((state) => state.colors);
  const { t, language } = useTranslation();

  const isProvider = user.role === 'PROVIDER';
  const status = accountBadge(user.status, t);
  const registered = formatDate(user.createdAt, language);
  const rating = toNumber(user.providerProfile?.ratingAverage);
  const totalRatings = toNumber(user.providerProfile?.totalRatings) ?? 0;
  const reports = toNumber(user.disputesCount) ?? 0;
  const trades = (user.providerProfile?.categories as TradeLink[] | undefined) || [];

  return (
    <Surface>
      <View style={styles.header}>
        <Avatar
          uri={null}
          name={user.fullName}
          size={44}
          tint={isProvider ? { background: colors.brand, color: colors.onBrand } : undefined}
        />
        <View style={styles.flex}>
          <Txt variant="bodyStrong" numberOfLines={1}>
            {user.fullName}
          </Txt>
          <Txt variant="small" color={colors.textMuted} numberOfLines={1}>
            {user.email || user.phoneNumber}
          </Txt>
        </View>
      </View>

      <View style={styles.badges}>
        <StatusBadge label={isProvider ? t('provider') : t('client')} tone="neutral" icon="none" />
        <StatusBadge label={status.label} tone={status.tone} />
        {isProvider && reports > 0 && (
          <StatusBadge label={t('reportsCount').replace('{n}', String(reports))} tone="danger" icon="none" />
        )}
      </View>

      {/* What the admin needs to judge the account */}
      <View style={styles.facts}>
        {!isProvider && (
          <>
            {Boolean(registered) && (
              <Fact icon={<Calendar size={14} color={colors.textMuted} />}>
                {t('registeredOn').replace('{date}', registered)}
              </Fact>
            )}
            <Fact icon={<Briefcase size={14} color={colors.textMuted} />}>
              {t('ordersCount').replace('{n}', String(user.clientProfile?._count?.missions || 0))}
            </Fact>
          </>
        )}

        {isProvider && (
          <>
            <Txt variant="small" color={trades.length > 0 ? colors.textSecondary : colors.textMuted}>
              {trades.length > 0
                ? trades
                    .map((c) => c.category?.name)
                    .filter(Boolean)
                    .join(' · ')
                : t('noServiceListed')}
            </Txt>
            <Fact
              icon={
                <Star
                  size={14}
                  color={rating ? colors.star : colors.textMuted}
                  fill={rating ? colors.star : 'transparent'}
                />
              }
            >
              {rating
                ? `${rating.toFixed(1)} · ${t('reviewsCount').replace('{n}', String(totalRatings))}`
                : t('noReviewsYet')}
            </Fact>
            {reports === 0 && <Fact icon={<Check size={14} color={colors.textMuted} />}>{t('noReports')}</Fact>}
          </>
        )}
      </View>

      <Hairline />

      <View style={styles.actions}>
        <ActionChip
          label={t('interventions')}
          icon={<Briefcase size={15} color={colors.text} />}
          onPress={() => onOpenInterventions(user)}
        />

        <ActionChip
          label={t('userDetails')}
          icon={<Eye size={15} color={colors.text} />}
          onPress={() => onOpenDetails(user)}
        />

        {user.status === 'ACTIVE' ? (
          <ActionChip
            label={t('block')}
            tone="danger"
            icon={<X size={15} color={colors.dangerText} />}
            onPress={() => actions.setStatus(user.id, 'BLOCKED')}
          />
        ) : (
          <ActionChip
            label={t('reactivate')}
            icon={<Check size={15} color={colors.text} />}
            onPress={() => actions.setStatus(user.id, 'ACTIVE')}
          />
        )}

        <View style={styles.flex} />
        <IconButton
          accessibilityLabel={`${t('deleteUser')} ${user.fullName || ''}`}
          onPress={() => actions.setUserToDelete(user)}
        >
          <Trash2 size={17} color={colors.dangerText} />
        </IconButton>
      </View>
    </Surface>
  );
}

function Fact({ icon, children }: { icon: React.ReactNode; children: string }) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View style={styles.fact}>
      {icon}
      <Txt variant="small" color={colors.textSecondary}>
        {children}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { gap: space.md },
  skeletonRow: { height: 88, borderRadius: radius.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
  },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, paddingHorizontal: space.lg, paddingTop: space.md },
  facts: { gap: space.sm, padding: space.lg },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm, padding: space.md },
});
