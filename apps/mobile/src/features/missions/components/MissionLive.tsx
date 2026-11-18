import { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import { MapPin, MessageSquare, Phone } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiveTrackingMap } from '../../map/components/LiveTrackingMap';
import { Avatar } from '../../../shared/ui/Avatar';
import { LiveDot } from '../../../shared/ui/LiveDot';
import { MissionStatusRail } from '../../../shared/ui/MissionStatusRail';
import { SlideToAct } from '../../../shared/ui/SlideToAct';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import type { Coords } from '../../map/services/location';
import { useMissionStore } from '../store/useMissionStore';
import type { PrimaryAction } from './TrackingActions';
import { tabBarHeight } from '../../../shared/theme/tokens';
import { styles } from './MissionLive.styles';
import { useTopPad } from '../../../shared/theme/useTopPad';

interface Props {
  status: string | null;
  statusLabel: string;
  headline: string;
  isProvider: boolean;
  partnerName: string;
  partnerAvatar?: string | null;
  partnerRating?: number | null;
  description?: string | null;
  address?: string | null;
  pickup: Coords | null;
  primary: PrimaryAction | null;
  onChat: () => void;
  onCall: () => void;
  onCancel: () => void;
  onOpenNavigation: () => void;
}

/**
 * The live screen of a mission, for the client and the artisan, laid out as in the prototype: the green header
 * (status chip, the big line, minutes to arrival, the six steps), the map filling the middle, and a sheet with the
 * other person, the problem and the address, then the one slide-to-act step and a quiet cancel link.
 */
export function MissionLive({
  status,
  statusLabel,
  headline,
  isProvider,
  partnerName,
  partnerAvatar,
  partnerRating,
  description,
  address,
  pickup,
  primary,
  onChat,
  onCall,
  onCancel,
  onOpenNavigation,
}: Props) {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const topPad = useTopPad();
  const etaMinutes = useMissionStore((s) => s.etaMinutes);
  const providerPosition = useMissionStore((s) => s.providerPosition);
  const [mapHeight, setMapHeight] = useState(240);

  // The big line fades in (rising 8 px, 400 ms) each time the status changes, as in the prototype.
  const fade = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [headline, fade]);
  const headlineShift = fade.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });

  const enRoute = status === 'EN_ROUTE';
  const showEta = enRoute && etaMinutes > 0;
  const bottom = tabBarHeight + Math.max(insets.bottom, 10) + 12;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.hero, paddingTop: topPad }]}>
        <View style={styles.navRow}>
          <View style={styles.circleSpace} />
          <View style={styles.chip}>
            <LiveDot />
            <Txt variant="overline" color={colors.live} numberOfLines={1}>
              {statusLabel}
            </Txt>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('openDirectChat')}
            onPress={onChat}
            style={({ pressed }) => [styles.glassCircle, pressed && { opacity: 0.7 }]}
          >
            <MessageSquare size={18} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.titleRow}>
          <Animated.View style={[styles.headline, { opacity: fade, transform: [{ translateY: headlineShift }] }]}>
            <Txt
              variant="heading"
              color={colors.onBrand}
              style={styles.headlineText}
              numberOfLines={2}
              accessibilityRole="header"
            >
              {headline}
            </Txt>
          </Animated.View>
          {showEta && (
            <View style={styles.eta} accessible accessibilityLabel={`${etaMinutes} ${t('minutesShort')}`}>
              <Text style={[styles.etaValue, { color: colors.live }]}>{etaMinutes}</Text>
              <Txt variant="smallStrong" color={colors.onBrandMuted}>
                {t('minutesShort')}
              </Txt>
            </View>
          )}
        </View>

        <MissionStatusRail status={status} onBrand style={styles.rail} />
      </View>

      <View style={styles.map} onLayout={(e: LayoutChangeEvent) => setMapHeight(e.nativeEvent.layout.height)}>
        <LiveTrackingMap pickup={pickup} provider={providerPosition} height={mapHeight} flush />
      </View>

      <View style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: bottom }]}>
        <View style={[styles.grab, { backgroundColor: colors.border }]} />

        <View style={styles.row}>
          <Avatar uri={partnerAvatar} name={partnerName} size={52} />
          <View style={styles.flex}>
            <Txt variant="bodyStrong" numberOfLines={1} style={styles.name}>
              {partnerName}
            </Txt>
            <Txt variant="small" color={colors.textMuted} numberOfLines={1}>
              {isProvider
                ? t('clientApplicant')
                : [t('qualifiedAssigned'), partnerRating ? partnerRating.toFixed(1).replace('.', ',') + ' ★' : null]
                    .filter(Boolean)
                    .join(' · ')}
            </Txt>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('openDirectChat')}
            onPress={onChat}
            style={({ pressed }) => [styles.circle, { backgroundColor: colors.tint }, pressed && { opacity: 0.8 }]}
          >
            <MessageSquare size={20} color={colors.accentText} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('callDirectly')}
            onPress={onCall}
            style={({ pressed }) => [styles.circle, { backgroundColor: colors.brand }, pressed && { opacity: 0.8 }]}
          >
            <Phone size={18} color="#fff" fill="#fff" />
          </Pressable>
        </View>

        <View style={[styles.line, { backgroundColor: colors.divider }]} />

        {Boolean(description) && (
          <View style={styles.info}>
            <Txt variant="small" color={colors.textMuted}>
              {t('problemLabel')}
            </Txt>
            <Txt variant="smallStrong" numberOfLines={2} style={styles.infoValue}>
              {description}
            </Txt>
          </View>
        )}

        {isProvider && Boolean(address) ? (
          <View style={[styles.addressCard, { backgroundColor: colors.background }]}>
            <MapPin size={16} color={colors.accentText} />
            <Txt variant="smallStrong" numberOfLines={1} style={styles.flex}>
              {address}
            </Txt>
            <Pressable accessibilityRole="button" onPress={onOpenNavigation} hitSlop={8}>
              <Txt variant="smallStrong" color={colors.accentText}>
                {t('itinerary')}
              </Txt>
            </Pressable>
          </View>
        ) : (
          Boolean(address) && (
            <View style={styles.info}>
              <Txt variant="small" color={colors.textMuted}>
                {t('addressLabelShort')}
              </Txt>
              <Txt variant="smallStrong" numberOfLines={1} style={styles.infoValue}>
                {address}
              </Txt>
            </View>
          )
        )}

        {primary && <SlideToAct label={primary.title} onComplete={primary.onPress} loading={primary.busy} />}

        <Pressable
          accessibilityRole="button"
          onPress={onCancel}
          style={({ pressed }) => [styles.cancel, pressed && { opacity: 0.7 }]}
        >
          <Txt variant="smallStrong" color={colors.dangerText}>
            {t('cancelMission')}
          </Txt>
        </Pressable>
      </View>
    </View>
  );
}
