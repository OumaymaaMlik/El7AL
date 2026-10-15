import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Navigation, MessageCircle } from 'lucide-react-native';
import { useThemeStore } from '../../src/shared/store/useThemeStore';
import { useTranslation } from '../../src/shared/store/useLanguageStore';
import { useAuthStore } from '../../src/features/auth/store/useAuthStore';
import { useMissionStore } from '../../src/features/missions/store/useMissionStore';
import { useChatStore } from '../../src/features/chat/store/useChatStore';
import { useType } from '../../src/shared/theme/useType';
import { numeralFont } from '../../src/shared/theme/typography';
import { tabBarHeight } from '../../src/shared/theme/tokens';

interface NavAvatarProps {
  focused: boolean;
  avatarUrl: string | null;
  colors: ReturnType<typeof useThemeStore.getState>['colors'];
  initials: string;
}

const NavAvatar = ({ focused, avatarUrl, colors, initials }: NavAvatarProps) => {
  const [failed, setFailed] = React.useState(false);

  return (
    <View
      style={[
        styles.navAvatarBox,
        {
          backgroundColor: colors.raised,
          borderColor: focused ? colors.accentText : 'transparent',
        },
      ]}
    >
      {avatarUrl && !failed ? (
        <Image 
          source={{ uri: avatarUrl }} 
          style={styles.navAvatarImage} 
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={[styles.navAvatarText, { color: colors.text }]}>{initials}</Text>
      )}
    </View>
  );
};

export default function TabsLayout() {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const type = useType();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const { isSearching, activePairingProvider, activeMission, searchingMissionId } = useMissionStore();
  const unreadCounts = useChatStore((state) => state.unreadCounts);

  const totalUnreadCount = Object.values(unreadCounts).reduce((acc, c) => acc + (c || 0), 0);

  const hasActiveIntervention = Boolean(activePairingProvider || isSearching || activeMission || searchingMissionId);

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'KA';

  const bottomInset = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
          paddingTop: 6,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: colors.accentText,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: type.captionStrong.fontFamily,
          fontSize: 12,
          lineHeight: 16,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('accueil'),
          tabBarIcon: ({ color, focused }) => <Home size={22} color={color} strokeWidth={focused ? 2.4 : 2} />,
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          title: t('suivi'),
          href: hasActiveIntervention ? '/(tabs)/tracking' : null,
          tabBarItemStyle: {
            display: hasActiveIntervention ? 'flex' : 'none',
          },
          tabBarIcon: ({ color, focused }) => <Navigation size={22} color={color} strokeWidth={focused ? 2.4 : 2} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t('messages') || t('chat') || 'Messages',
          tabBarBadge: totalUnreadCount > 0 ? (totalUnreadCount > 99 ? '99+' : totalUnreadCount) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            fontSize: 10,
            fontFamily: numeralFont,
            fontWeight: '700',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            lineHeight: 14,
            alignSelf: 'center',
          },
          tabBarIcon: ({ color, focused }) => <MessageCircle size={22} color={color} strokeWidth={focused ? 2.4 : 2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profil') || 'Profil',
          tabBarIcon: ({ focused }) => (
            <NavAvatar focused={focused} avatarUrl={typeof user?.avatarUrl === 'string' ? user.avatarUrl : null} colors={colors} initials={initials} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  navAvatarBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navAvatarText: {
    fontFamily: numeralFont,
    fontSize: 12,
  },
  navAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 13,
  },
});
