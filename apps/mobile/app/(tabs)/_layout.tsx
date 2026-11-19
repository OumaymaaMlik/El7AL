import { StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabIcon } from '../../src/shared/ui/TabIcon';
import { useThemeStore } from '../../src/shared/store/useThemeStore';
import { useTranslation } from '../../src/shared/store/useLanguageStore';
import { useAuthStore } from '../../src/features/auth/store/useAuthStore';
import { useMissionStore } from '../../src/features/missions/store/useMissionStore';
import { useChatStore } from '../../src/features/chat/store/useChatStore';
import { useType } from '../../src/shared/theme/useType';
import { numeralFont } from '../../src/shared/theme/typography';
import { tabBarHeight } from '../../src/shared/theme/tokens';
import { CLIENT_ENABLED } from '../../src/config/env';
import { ClientComingSoon } from '../../src/features/home/components/ClientComingSoon';

/** The bar of the prototype: four plain icons with a label, the current one in green, no pill behind it. */
export default function TabsLayout() {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const type = useType();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const activeRole = useAuthStore((state) => state.activeRole);
  const searchPhase = useMissionStore((state) => state.searchPhase);
  const thanks = useMissionStore((state) => state.thanks);
  const unreadCounts = useChatStore((state) => state.unreadCounts);

  const totalUnreadCount = Object.values(unreadCounts).reduce((acc, c) => acc + (c || 0), 0);

  const isProvider = activeRole === 'PROVIDER' || user?.role === 'PROVIDER';
  // The prototype's bar always has four tabs: Accueil, Demandes (Missions for the artisan), Messages, Profil.
  const showTracking = true;

  const bottomInset = Math.max(insets.bottom, 10);

  // The client side is not open yet: clients see "coming soon" instead of the app.
  if (!CLIENT_ENABLED && user?.role === 'CLIENT' && !isProvider) return <ClientComingSoon />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Switching tab is a quick crossfade, as in the prototype (250 ms).
        animation: 'fade',
        transitionSpec: { animation: 'timing', config: { duration: 250 } },
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: tabBarHeight + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 12,
          paddingHorizontal: 8,
          elevation: 0,
          shadowOpacity: 0,
          // The searching page fills the screen, like the prototype's.
          display: (searchPhase !== 'idle' && !isProvider) || thanks ? 'none' : 'flex',
        },
        tabBarItemStyle: styles.item,
        tabBarActiveTintColor: colors.accentText,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: type.captionStrong.fontFamily,
          fontSize: 11,
          lineHeight: 15,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('accueil'),
          tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={color} strokeWidth={focused ? 2.4 : 2} />,
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          title: isProvider ? t('missionsTab') : t('requestsTab'),
          href: showTracking ? '/(tabs)/tracking' : null,
          tabBarItemStyle: { ...styles.item, display: showTracking ? 'flex' : 'none' },
          tabBarIcon: ({ color, focused }) => <TabIcon name="list" color={color} strokeWidth={focused ? 2.4 : 2} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t('messages') || t('chat') || 'Messages',
          tabBarBadge: totalUnreadCount > 0 ? (totalUnreadCount > 99 ? '99+' : totalUnreadCount) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.action,
            color: colors.onAction,
            fontSize: 10,
            fontFamily: numeralFont,
            fontWeight: '700',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            lineHeight: 14,
            alignSelf: 'center',
          },
          tabBarIcon: ({ color, focused }) => <TabIcon name="chat" color={color} strokeWidth={focused ? 2.4 : 2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profil') || 'Profil',
          tabBarIcon: ({ color, focused }) => <TabIcon name="user" color={color} strokeWidth={focused ? 2.4 : 2} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  item: { minWidth: 64 },
});
