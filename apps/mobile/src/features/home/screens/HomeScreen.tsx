import React, { useEffect, useState } from 'react';
import { noSelect } from '../../../shared/theme/webStyles';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gutter, space, tabBarHeight } from '../../../shared/theme/tokens';
import { useType } from '../../../shared/theme/useType';
import { InstagramPullToRefresh } from '../../../shared/ui/InstagramPullToRefresh';
import { joinUserRoom } from '../../../services/socket/socket.client';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { ROUTES } from '../../../navigation/routes';
import { useAuthStore } from '../../auth';
import { DirectPaymentModal } from '../../missions/components/DirectPaymentModal';
import { DualCompletionModal } from '../../missions/components/DualCompletionModal';
import { LiveGpsNavigationModal } from '../../missions/components/LiveGpsNavigationModal';
import { ProviderReviewReceivedModal } from '../../missions/components/ProviderReviewReceivedModal';
import { RatingModal } from '../../missions/components/RatingModal';
import { useActiveMissionSync } from '../../missions/hooks/useActiveMissionSync';
import { useMissionFlow } from '../../missions/hooks/useMissionFlow';
import { useMissionSearch } from '../../missions/hooks/useMissionSearch';
import { useMissionStore } from '../../missions/store/useMissionStore';
import { isMissionActive } from '../../missions/utils/missionState';
import { RecentClients, StatLedger } from '../components/ArtisanStats';
import { CategoryGrid } from '../components/CategoryGrid';
import { ClientHero } from '../components/ClientHero';
import { HomeActionBar } from '../components/HomeActionBar';
import { HomeHeader } from '../components/HomeHeader';
import { NoArtisanDialog } from '../components/NoArtisanDialog';
import { PartnerRow } from '../components/PartnerRow';
import { VerificationBanner } from '../components/VerificationBanner';
import { ProviderHero } from '../components/ProviderHero';
import { RequestSheet } from '../components/RequestSheet';
import { useProviderDashboard } from '../hooks/useProviderDashboard';
import { useServiceRequest } from '../hooks/useServiceRequest';

const ACTION_BAR_HEIGHT = 142;

