import React from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Clock } from 'lucide-react-native';
import { Avatar } from '../../../shared/ui/Avatar';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { numeralFont } from '../../../shared/theme/typography';
import { gutter } from '../../../shared/theme/tokens';
import type { PairedProvider } from '../../missions/types';

/** The white sheet at the bottom of the search page; its content depends on how the search is going. */
function Sheet({ children }: { children: React.ReactNode }) {
  const colors = useThemeStore((s) => s.colors);
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, 16) + 18 }]}
    >
      {children}
    </View>
  );
}

function OutlineButton({ label, onPress }: { label: string; onPress: () => void }) {
  const colors = useThemeStore((s) => s.colors);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.outline, { borderColor: colors.border }, pressed && { opacity: 0.7 }]}
    >
      <Txt variant="bodyStrong" color={colors.accentText}>
        {label}
      </Txt>
    </Pressable>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  const colors = useThemeStore((s) => s.colors);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.primary,
        { backgroundColor: colors.brand },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <Txt variant="button" color="#fff">
        {label}
      </Txt>
    </Pressable>
  );
}

/** While the request is out: a spinner with the current range, what happens next, and a way to cancel. */
export function SearchingSheet({
  statusText,
  spin,
  onCancel,
}: {
  statusText: string;
  spin: Animated.AnimatedInterpolation<string>;
  onCancel: () => void;
}) {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  return (
    <Sheet>
      <View style={styles.row}>
        <Animated.View
          style={[
            styles.spinner,
            { borderColor: colors.border, borderTopColor: colors.brand, transform: [{ rotate: spin }] },
          ]}
        />
        <Txt variant="bodyStrong" numberOfLines={1} style={styles.flex}>
          {statusText || t('searchNearest')}
        </Txt>
      </View>
      <Txt variant="small" color={colors.textMuted}>
        {t('searchHint')}
      </Txt>
      <OutlineButton label={t('cancelRequest')} onPress={onCancel} />
    </Sheet>
  );
}

/** An artisan accepted: who, how they are rated, and the minutes to arrive, large (the peak of the wait). */
export function FoundSheet({
  provider,
  eta,
  onTrack,
}: {
  provider: PairedProvider | null;
  eta: number;
  onTrack: () => void;
}) {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  const name = provider?.fullName ?? t('artisanLabel');
  const rating = Number(provider?.ratingAverage);
  return (
    <Sheet>
      <View style={styles.row}>
        <View style={[styles.tick, { backgroundColor: colors.live }]}>
          <Check size={12} color={colors.onLive} strokeWidth={3.4} />
        </View>
        <Txt variant="smallStrong" color={colors.accentText}>
          {t('acceptedBy').replace('{name}', name)}
        </Txt>
      </View>
      <View style={styles.row}>
        <Avatar
          uri={provider?.avatarUrl}
          name={name}
          size={56}
          tint={{ background: colors.brand, color: colors.live }}
        />
        <View style={styles.flex}>
          <Txt variant="bodyStrong" numberOfLines={1} style={styles.name}>
            {name}
          </Txt>
          {rating > 0 && (
            <Txt variant="small" color={colors.textMuted}>
              {`${rating.toFixed(1).replace('.', ',')} ★`}
            </Txt>
          )}
        </View>
        {eta > 0 && (
          <View
            style={[styles.eta, { backgroundColor: colors.hero }]}
            accessible
            accessibilityLabel={`${eta} ${t('minutesShort')}`}
          >
            <Txt style={[styles.etaValue, { color: colors.live }]}>{eta}</Txt>
            <Txt variant="captionStrong" color={colors.onBrandMuted}>
              {t('minutesShort')}
            </Txt>
          </View>
        )}
      </View>
      <PrimaryButton label={t('followArrival')} onPress={onTrack} />
    </Sheet>
  );
}

/** Nobody accepted in time: say so plainly and offer to look again or stop. */
export function NoneSheet({ onRetry, onCancel }: { onRetry: () => void; onCancel: () => void }) {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  return (
    <Sheet>
      <View style={styles.row}>
        <View style={[styles.clock, { backgroundColor: colors.dangerSoft }]}>
          <Clock size={22} color={colors.dangerText} />
        </View>
        <View style={styles.flex}>
          <Txt variant="bodyStrong" style={styles.name}>
            {t('nobodyYet')}
          </Txt>
          <Txt variant="small" color={colors.textMuted}>
            {t('nearbyBusy')}
          </Txt>
        </View>
      </View>
      <PrimaryButton label={t('retrySearch')} onPress={onRetry} />
      <OutlineButton label={t('cancelRequest')} onPress={onCancel} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: gutter, paddingTop: 22, gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  spinner: { width: 22, height: 22, borderRadius: 11, borderWidth: 3 },
  tick: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  clock: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 17, lineHeight: 22 },
  eta: { minWidth: 64, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, alignItems: 'center' },
  etaValue: { fontFamily: numeralFont, fontSize: 30, lineHeight: 32 },
  primary: { height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  outline: { height: 54, borderRadius: 27, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
