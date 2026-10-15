import React, { useState } from 'react';
import type { Category } from '../../categories';
import { Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { AlertTriangle, MapPin, Search } from 'lucide-react-native';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useType } from '../../../shared/theme/useType';
import { controlHeight, hitTarget, inputReset, radius, space } from '../../../shared/theme/tokens';
import { BottomSheet } from '../../../shared/ui/BottomSheet';
import { Button } from '../../../shared/ui/Button';
import { Txt } from '../../../shared/ui/Txt';

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

/**
 * The request form. The service is chosen (or confirmed) here, so the client is
 * never sent back to the home screen to pick one, and every error is shown next
 * to the field it belongs to.
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
  const { height } = useWindowDimensions();
  const [focused, setFocused] = useState<'problem' | 'address' | null>(null);

  const fieldBorder = (name: 'problem' | 'address', hasError?: boolean) =>
    hasError ? colors.danger : focused === name ? colors.accentText : colors.inputBorder;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={selectedCategory ? selectedCategory.name : t('problemDetails')}
      subtitle={t('describeBreakdown')}
    >
      <ScrollView
        style={{ maxHeight: height * 0.62 }}
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Service */}
        <View style={styles.field}>
          <Txt variant="captionStrong" color={colors.textSecondary}>
            {t('fieldService')}
          </Txt>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.chips}
          >
            {categories.map((cat) => {
              const selected = selectedCategory?.id === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => onSelectCategory(cat)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? colors.brand : 'transparent',
                      borderColor: selected ? colors.brand : errors.service ? colors.danger : colors.inputBorder,
                    },
                  ]}
                >
                  <Txt variant="smallStrong" color={selected ? colors.onBrand : colors.textSecondary}>
                    {cat.name}
                  </Txt>
                </Pressable>
              );
            })}
          </ScrollView>
          {Boolean(errors.service) && <FieldError message={errors.service!} />}
        </View>

        {/* Problem */}
        <View style={styles.field}>
          <Txt variant="captionStrong" color={colors.textSecondary}>
            {t('fieldProblem')}
          </Txt>
          <TextInput
            accessibilityLabel={t('fieldProblem')}
            style={[
              type.body,
              styles.textArea,
              inputReset,
              {
                backgroundColor: colors.background,
                borderColor: fieldBorder('problem', Boolean(errors.problem)),
                color: colors.text,
              },
            ]}
            placeholder={t('needPlaceholder')}
            placeholderTextColor={colors.textMuted}
            multiline
            value={needText}
            onChangeText={onChangeNeed}
            onFocus={() => setFocused('problem')}
            onBlur={() => setFocused(null)}
          />
          {Boolean(errors.problem) && <FieldError message={errors.problem!} />}
        </View>

        {/* Address */}
        <View style={styles.field}>
          <Txt variant="captionStrong" color={colors.textSecondary}>
            {t('fieldAddress')}
          </Txt>
          <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: fieldBorder('address') }]}>
            <MapPin size={18} color={colors.textMuted} />
            <TextInput
              accessibilityLabel={t('fieldAddress')}
              style={[type.body, styles.input, inputReset, { color: colors.text }]}
              value={locationText}
              placeholderTextColor={colors.textMuted}
              onChangeText={onChangeLocation}
              onFocus={() => setFocused('address')}
              onBlur={() => setFocused(null)}
            />
          </View>
        </View>

        {Boolean(errors.submit) && (
          <View accessibilityRole="alert" style={[styles.banner, { backgroundColor: colors.dangerSoft }]}>
            <AlertTriangle size={16} color={colors.dangerText} />
            <Txt variant="small" color={colors.dangerText} style={styles.bannerText}>
              {errors.submit}
            </Txt>
          </View>
        )}

        <Button
          title={t('searchTechnician')}
          onPress={onSubmit}
          loading={submitting}
          iconPosition="left"
          icon={<Search size={18} color={colors.onAction} />}
        />
      </ScrollView>
    </BottomSheet>
  );
}

function FieldError({ message }: { message: string }) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <Txt variant="caption" color={colors.dangerText} accessibilityRole="alert">
      {message}
    </Txt>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: space.lg,
    paddingBottom: space.xs,
  },
  field: {
    gap: space.sm,
  },
  chips: {
    gap: space.sm,
  },
  chip: {
    minHeight: hitTarget,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingTop: space.md,
    paddingBottom: space.md,
    textAlignVertical: 'top',
  },
  inputRow: {
    height: controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.sm,
  },
  bannerText: {
    flex: 1,
  },
});
