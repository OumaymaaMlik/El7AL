import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogOut } from 'lucide-react-native';
import { IconButton } from '../../../shared/ui/IconButton';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { gutter, space } from '../../../shared/theme/tokens';
import { useLoadingStore } from '../../../shared/store/useLoadingStore';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { ROUTES } from '../../../navigation/routes';
import { useAuthStore } from '../../auth';
import { useNotificationStore } from '../../notifications';
import { getSocket } from '../../../services/socket/socket.client';
import { onServerEvent } from '../../../services/socket/typedEvents';
import { AdminDialogs } from '../components/AdminDialogs';
import { AdminTabBar } from '../components/AdminTabBar';
import { AnalyticsTab, MissionsTab, TopupsTab } from '../components/AdminTabs';
import { CategoryFormSheet } from '../components/CategoryFormSheet';
import { DisputesTab } from '../components/DisputesTab';
import { ServicesTab } from '../components/ServicesTab';
import { UserDetailsSheet } from '../components/UserDetailsSheet';
import { VerificationsTab } from '../components/VerificationsTab';
import { UserInterventionsSheet } from '../components/UserInterventionsSheet';
import { UsersTab } from '../components/UsersTab';
import { useAdminActions } from '../hooks/useAdminActions';
import { useAdminData } from '../hooks/useAdminData';
import { useUserInterventions } from '../hooks/useUserInterventions';
import type { AdminTab, AdminUser, UserRoleFilter } from '../schemas/admin.schema';
import { toNumber } from '../../../shared/utils/format';

export function AdminDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);

  const [tab, setTab] = useState<AdminTab>('ANALYTICS');
  const [userSearch, setUserSearch] = useState('');
  const [userRole, setUserRole] = useState<UserRoleFilter>('ALL');
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [detailsUser, setDetailsUser] = useState<AdminUser | null>(null);

  const data = useAdminData(tab, userSearch, userRole);
  const actions = useAdminActions(data.reload);
  const interventions = useUserInterventions();
  const flashToast = useNotificationStore((state) => state.flashToast);
  const reload = data.reload;

  // A new artisan finished registering: tell the admin at once, wherever they are in the portal.
  useEffect(() => {
    return onServerEvent(getSocket(), 'admin:artisan_pending', (artisan) => {
      flashToast({
        title: t('newArtisanAlertTitle'),
        message: t('newArtisanAlertBody').replace('{name}', artisan.fullName),
        tone: 'info',
      });
      reload();
    });
  }, [flashToast, reload, t]);

  const counts = {
    VERIFICATIONS: toNumber(data.stats?.pendingVerifications) ?? 0,
    TOPUPS: toNumber(data.stats?.pendingWireTransfers) ?? 0,
    DISPUTES: toNumber(data.stats?.totalDisputes) ?? 0,
  };

  // Guard: only an authenticated ADMIN can see this screen.
  useEffect(() => {
    if (!user) router.replace(ROUTES.login);
    else if (user.role !== 'ADMIN') router.replace(ROUTES.home);
  }, [user, router]);

  const handleLogout = async () => {
    showLoading('Déconnexion en cours', 'À bientôt sur El 7al');
    try {
      await logout();
      router.replace(ROUTES.login);
    } finally {
      setTimeout(hideLoading, 400);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={t('adminPortalTitle')}
        subtitle={t('adminPanelSub')}
        trailing={
          <IconButton accessibilityLabel={t('logoutAdmin')} onPress={() => setLogoutOpen(true)}>
            <Mirrored>
              <LogOut size={18} color={colors.dangerText} />
            </Mirrored>
          </IconButton>
        }
      />

      <AdminTabBar active={tab} onChange={setTab} counts={counts} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, space.lg) + space.xl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {tab === 'ANALYTICS' && <AnalyticsTab stats={data.stats} loading={data.loading} />}
        {tab === 'VERIFICATIONS' && (
          <VerificationsTab providers={data.providers} loading={data.loading} actions={actions} />
        )}
        {tab === 'USERS' && (
          <UsersTab
            users={data.users}
            loading={data.loading}
            search={userSearch}
            onSearch={setUserSearch}
            role={userRole}
            onRoleChange={setUserRole}
            actions={actions}
            onOpenInterventions={interventions.openForUser}
            onOpenDetails={setDetailsUser}
          />
        )}
        {tab === 'MISSIONS' && (
          <MissionsTab missions={data.missions} loading={data.loading} onOpen={interventions.openDetail} />
        )}
        {tab === 'SERVICES' && <ServicesTab categories={data.categories} loading={data.loading} actions={actions} />}
        {tab === 'TOPUPS' && <TopupsTab topups={data.topups} loading={data.loading} actions={actions} />}
        {tab === 'DISPUTES' && <DisputesTab disputes={data.disputes} loading={data.loading} actions={actions} />}
      </ScrollView>

      <UserInterventionsSheet state={interventions} />
      <UserDetailsSheet user={detailsUser} onClose={() => setDetailsUser(null)} />
      <CategoryFormSheet
        category={actions.categoryForm}
        saving={actions.categorySaving}
        onSave={actions.saveCategory}
        onClose={() => actions.setCategoryForm(undefined)}
      />
      <AdminDialogs
        actions={actions}
        logoutOpen={logoutOpen}
        onCloseLogout={() => setLogoutOpen(false)}
        onLogout={handleLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: { paddingHorizontal: gutter, paddingTop: space.xs, gap: space.lg },
});
