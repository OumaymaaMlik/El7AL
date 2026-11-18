import { useEffect, useState } from 'react';
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
import { useActiveMissionSync } from '../../missions/hooks/useActiveMissionSync';
import { useMissionFlow } from '../../missions/hooks/useMissionFlow';
import { useMissionSearch } from '../../missions/hooks/useMissionSearch';
import { useMissionStore } from '../../missions/store/useMissionStore';
import { isMissionActive } from '../../missions/utils/missionState';
import { ArtisanBody } from '../components/ArtisanBody';
import { ArtisanHeader } from '../components/ArtisanHome';
import { CategoryGrid } from '../components/CategoryGrid';
import { ThanksPage } from '../../missions/components/ThanksPage';
import { ActiveMissionPill } from '../components/ActiveMissionPill';
import { HomeMissionModals } from '../components/HomeMissionModals';
import { CoachTip } from '../components/CoachTip';
import { ClientSearch } from '../components/ClientSearch';
import { LocationPrompt } from '../components/LocationPrompt';
import { useLocationGate } from '../hooks/useLocationGate';
import { HomeActionBar } from '../components/HomeActionBar';
import { HomeHeader } from '../components/HomeHeader';
import { LiveDot } from '../../../shared/ui/LiveDot';
import { VerificationBanner } from '../components/VerificationBanner';
import { RequestSheet } from '../components/RequestSheet';
import { onlineCountOf, useCategoryStats } from '../hooks/useCategoryStats';
import { useSearchPhase } from '../hooks/useSearchPhase';
import { useProviderDashboard } from '../hooks/useProviderDashboard';
import { useServiceRequest } from '../hooks/useServiceRequest';

const ACTION_BAR_HEIGHT = 100;

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
  const partner = useMissionStore((state) => state.activePairingProvider);
  const thanks = useMissionStore((state) => state.thanks);
  const setThanks = useMissionStore((state) => state.setThanks);
  const missionActive = useMissionStore(isMissionActive);

  const { locStep, setLocStep, locBusy, allowLocation } = useLocationGate(isProviderRole);

  const request = useServiceRequest(!isProviderRole && locStep === 'ready');
  const flow = useMissionFlow();
  const search = useMissionSearch();
  const { phase, dismiss } = useSearchPhase(isSearching, Boolean(partner), search.noArtisanOpen);
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

  // The slide bar is always at the bottom for a client (a hint before a choice, the slide after it).
  const showActionBar = !isProviderRole && !partner && !isSearching && !missionActive;
  const bottomInset = Math.max(insets.bottom, 10);
  const contentPaddingBottom =
    tabBarHeight + bottomInset + space.xxl + (showActionBar ? ACTION_BAR_HEIGHT : 0) + (missionActive ? 72 : 0);
  const { onlineTotal, popularId } = useCategoryStats(request.categories);

  if (!isProviderRole && locStep === 'prompt') {
    return <LocationPrompt busy={locBusy} onAllow={allowLocation} onTypeAddress={() => setLocStep('ready')} />;
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <InstagramPullToRefresh
        refreshing={refreshing}
        onRefresh={refresh}
        headerComponent={
          isProviderRole ? (
            <ArtisanHeader
              stats={dashboard.stats}
              trade={
                (
                  dashboard.providerProfile?.categories as { category?: { name?: string }; name?: string }[] | undefined
                )?.[0]?.category?.name ?? null
              }
              available={dashboard.isProviderAvailable}
              onToggleAvailability={dashboard.toggleAvailability}
            />
          ) : (
            <HomeHeader locationText={request.locationText} />
          )
        }
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.content, { paddingBottom: contentPaddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
        {isProviderRole ? (
          <>
            <VerificationBanner />
            <ArtisanBody
              due={Math.max(0, -(dashboard.stats.walletBalance ?? 0))}
              available={dashboard.isProviderAvailable}
              missionActive={missionActive}
              completed={dashboard.completedMissions}
            />
          </>
        ) : (
          <>
            <View>
              <View style={styles.titleRow}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: type.title.fontFamily }]}>
                  {t('whichService')}
                </Text>
                {onlineTotal > 0 && (
                  <View style={styles.onlineNow}>
                    <LiveDot />
                    <Text
                      style={[
                        styles.onlineText,
                        { color: colors.textMuted, fontFamily: type.captionStrong.fontFamily },
                      ]}
                    >
                      {t('onlineCount').replace('{n}', String(onlineTotal))}
                    </Text>
                  </View>
                )}
              </View>
              <CategoryGrid
                categories={request.categories}
                loading={request.loadingCategories}
                error={request.categoriesError}
                selectedId={request.selectedCategory?.id}
                popularId={popularId}
                onSelect={request.toggleCategory}
                onRetry={request.loadCategories}
              />
            </View>
          </>
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

        <HomeMissionModals flow={flow} />
      </InstagramPullToRefresh>

      {!isProviderRole && showActionBar && locStep === 'ready' && !request.selectedCategory && !thanks && (
        <CoachTip bottom={tabBarHeight + bottomInset + ACTION_BAR_HEIGHT + 8} />
      )}

      {/* After the rating, the green "Merci" page closes the job. */}
      {!isProviderRole && thanks && (
        <ThanksPage
          data={thanks}
          onHome={() => setThanks(null)}
          onRequests={() => {
            setThanks(null);
            router.push('/(tabs)/tracking');
          }}
        />
      )}

      {/* While the request is out, the radar page slides in over the home page. */}
      {!isProviderRole && phase !== 'idle' && (
        <ClientSearch
          phase={phase}
          online={onlineCountOf(request.selectedCategory) || onlineTotal}
          provider={partner}
          onCancel={() => {
            search.setNoArtisanOpen(false);
            dismiss();
            if (phase === 'searching') void search.cancelSearch();
          }}
          onTrack={() => {
            dismiss();
            router.push('/(tabs)/tracking');
          }}
          onRetry={() => {
            search.setNoArtisanOpen(false);
            dismiss();
            void request.submit();
          }}
        />
      )}

      {!isProviderRole && missionActive && !isSearching && (
        <ActiveMissionPill bottom={tabBarHeight + bottomInset + 10} onPress={() => router.push('/(tabs)/tracking')} />
      )}

      {/* Docked action bar once a service is selected */}
      {!isProviderRole && !missionActive && !isSearching && (
        <HomeActionBar
          category={request.selectedCategory}
          visible
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
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { fontSize: 30, lineHeight: 33, letterSpacing: -0.5 },
  onlineNow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 3 },
  onlineText: { fontSize: 13, lineHeight: 17 },
});
