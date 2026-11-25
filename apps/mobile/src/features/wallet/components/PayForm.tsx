import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, Camera, ChevronLeft, Lock } from 'lucide-react-native';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { numeralFont } from '../../../shared/theme/typography';
import { gutter } from '../../../shared/theme/tokens';
import { useTopPad } from '../../../shared/theme/useTopPad';
import { formatAmount } from '../../../shared/utils/format';
import { pickImageFromDevice } from '../../../shared/utils/imagePicker';

interface Props {
  /** What the artisan owes: the amount to transfer (the server decides it, so it cannot be mistyped). */
  due: number;
  /** El 7al's bank account from the server; the app's own setting is the fallback. */
  rib: string | null;
  paused: boolean;
  sending: boolean;
  onBack: () => void;
  onSend: (photoUri: string) => void;
  /** The charges and transfers, under the form. */
  history?: React.ReactNode;
}

/**
 * "Payer El 7al": the amount to transfer (it starts at what is owed), where to send it, the photo of the transfer
 * receipt, and one button. The account stays paused until El 7al checks the receipt.
 */
export function PayForm({ due, rib, paused, sending, onBack, onSend, history }: Props) {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const topPad = useTopPad();
  const [photo, setPhoto] = useState<string | null>(null);

  const ready = Boolean(photo) && due > 0;

  const pick = async () => {
    const uri = await pickImageFromDevice();
    if (uri) setPhoto(uri);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: colors.background, paddingTop: topPad }]}
    >
      <View style={styles.nav}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          onPress={onBack}
          style={({ pressed }) => [
            styles.round,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Mirrored>
            <ChevronLeft size={20} color={colors.text} />
          </Mirrored>
        </Pressable>
        <Txt variant="smallStrong" color={colors.textMuted}>
          {t('commissionDue')}
        </Txt>
        <View style={styles.round} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Txt variant="title" style={styles.title} accessibilityRole="header">
          {t('payElHal')}
        </Txt>

        <View style={[styles.amountCard, { backgroundColor: colors.hero }]}>
          <View style={styles.amountTop}>
            <Txt variant="smallStrong" color={colors.onBrandMuted}>
              {t('transferAmount')}
            </Txt>
            <Lock size={16} color={colors.onBrandMuted} strokeWidth={2} />
          </View>
          <View style={styles.amountRow}>
            <Text style={[styles.amountInput, { color: colors.onBrand }]}>{formatAmount(due)}</Text>
            <Text style={[styles.unit, { color: colors.live }]}>{t('currency')}</Text>
          </View>
        </View>

        {rib && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Txt variant="caption" color={colors.textMuted}>
              {t('ribLabel')}
            </Txt>
            <Txt variant="bodyStrong" selectable style={styles.rib}>
              {rib}
            </Txt>
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('proofTitle')}
          onPress={pick}
          style={[
            styles.proof,
            {
              backgroundColor: colors.surface,
              borderColor: photo ? colors.brand : colors.borderStrong,
              borderStyle: photo ? 'solid' : 'dashed',
            },
          ]}
        >
          <View style={[styles.thumb, { backgroundColor: colors.tint }]}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.thumbImage} />
            ) : (
              <Camera size={24} color={colors.textMuted} />
            )}
          </View>
          <View style={styles.flex}>
            <Txt variant="bodyStrong">{t('proofTitle')}</Txt>
            <Txt variant="small" color={colors.textMuted}>
              {photo ? t('proofAdded') : t('proofAdd')}
            </Txt>
          </View>
          <Txt variant="smallStrong" color={colors.accentText}>
            {photo ? t('proofChange') : t('proofAddShort')}
          </Txt>
        </Pressable>

        {paused && (
          <View style={[styles.note, { backgroundColor: colors.warnSoft }]}>
            <AlertCircle size={18} color={colors.warnText} />
            <Txt variant="small" color={colors.warnText} style={styles.flex}>
              {t('pausedUntilProof')}
            </Txt>
          </View>
        )}
        {history}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 10 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !ready || sending, busy: sending }}
          disabled={!ready || sending}
          onPress={() => photo && onSend(photo)}
          style={({ pressed }) => [
            styles.send,
            { backgroundColor: ready ? colors.brand : colors.tint },
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
        >
          <Txt variant="button" color={ready ? '#fff' : colors.textMuted}>
            {t('sendProof')}
          </Txt>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  screen: { flex: 1 },
  nav: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: gutter,
  },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: gutter, paddingTop: 18, paddingBottom: 20, gap: 14 },
  title: { fontFamily: numeralFont, fontSize: 32, lineHeight: 34 },
  amountCard: { borderRadius: 24, padding: 18, gap: 12 },
  amountTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  amountInput: { flex: 1, fontFamily: numeralFont, fontSize: 52, lineHeight: 58, paddingVertical: 0 },
  unit: { fontFamily: numeralFont, fontSize: 20 },
  card: { borderRadius: 24, borderWidth: 1, padding: 14, gap: 4 },
  rib: { letterSpacing: 0.3 },
  proof: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: 24, borderWidth: 1.5 },
  thumb: {
    width: 64,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: { width: '100%', height: '100%' },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 16 },
  footer: { paddingHorizontal: gutter, paddingTop: 10 },
  send: { height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
});
