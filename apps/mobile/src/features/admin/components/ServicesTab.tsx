import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Edit3, Layers, Plus, Trash2, Wrench } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { IconButton } from '../../../shared/ui/IconButton';
import { SectionHeader } from '../../../shared/ui/SectionHeader';
import { Hairline, Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { CATEGORY_ICONS } from '../../home/components/CategoryGrid';
import type { AdminActions } from '../hooks/useAdminActions';
import type { AdminCategory } from '../schemas/admin.schema';
import { ListSkeleton } from './AdminTabs';

/** The trades clients can ask for: add, edit (name, description, icon) and delete. */
export function ServicesTab({
  categories,
  loading,
  actions,
}: {
  categories: AdminCategory[];
  loading: boolean;
  actions: AdminActions;
}) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();

  return (
    <>
      <Button
        title={t('addCategory')}
        variant="primary"
        onPress={() => actions.setCategoryForm(null)}
        icon={<Plus size={18} color={colors.onBrand} />}
        iconPosition="left"
      />

      <View>
        <SectionHeader
          title={t('adminServices')}
          meta={categories.length > 0 ? String(categories.length) : undefined}
        />
        {loading && categories.length === 0 ? (
          <ListSkeleton />
        ) : categories.length === 0 ? (
          <Surface>
            <EmptyState icon={<Layers size={24} color={colors.textMuted} />} title={t('noCategories')} />
          </Surface>
        ) : (
          <Surface>
            {categories.map((c, index) => {
              const Icon = CATEGORY_ICONS[String(c.icon ?? '')] ?? Wrench;
              return (
                <React.Fragment key={c.id}>
                  {index > 0 && <Hairline />}
                  <View style={styles.row}>
                    <Icon size={20} color={colors.brand} />
                    <View style={styles.flex}>
                      <Txt variant="bodyStrong" numberOfLines={1}>
                        {c.name}
                      </Txt>
                      {Boolean(c.description) && (
                        <Txt variant="small" color={colors.textMuted} numberOfLines={2}>
                          {c.description}
                        </Txt>
                      )}
                    </View>
                    <IconButton
                      accessibilityLabel={`${t('editCategory')} ${c.name}`}
                      onPress={() => actions.setCategoryForm(c)}
                      variant="plain"
                    >
                      <Edit3 size={17} color={colors.textSecondary} />
                    </IconButton>
                    <IconButton
                      accessibilityLabel={`${t('delete')} ${c.name}`}
                      onPress={() => actions.setCategoryToDelete(c)}
                      variant="plain"
                    >
                      <Trash2 size={17} color={colors.dangerText} />
                    </IconButton>
                  </View>
                </React.Fragment>
              );
            })}
          </Surface>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.sm,
    paddingStart: space.lg,
    paddingEnd: space.sm,
    minHeight: 60,
  },
});
