import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronLeft, X } from 'lucide-react-native';
import { LiveDot } from '../../../shared/ui/LiveDot';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { numeralFont } from '../../../shared/theme/typography';
import { gutter } from '../../../shared/theme/tokens';
import { useTopPad } from '../../../shared/theme/useTopPad';
import { formatAmount } from '../../../shared/utils/format';
import type { TopupTransaction } from '../api/wallet.api';

interface Props {
  refused: boolean;
  latest: TopupTransaction | null;
  onBack: () => void;
  /** Refused only: go back to the form to send a new receipt. */
  onResend: () => void;
}

/** One line of the timeline: a dot, a label and, at the end, a short status. */
function Step({
  icon,
  label,
  status,
  tone,
  last,
  muted,
}: {
  icon: React.ReactNode;
  label: string;
  status?: string;
  tone?: string;
  last?: boolean;
  muted?: boolean;
}) {
  const colors = useThemeStore((s) => s.colors);
  return (
    <View style={styles.step}>
      <View style={styles.rail}>
        {icon}
        {!last && <View style={[styles.line, { backgroundColor: muted ? colors.border : colors.brand }]} />}
      </View>
      <View style={styles.stepText}>
        <Txt variant="bodyStrong" color={muted ? colors.textMuted : colors.text} style={styles.flex}>
          {label}
        </Txt>
        {status && (
          <Txt variant="smallStrong" color={tone}>
            {status}
          </Txt>
        )}
      </View>
    </View>
  );
}

/** "Compte en pause" or "Preuve refusée": where the receipt stands, and what to do next. */
export function PauseView({ refused, latest, onBack, onResend }: Props) {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const topPad = useTopPad();
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (refused) return;
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [refused, spin]);

  const sent = latest ? `${formatAmount(Number(latest.amount) || 0)} ${t('currency')}` : '';
  const time = latest?.createdAt
    ? new Date(latest.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <View style={[styles.screen, { backgroundColor: colors.hero, paddingTop: topPad }]}>
      <View style={styles.nav}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          onPress={onBack}
          style={({ pressed }) => [styles.round, pressed && { opacity: 0.7 }]}
        >
          <Mirrored>
            <ChevronLeft size={20} color="#fff" />
          </Mirrored>
        </Pressable>
      </View>

      <View style={styles.scene}>
        <View style={styles.disc}>
          {refused ? (
            <View style={[styles.mark, { backgroundColor: '#F87171' }]}>
              <X size={34} color="#06140D" strokeWidth={4} />
            </View>
          ) : (
            <>
              <Animated.View
                style={[
                  styles.ring,
                  {
                    borderColor: colors.live,
                    transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
                  },
                ]}
              />
              <View style={styles.bars}>
                <View style={styles.bar} />
                <View style={styles.bar} />
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.titles}>
        <Txt variant="title" color={colors.onBrand} style={styles.title} accessibilityRole="header">
          {refused ? t('proofRefusedTitle') : t('pausedAccountTitle')}
        </Txt>
        <Txt variant="body" color={colors.onBrandMuted} style={styles.sub}>
          {refused ? t('refusedSub') : t('pausedSub')}
        </Txt>
      </View>

      <View
        style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, 16) + 18 }]}
      >
        <View>
          <Step
            icon={
              <View style={[styles.dot, { backgroundColor: colors.brand }]}>
                <Check size={13} color="#fff" strokeWidth={3.2} />
              </View>
            }
            label={`${t('stepProofSent')}${sent ? ` · ${sent}` : ''}`}
            status={time}
            tone={colors.textMuted}
          />
          <Step
            icon={
              <View style={[styles.dot, { backgroundColor: refused ? colors.dangerSoft : 'rgba(163,230,53,0.3)' }]}>
                {refused ? <View style={[styles.inner, { backgroundColor: colors.danger }]} /> : <LiveDot />}
              </View>
            }
            label={refused ? t('proofRefusedTitle') : t('stepVerifying')}
            status={refused ? t('refusedWord') : t('inProgress')}
            tone={refused ? colors.dangerText : colors.accentText}
            muted={!refused ? false : false}
          />
          <Step
            icon={<View style={[styles.dot, styles.empty, { borderColor: colors.border }]} />}
            label={t('stepReactivated')}
            muted
            last
          />
        </View>
        {refused ? (
          <Pressable
            accessibilityRole="button"
            onPress={onResend}
            style={({ pressed }) => [
              styles.primary,
              { backgroundColor: colors.brand },
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <Txt variant="button" color="#fff">
              {t('resendProof')}
            </Txt>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={onBack}
            style={({ pressed }) => [styles.outline, { borderColor: colors.border }, pressed && { opacity: 0.7 }]}
          >
            <Txt variant="bodyStrong" color={colors.accentText}>
              {t('back')}
            </Txt>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1 },
  nav: { minHeight: 46, paddingHorizontal: gutter, justifyContent: 'center' },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  scene: { flex: 1, minHeight: 0, alignItems: 'center', justifyContent: 'center' },
  disc: {
    width: 184,
    height: 184,
    borderRadius: 92,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 5,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  bars: { flexDirection: 'row', gap: 14 },
  bar: { width: 14, height: 52, borderRadius: 5, backgroundColor: '#fff' },
  mark: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  titles: { alignItems: 'center', gap: 8, paddingHorizontal: 28, paddingBottom: 18 },
  title: { fontFamily: numeralFont, textAlign: 'center' },
  sub: { textAlign: 'center' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: gutter, paddingTop: 22, gap: 16 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  rail: { alignItems: 'center' },
  line: { width: 2, height: 22 },
  stepText: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 3 },
  dot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  inner: { width: 12, height: 12, borderRadius: 6 },
  empty: { borderWidth: 2 },
  primary: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  outline: { height: 54, borderRadius: 27, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
