import React, { useState } from 'react';
import { noSelect } from '../../../shared/theme/webStyles';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HistoryModal } from '../../history/components/HistoryModal';
import { InstagramPullToRefresh } from '../../../shared/ui/InstagramPullToRefresh';
import { LanguagePickerSheet } from '../../../shared/ui/LanguageToggle';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { Skeleton } from '../../../shared/ui/Skeleton';
import { gutter, radius, space, tabBarHeight } from '../../../shared/theme/tokens';
import { useLoadingStore } from '../../../shared/store/useLoadingStore';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { ROUTES } from '../../../navigation/routes';
import { OtpVerificationSheet, useAuthStore } from '../../auth';
import { AddressMapSheet } from '../../map/components/AddressMapSheet';
import { AccountSection } from '../components/AccountSection';
import { AvailabilityCard } from '../components/AvailabilityCard';
import { BalanceCard } from '../components/BalanceCard';
import { ChangePasswordSheet } from '../components/ChangePasswordSheet';
import { DeleteAccountSheet } from '../components/DeleteAccountSheet';
import { PrivacyPolicySheet } from '../components/PrivacyPolicySheet';
import { EditProfileSheet } from '../components/EditProfileSheet';
import { AvatarZoomDialog, LogoutDialog } from '../components/ProfileDialogs';
import { ProfileActions } from '../components/ProfileActions';
import { ProfileIdentity } from '../components/ProfileIdentity';
import { SettingsSection } from '../components/SettingsSection';
import { useEditProfile } from '../hooks/useEditProfile';
import { useProfile } from '../hooks/useProfile';
import { confirmEmailChange, requestEmailChange } from '../api/profile.api';

export function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const logout = useAuthStore((state) => state.logout);
  const activeRole = useAuthStore((state) => state.activeRole);
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);

  const data = useProfile();
  const edit = useEditProfile({
    profile: data.profile,
    loadedVersion: data.loadedVersion,
    onSaved: data.setProfile,
  });
  const { activeUser, isProviderUser, isAdminUser } = data;

  const [historyOpen, setHistoryOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [avatarZoomOpen, setAvatarZoomOpen] = useState(false);

  const handleLogout = async () => {
    setLogoutOpen(false);
    showLoading('Déconnexion en cours', 'À bientôt sur El 7al');
    try {
      await logout();
      router.replace(ROUTES.welcome);
    } finally {
      setTimeout(hideLoading, 400);
    }
  };

  const bottomInset = Math.max(insets.bottom, 10);
  const roleLabel = isProviderUser ? t('provider') : isAdminUser ? t('adminMode') : t('client');

  return (
    <InstagramPullToRefresh
      refreshing={data.refreshing}
      onRefresh={data.refresh}
      headerComponent={<ScreenHeader title={t('profil')} trailing={null} />}
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + bottomInset + space.xxl }]}
      showsVerticalScrollIndicator={false}
    >
      {data.fetching && !activeUser ? (
        <>
          <Skeleton style={{ height: 88, borderRadius: radius.md }} />
          <Skeleton style={{ height: 120, borderRadius: radius.lg }} />
          <Skeleton style={{ height: 220, borderRadius: radius.md }} />
        </>
      ) : (
        <>
          <ProfileIdentity
            name={activeUser?.fullName}
            phone={activeUser?.phoneNumber}
            roleLabel={roleLabel}
            avatarUrl={edit.avatarUrl}
            avatarFailed={edit.avatarFailed}
            onAvatarError={() => edit.setAvatarFailed(true)}
            onAvatarPress={() => {
              if (edit.avatarUrl && !edit.avatarFailed) setAvatarZoomOpen(true);
            }}
            onEdit={() => edit.setEditOpen(true)}
          />

          {isProviderUser && <BalanceCard amount={data.balance} />}

          {(data.profile?.role === 'PROVIDER' || data.profile?.providerProfile) && (
            <AvailabilityCard available={data.isProviderAvailable} onChange={data.toggleAvailability} />
          )}

          <AccountSection
            fullName={activeUser?.fullName}
            phoneNumber={activeUser?.phoneNumber}
            email={activeUser?.email}
            isProvider={isProviderUser}
            professions={data.professions}
            address={data.address}
            verified={data.isVerified}
          />

          <SettingsSection onOpenLanguage={() => setLanguageOpen(true)} />

          <ProfileActions
            isAdmin={isAdminUser}
            onOpenHistory={() => setHistoryOpen(true)}
            onOpenAdmin={() => router.push(ROUTES.adminDashboard)}
            onLogout={() => setLogoutOpen(true)}
            onOpenPrivacy={() => setPrivacyOpen(true)}
            onDeleteAccount={() => setDeleteOpen(true)}
          />
        </>
      )}

      <HistoryModal
        visible={historyOpen}
        onClose={() => setHistoryOpen(false)}
        userRole={activeRole === 'PROVIDER' || isProviderUser ? 'PROVIDER' : 'CLIENT'}
      />
      <LanguagePickerSheet visible={languageOpen} onClose={() => setLanguageOpen(false)} />
      <PrivacyPolicySheet visible={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <DeleteAccountSheet visible={deleteOpen} onClose={() => setDeleteOpen(false)} onDeleted={handleLogout} />
      <LogoutDialog visible={logoutOpen} onClose={() => setLogoutOpen(false)} onConfirm={handleLogout} />
      <AvatarZoomDialog
        visible={avatarZoomOpen}
        onClose={() => setAvatarZoomOpen(false)}
        title={activeUser?.fullName || t('profil')}
        uri={edit.avatarUrl}
      />

      <EditProfileSheet form={edit} isClient={data.profile?.role === 'CLIENT'} displayName={activeUser?.fullName} />
      <ChangePasswordSheet form={edit} />
      <AddressMapSheet
        visible={edit.mapOpen}
        lat={edit.lat}
        lng={edit.lng}
        onClose={() => edit.setMapOpen(false)}
        onSelect={edit.selectMapLocation}
      />
      <OtpVerificationSheet
        visible={edit.otpVisible}
        onClose={() => edit.setOtpVisible(false)}
        onVerify={edit.performSave}
        identifier={edit.otpIdentifier}
        sendCode={requestEmailChange}
        checkCode={confirmEmailChange}
        loading={edit.saving}
      />
    </InstagramPullToRefresh>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...noSelect },
  content: { paddingHorizontal: gutter, paddingTop: space.xs, gap: space.xxl },
});