export function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeStore((state) => state.colors);
  const type = useType();
  const { t } = useTranslation();

  const user = useAuthStore((state) => state.user);
  const activeRole = useAuthStore((state) => state.activeRole);
  const isProviderRole = activeRole === 'PROVIDER' || user?.role === 'PROVIDER';

  const isSearching = useMissionStore((state) => state.isSearching);
  const searchingMissionId = useMissionStore((state) => state.searchingMissionId);
  const partner = useMissionStore((state) => state.activePairingProvider);
  const activeMission = useMissionStore((state) => state.activeMission);
  const distanceKm = useMissionStore((state) => state.distanceKm);
  const etaMinutes = useMissionStore((state) => state.etaMinutes);
  const reviewData = useMissionStore((state) => state.reviewData);
  const setReviewData = useMissionStore((state) => state.setReviewData);
  const missionActive = useMissionStore(isMissionActive);

  const request = useServiceRequest(!isProviderRole);
  const flow = useMissionFlow();
  const search = useMissionSearch();
  const { history, completedCount, sync } = useActiveMissionSync(isProviderRole);
  const dashboard = useProviderDashboard(history, completedCount);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.role === 'ADMIN') router.replace(ROUTES.adminDashboard);
  }, [user?.role, router]);

  // Socket listeners for mission events live in GlobalSocketListener so they fire app-wide.
  useEffect(() => {
    sync();
    if (isProviderRole && user?.id) dashboard.load();
    if (user?.id) joinUserRoom(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isProviderRole]);

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([request.loadCategories(), sync(), isProviderRole ? dashboard.load() : Promise.resolve()]);
    setRefreshing(false);
  };

  const openChat = () => router.push({ pathname: '/(tabs)/chat', params: { missionId: searchingMissionId || '' } });

  const showActionBar = !isProviderRole && Boolean(request.selectedCategory) && !partner && !isSearching;
  const bottomInset = Math.max(insets.bottom, 10);
  const contentPaddingBottom = tabBarHeight + bottomInset + space.xxl + (showActionBar ? ACTION_BAR_HEIGHT : 0);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <InstagramPullToRefresh
        refreshing={refreshing}
        onRefresh={refresh}
        headerComponent={<HomeHeader isProvider={isProviderRole} locationText={request.locationText} />}
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.content, { paddingBottom: contentPaddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
        {isProviderRole && <VerificationBanner />}

        {isProviderRole ? (
          <ProviderHero
            flow={flow}
            available={dashboard.isProviderAvailable}
            onToggleAvailability={dashboard.toggleAvailability}
            onOpenChat={openChat}
          />
        ) : (
          <ClientHero
            missionActive={missionActive}
            flow={flow}
            needText={request.needText}
            onChangeNeed={request.changeNeed}
            onFindArtisan={request.openSheet}
            onCancelSearch={search.cancelSearch}
            onOpenChat={openChat}
          />
        )}

        {partner && <PartnerRow partner={partner} isProviderRole={isProviderRole} />}

        {isProviderRole ? (
          <>
            <StatLedger stats={dashboard.stats} onOpenHistory={() => router.push('/(tabs)/tracking')} />
            <RecentClients missions={dashboard.completedMissions} />
          </>
        ) : (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: type.heading.fontFamily }]}>
              {t('allServicesTitle')}
            </Text>
            <CategoryGrid
              categories={request.categories}
              loading={request.loadingCategories}
              error={request.categoriesError}
              selectedId={request.selectedCategory?.id}
              onSelect={request.toggleCategory}
              onRetry={request.loadCategories}
            />
          </View>
        )}

        <RequestSheet
          visible={request.sheetOpen}
          onClose={() => request.setSheetOpen(false)}
          categories={request.categories}
          selectedCategory={request.selectedCategory}
          onSelectCategory={request.chooseCategory}
          needText={request.needText}
          onChangeNeed={request.changeNeed}
          locationText={request.locationText}
          onChangeLocation={request.setLocationText}
          onSubmit={request.submit}
          submitting={request.submitting}
          errors={request.formErrors}
        />

        <LiveGpsNavigationModal
          visible={flow.gpsOpen}
          onClose={() => flow.setGpsOpen(false)}
          onStartDrive={flow.startDrive}
          destinationAddress={activeMission?.addressText ?? undefined}
          destinationLat={activeMission?.pickupLat}
          destinationLng={activeMission?.pickupLng}
          distanceKm={distanceKm}
          etaMinutes={etaMinutes}
          loading={flow.actionLoading}
        />
        <DualCompletionModal
          visible={flow.dualOpen}
          onConfirm={flow.clientConfirm}
          onClose={() => flow.setDualOpen(false)}
          loading={flow.actionLoading}
        />
        <DirectPaymentModal
          visible={flow.paymentOpen}
          onProceed={flow.submitPayment}
          onClose={() => flow.setPaymentOpen(false)}
          loading={flow.actionLoading}
        />
        <RatingModal
          visible={flow.ratingOpen}
          onSubmit={flow.submitRating}
          onClose={() => flow.setRatingOpen(false)}
          loading={flow.actionLoading}
        />
        <ProviderReviewReceivedModal visible={!!reviewData} data={reviewData} onClose={() => setReviewData(null)} />
        <NoArtisanDialog visible={search.noArtisanOpen} onClose={() => search.setNoArtisanOpen(false)} />
      </InstagramPullToRefresh>

      {/* Docked action bar once a service is selected */}
      {!isProviderRole && !missionActive && !isSearching && (
        <HomeActionBar
          category={request.selectedCategory}
          visible={showActionBar}
          bottomOffset={tabBarHeight + bottomInset}
          onConfirm={request.openSheet}
          onNotifyAvailable={request.notifyWhenAvailable}
          loading={request.submitting}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1, ...noSelect },
  content: { paddingHorizontal: gutter, paddingTop: space.xs, gap: space.xxl },
  sectionTitle: { fontSize: 20, lineHeight: 24, fontWeight: '800', letterSpacing: -0.4, marginBottom: 12 },
});
