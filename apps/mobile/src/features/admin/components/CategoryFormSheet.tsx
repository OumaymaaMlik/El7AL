import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Wrench } from 'lucide-react-native';
import { CATEGORY_ICONS as ICON_CHOICES } from '@el7al/shared';
import { BottomSheet } from '../../../shared/ui/BottomSheet';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Txt } from '../../../shared/ui/Txt';
import { hitTarget, radius, space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { CATEGORY_ICONS } from '../../home/components/CategoryGrid';
import type { CategoryDraft } from '../hooks/useAdminActions';
import type { AdminCategory } from '../schemas/admin.schema';

interface Props {
  /** `undefined` = closed, `null` = creating, a category = editing it. */
  category: AdminCategory | null | undefined;
  saving: boolean;
  onSave: (draft: CategoryDraft) => void;
  onClose: () => void;
}

const EMPTY: CategoryDraft = { name: '', icon: 'Wrench', description: '' };

/** One form for creating and editing a trade: name, description and an icon picked from the shared list. */
export function CategoryFormSheet({ category, saving, onSave, onClose }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const [draft, setDraft] = useState<CategoryDraft>(EMPTY);
  const [nameError, setNameError] = useState<string | undefined>();
  const open = category !== undefined;

  useEffect(() => {
    if (category === undefined) return;
    setNameError(undefined);
    setDraft(
      category
        ? { name: category.name, icon: String(category.icon ?? 'Wrench'), description: category.description ?? '' }
        : EMPTY,
    );
  }, [category]);

  const submit = () => {
    if (!draft.name.trim()) {
      setNameError(t('errCategoryName'));
      return;
    }
    onSave(draft);
  };

  return (
    <BottomSheet visible={open} onClose={onClose} title={t(category ? 'editCategory' : 'addCategory')}>
      <View style={styles.body}>
        <Input
          label={t('categoryNameLabel')}
          placeholder={t('categoryNamePlaceholder')}
          value={draft.name}
          onChangeText={(name) => {
            setDraft({ ...draft, name });
            setNameError(undefined);
          }}
          error={nameError}
        />
        <Input
          label={t('categoryDescLabel')}
          placeholder={t('categoryDescPlaceholder')}
          value={draft.description}
          onChangeText={(description) => setDraft({ ...draft, description })}
        />

        <Txt variant="smallStrong">{t('iconLabel')}</Txt>
        <View style={styles.grid}>
          {ICON_CHOICES.map((choice) => {
            const Icon = CATEGORY_ICONS[choice.name] ?? Wrench;
            const picked = draft.icon === choice.name;
            return (
              <Pressable
                key={choice.name}
                accessibilityRole="button"
                accessibilityLabel={choice.label}
                accessibilityState={{ selected: picked }}
                onPress={() => setDraft({ ...draft, icon: choice.name })}
                style={[
                  styles.cell,
                  {
                    borderColor: picked ? colors.brand : colors.border,
                    backgroundColor: picked ? colors.brand : colors.surface,
                  },
                ]}
              >
                <Icon size={20} color={picked ? colors.onBrand : colors.textSecondary} />
              </Pressable>
            );
          })}
        </View>

        <Button title={t('saveCategory')} variant="primary" onPress={submit} loading={saving} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: space.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  cell: {
    width: hitTarget + 4,
    height: hitTarget + 4,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
