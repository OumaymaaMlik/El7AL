import { useState } from 'react';
import type { Category } from '../../categories';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertTriangle, ArrowRight, ChevronLeft, Clock, MapPin } from 'lucide-react-native';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { SlideInPage } from '../../../shared/ui/SlideInPage';
import { Txt } from '../../../shared/ui/Txt';
import { ToolIcon } from '../../../shared/ui/art/ToolIcon';
import { toolForCategory } from '../../../shared/ui/art/toolArt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useType } from '../../../shared/theme/useType';
import { inputReset } from '../../../shared/theme/tokens';
import { styles } from './RequestSheet.styles';
import { numeralFont } from '../../../shared/theme/typography';
import { useTopPad } from '../../../shared/theme/useTopPad';

export interface RequestFormErrors {
  service?: string;
  problem?: string;
  submit?: string;
}

interface RequestSheetProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: Category | null;
  onSelectCategory: (category: Category) => void;
  needText: string;
  onChangeNeed: (text: string) => void;
  locationText: string;
  onChangeLocation: (text: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  errors: RequestFormErrors;
}

const MAX = 300;

/**
 * "Décrivez le problème": the full page that follows the slide on the home screen. The trade chip at the top,
 * the problem in a framed box, the address and the arrival in one card, and the launch button. The trade can still
 * be changed here from the chips when none was chosen.
 */
export function RequestSheet({
  visible,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  needText,
  onChangeNeed,
  locationText,
  onChangeLocation,
  onSubmit,
  submitting,
  errors,
}: RequestSheetProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const type = useType();
  const insets = useSafeAreaInsets();
  const topPad = useTopPad();
  const [editingAddress, setEditingAddress] = useState(false);

  const tool = toolForCategory(selectedCategory?.name, selectedCategory?.icon);

  return (
    <SlideInPage visible={visible} onClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.screen, { backgroundColor: colors.background, paddingTop: topPad }]}
      >
        <View style={styles.nav}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('back')}
            onPress={onClose}
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

          {selectedCategory && (
            <View style={[styles.tradeChip, { backgroundColor: colors.hero }]}>
              {tool && <ToolIcon tool={tool} palette="dark" width={18} height={28} />}
              <Txt variant="smallStrong" color={colors.onBrand}>
                {selectedCategory.name}
              </Txt>
            </View>
          )}
          <View style={styles.round} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Txt variant="title" style={[styles.title, { fontFamily: numeralFont }]} accessibilityRole="header">
            {t('describeProblemTitle').replace(' ', '\n')}
          </Txt>

          {!selectedCategory && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  accessibilityRole="radio"
                  onPress={() => onSelectCategory(cat)}
                  style={[
                    styles.chip,
                    { borderColor: errors.service ? colors.danger : colors.border, backgroundColor: colors.surface },
                  ]}
                >
                  <Txt variant="smallStrong" color={colors.textMuted}>
                    {cat.name}
                  </Txt>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <View>
            <TextInput
              accessibilityLabel={t('fieldProblem')}
              style={[
                type.body,
                styles.textArea,
                inputReset,
                {
                  backgroundColor: colors.surface,
                  borderColor: errors.problem ? colors.danger : colors.brand,
                  color: colors.text,
                },
              ]}
              placeholder={t('needPlaceholder')}
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={MAX}
              value={needText}
              onChangeText={onChangeNeed}
            />
            <Txt variant="caption" color={colors.textMuted} style={styles.counter}>
              {needText.length} / {MAX}
            </Txt>
          </View>
          {Boolean(errors.problem) && (
            <Txt variant="caption" color={colors.dangerText} accessibilityRole="alert">
              {errors.problem}
            </Txt>
          )}

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Pressable accessibilityRole="button" onPress={() => setEditingAddress(true)} style={styles.cardRow}>
              <View style={[styles.rowIcon, { backgroundColor: colors.tint }]}>
                <MapPin size={18} color={colors.accentText} />
              </View>
              <View style={styles.flex}>
                <Txt variant="caption" color={colors.textMuted}>
                  {t('fieldAddress')}
                </Txt>
                {editingAddress ? (
                  <TextInput
                    autoFocus
                    accessibilityLabel={t('fieldAddress')}
                    style={[type.bodyStrong, styles.addressInput, inputReset, { color: colors.text }]}
                    value={locationText}
                    onChangeText={onChangeLocation}
                    onBlur={() => setEditingAddress(false)}
                    onSubmitEditing={() => setEditingAddress(false)}
                    returnKeyType="done"
                  />
                ) : (
                  <Txt variant="bodyStrong" numberOfLines={2} style={styles.value}>
                    {locationText || '—'}
                  </Txt>
                )}
              </View>
            </Pressable>

            <View style={[styles.sep, { backgroundColor: colors.border }]} />

            <View style={styles.cardRow}>
              <View style={[styles.rowIcon, { backgroundColor: colors.tint }]}>
                <Clock size={18} color={colors.accentText} />
              </View>
              <View style={styles.flex}>
                <Txt variant="caption" color={colors.textMuted}>
                  {t('arrival')}
                </Txt>
                <Txt variant="bodyStrong" style={styles.value}>
                  {t('asap')}
                </Txt>
              </View>
            </View>
          </View>

          {Boolean(errors.submit) && (
            <View accessibilityRole="alert" style={[styles.banner, { backgroundColor: colors.dangerSoft }]}>
              <AlertTriangle size={16} color={colors.dangerText} />
              <Txt variant="small" color={colors.dangerText} style={styles.flex}>
                {errors.submit}
              </Txt>
            </View>
          )}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 10 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy: submitting }}
            disabled={submitting}
            onPress={onSubmit}
            style={({ pressed }) => [
              styles.launch,
              { backgroundColor: colors.brand, opacity: submitting ? 0.7 : 1 },
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <Txt variant="button" color="#fff">
              {t('launchIntervention')}
            </Txt>
            <Mirrored>
              <ArrowRight size={18} color={colors.live} strokeWidth={2.6} />
            </Mirrored>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SlideInPage>
  );
}
