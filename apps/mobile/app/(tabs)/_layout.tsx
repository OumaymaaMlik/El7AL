import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
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
          backgroundColor: colors.brand,
          borderColor: focused ? colors.accentText : 'transparent',
        },
      ]}
    >
      {avatarUrl && !failed ? (
        <Image source={{ uri: avatarUrl }} style={styles.navAvatarImage} onError={() => setFailed(true)} />
      ) : (
        <Text style={[styles.navAvatarText, { color: colors.onBrand }]}>{initials}</Text>
      )}
    </View>
  );
};

const TAB_ITEM = { marginHorizontal: 3, marginBottom: 2 } as const;

/** A tab button whose current tab is drawn on a pill (the navigation library cannot round that highlight). */
function TabButton({
  style,
  children,
  onPress,
  onLongPress,
  accessibilityLabel,
  testID,
  'aria-selected': ariaSelected,
}: TabButtonProps) {
  const colors = useThemeStore((state) => state.colors);
  const selected = Boolean(ariaSelected);
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={onPress as PressableProps['onPress']}
      onLongPress={onLongPress as PressableProps['onLongPress']}
      style={[style, styles.tabButton, { backgroundColor: selected ? colors.tint : 'transparent' }]}
    >
      {children}
    </Pressable>
  );
}

// The navigator passes more props than a plain Pressable needs; these are the ones the button uses.
type TabButtonProps = Pick<PressableProps, 'onLongPress' | 'accessibilityLabel' | 'testID'> & {
  'aria-selected'?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: unknown;
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
          paddingTop: 8,
          paddingHorizontal: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        // The current tab sits on a pill, as in the redesign.
        tabBarButton: (props) => <TabButton {...props} />,
        tabBarItemStyle: TAB_ITEM,
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
          tabBarIcon: ({ color, focused }) => <Home size={22} color={color} strokeWidth={focused ? 2.4 : 2} />,
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          title: t('suivi'),
          href: hasActiveIntervention ? '/(tabs)/tracking' : null,
          tabBarItemStyle: {
            ...TAB_ITEM,
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
          tabBarIcon: ({ color, focused }) => <MessageCircle size={22} color={color} strokeWidth={focused ? 2.4 : 2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profil') || 'Profil',
          tabBarIcon: ({ focused }) => (
            <NavAvatar
              focused={focused}
              avatarUrl={typeof user?.avatarUrl === 'string' ? user.avatarUrl : null}
              colors={colors}
              initials={initials}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    borderRadius: 999,
  },
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
