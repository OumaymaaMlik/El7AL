import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CheckCircle2, MessageSquare, Search } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { Txt } from '../../../shared/ui/Txt';
import { inputReset, hitTarget, radius, space } from '../../../shared/theme/tokens';
import { useType } from '../../../shared/theme/useType';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useAuthStore } from '../../auth';
import { useMissionStore } from '../../missions/store/useMissionStore';
import type { MissionFlow } from '../../missions/hooks/useMissionFlow';
import { clientHeadline, clientStatusLabel } from '../utils/missionLabels';
import { HeroNumeral, HeroPanel, HeroStatus } from '../../../shared/ui/HeroPanel';
import { MissionHero } from './MissionHero';
import { heroStyles } from './heroStyles';

interface Props {
  missionActive: boolean;
  flow: MissionFlow;
  needText: string;
  onChangeNeed: (text: string) => void;
  onFindArtisan: () => void;
  onCancelSearch: () => void;
  onOpenChat: () => void;
}

/** Client hero: active mission, artisan search in progress, or the "describe your need" panel. */
export function ClientHero({
  missionActive,
  flow,
  needText,
  onChangeNeed,
  onFindArtisan,
  onCancelSearch,
  onOpenChat,
}: Props) {
  const colors = useThemeStore((state) => state.colors);
  const type = useType();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const status = useMissionStore((state) => state.missionStatus);
  const isSearching = useMissionStore((state) => state.isSearching);
  const searchSeconds = useMissionStore((state) => state.searchTimerSeconds);
  const searchStatusText = useMissionStore((state) => state.searchStatusText);

  if (missionActive) {
    return (
      <MissionHero
        statusLabel={clientStatusLabel(status, t)}
        headline={clientHeadline(status, t)}
        railFallback="ACCEPTED"
      >
        {status === 'DUAL_CONFIRM' ? (
          <Button
            title={t('confirmWorkFinish')}
            onPress={() => flow.setDualOpen(true)}
            iconPosition="left"
            icon={<CheckCircle2 size={18} color={colors.onAction} />}
          />
        ) : (
          <Button
            title={t('openDirectChat')}
            onPress={onOpenChat}
            iconPosition="left"
            icon={<MessageSquare size={18} color={colors.onAction} />}
          />
        )}
      </MissionHero>
    );
  }

  if (isSearching) {
    const progress = Math.max(0, Math.min(100, (searchSeconds / 60) * 100));
    return (
      <HeroPanel>
        <HeroStatus
          live
          label={t('searchingActive')}
          trailing={<HeroNumeral value={searchSeconds} unit="s" size={34} />}
        />
        <Txt variant="bodyStrong" color={colors.onBrand}>
          {searchStatusText}
        </Txt>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: colors.action }]} />
        </View>
        <View style={styles.searchFooter}>
          <Txt variant="caption" color={colors.onBrandMuted} style={styles.flex}>
            {t('freeNavigation')}
          </Txt>
          <Pressable
            accessibilityRole="button"
            onPress={onCancelSearch}
            style={({ pressed }) => [styles.ghostButton, pressed && { opacity: 0.7 }]}
          >
            <Txt variant="smallStrong" color={colors.onBrand}>
              {t('cancel')}
            </Txt>
          </Pressable>
        </View>
      </HeroPanel>
    );
  }

  const firstName = user?.fullName?.trim().split(/\s+/)[0];
  const greeting = firstName ? `${t('welcomeTitle')} ${firstName}` : t('welcomeTitle');

  return (
    <View style={heroStyles.hero}>
      <View style={heroStyles.pill}>
        <View style={heroStyles.pillDot} />
        <Text style={[heroStyles.pillText, { fontFamily: type.captionStrong.fontFamily }]}>
          {t('emergencyTagShort')}
        </Text>
      </View>

      <View style={styles.textGroup}>
        <Text style={[heroStyles.mainTitle, { fontFamily: type.title.fontFamily }]}>{greeting}</Text>
        <Text style={[styles.subtitle, { fontFamily: type.small.fontFamily }]}>{t('serviceNeedSubtitle')}</Text>
      </View>

      <View style={styles.searchField}>
        <Search size={20} color="#B7D4C2" strokeWidth={2.2} />
        <TextInput
          accessibilityLabel={t('describeNeed')}
          style={[styles.searchInput, inputReset, { fontFamily: type.body.fontFamily }]}
          placeholder={t('needPlaceholderExample')}
          placeholderTextColor="#B7D4C2"
          value={needText}
          onChangeText={onChangeNeed}
          returnKeyType="search"
          onSubmitEditing={onFindArtisan}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onFindArtisan}
        style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] }]}
      >
        <Text style={[styles.actionText, { fontFamily: type.button.fontFamily }]}>{t('findArtisanShort')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  textGroup: { gap: 4 },
  subtitle: { fontSize: 14, lineHeight: 18, fontWeight: '500', color: '#CFE5D7' },
  searchField: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#0A4A2E',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: { flex: 1, height: '100%', paddingVertical: 0, fontSize: 15, fontWeight: '500', color: '#FFFFFF' },
  actionButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#B4EB3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { fontSize: 16, fontWeight: '700', color: '#0E1F16' },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    overflow: 'hidden',
  },
  progressBar: { height: '100%', borderRadius: 3 },
  searchFooter: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  ghostButton: {
    minHeight: hitTarget,
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
});
