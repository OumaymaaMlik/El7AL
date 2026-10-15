import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Bike, Car, Check, Truck } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { SegmentedControl } from '../../../shared/ui/SegmentedControl';
import { Txt } from '../../../shared/ui/Txt';
import { hitTarget, radius, space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import type { RegisterWizard } from '../hooks/useRegisterWizard';

/** Step 2 (providers): specialties, vehicle and bio. */
export function TradesStep({ form }: { form: RegisterWizard }) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const { errors, categories, selectedCategoryIds } = form;

  return (
    <>
      <View style={styles.group}>
        <Txt variant="captionStrong" color={colors.textSecondary}>
          {t('tradesLabel')}
        </Txt>
        {form.categoriesFailed && categories.length === 0 ? (
          <View style={styles.group}>
            <Txt variant="small" color={colors.textMuted}>
              {t('servicesLoadError')}
            </Txt>
            <Button title={t('retry')} variant="outline" onPress={form.loadCategories} />
          </View>
        ) : (
          <View style={styles.chips}>
            {categories.map((cat) => {
              const isSelected = selectedCategoryIds.includes(cat.id);
              return (
                <Pressable
                  key={cat.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  onPress={() => form.toggleCategory(cat.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.brand : 'transparent',
                      borderColor: isSelected ? colors.brand : errors.trades ? colors.danger : colors.inputBorder,
                    },
                  ]}
                >
                  {isSelected && <Check size={14} color={colors.action} strokeWidth={2.8} />}
                  <Txt variant="smallStrong" color={isSelected ? colors.onBrand : colors.textSecondary}>
                    {cat.name}
                  </Txt>
                </Pressable>
              );
            })}
          </View>
        )}
        {Boolean(errors.trades) && (
          <Txt variant="caption" color={colors.dangerText} accessibilityRole="alert">
            {errors.trades}
          </Txt>
        )}
      </View>

      <View style={styles.group}>
        <Txt variant="captionStrong" color={colors.textSecondary}>
          {t('transportLabel')}
        </Txt>
        <SegmentedControl
          value={form.vehicleType}
          onChange={form.setVehicleType}
          options={[
            { key: 'CAR', label: t('vehicleCar'), icon: (color) => <Car size={16} color={color} /> },
            { key: 'VAN', label: t('vehicleVan'), icon: (color) => <Truck size={16} color={color} /> },
            { key: 'MOTO', label: t('vehicleMoto'), icon: (color) => <Bike size={16} color={color} /> },
          ]}
        />
      </View>

      <Input
        label={`${t('bio')} ${t('optionalTag')}`}
        placeholder={t('bioPlaceholder')}
        multiline
        value={form.bio}
        onChangeText={form.setBio}
      />
    </>
  );
}

const styles = StyleSheet.create({
  group: { gap: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    minHeight: hitTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
});
