import { useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import type { Category } from '../../categories';
import { Animated, Pressable, View } from 'react-native';
import {
  Wrench,
  Zap,
  Car,
  Fan,
  Key,
  PaintBucket,
  Flame,
  Snowflake,
  Sparkles,
  Hammer,
  Sprout,
  Tv,
  Droplets,
  Paintbrush,
  Flower2,
  Shield,
  Construction,
  Check,
} from 'lucide-react-native';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useType } from '../../../shared/theme/useType';
import { Button } from '../../../shared/ui/Button';
import { Skeleton } from '../../../shared/ui/Skeleton';
import { Txt } from '../../../shared/ui/Txt';
import { styles } from './CategoryGrid.styles';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Wrench,
  // The icon names an admin can pick (packages/shared/src/categoryIcons.ts), so web and mobile draw the same one.
  Droplets,
  Paintbrush,
  Flower2,
  Shield,
  Construction,
  Plomberie: Droplets,
  Zap,
  Électricité: Zap,
  Electricity: Zap,
  Car,
  Mécanique: Car,
  Mechanic: Car,
  Fan,
  Climatisation: Snowflake,
  AC: Snowflake,
  Snowflake,
  Key,
  Serrurerie: Key,
  Locksmith: Key,
  PaintBucket,
  Peinture: PaintBucket,
  Flame,
  Chauffage: Flame,
  Heating: Flame,
  Sparkles,
  Ménage: Sparkles,
  Cleaning: Sparkles,
  Hammer,
  Maçonnerie: Hammer,
  Menuiserie: Hammer,
  Sprout,
  Jardinage: Sprout,
  Gardening: Sprout,
  Tv,
  Électroménager: Tv,
  Appliances: Tv,
};

function getCategoryIcon(cat: Category) {
  if (cat.icon && CATEGORY_ICONS[cat.icon]) {
    return CATEGORY_ICONS[cat.icon];
  }
  const name = cat.name || '';
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return CATEGORY_ICONS[key];
    }
  }
  return Wrench;
}

interface CategoryGridProps {
  categories: Category[];
  loading: boolean;
  /** True when the last load failed. Shows a message and a retry button. */
  error: boolean;
  selectedId?: string | null;
  onSelect: (category: Category) => void;
  onRetry: () => void;
}

/**
 * 2-column card grid redesign matching the refined client home layout.
 */
export function CategoryGrid({ categories, loading, error, selectedId, onSelect, onRetry }: CategoryGridProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();

  if (loading) {
    return (
      <View style={styles.grid}>
        {[0, 1, 2, 3].map((row) => (
          <View key={row} style={styles.row}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ))}
      </View>
    );
  }

  if (error && categories.length === 0) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Txt variant="small" color={colors.textSecondary}>
          {t('servicesLoadError')}
        </Txt>
        <Button title={t('retry')} variant="outline" onPress={onRetry} />
      </View>
    );
  }

  if (categories.length === 0) return null;

  const rows: Category[][] = [];
  for (let i = 0; i < categories.length; i += 2) {
    rows.push(categories.slice(i, i + 2));
  }

  return (
    <View style={styles.grid}>
      {rows.map((pair, rowIndex) => (
        <View key={pair[0].id || rowIndex} style={styles.row}>
          <CategoryCard cat={pair[0]} selected={selectedId === pair[0].id} onPress={() => onSelect(pair[0])} />
          {pair[1] ? (
            <CategoryCard cat={pair[1]} selected={selectedId === pair[1].id} onPress={() => onSelect(pair[1])} />
          ) : (
            <View style={styles.cardPlaceholder} />
          )}
        </View>
      ))}
    </View>
  );
}

interface CategoryCardProps {
  cat: Category;
  selected: boolean;
  onPress: () => void;
}

function CategoryCard({ cat, selected, onPress }: CategoryCardProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const type = useType();
  const Icon = getCategoryIcon(cat);
  const scale = useRef(new Animated.Value(1)).current;

  // A subtle pop on the icon confirms the selection.
  useEffect(() => {
    if (selected) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: 110, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
      ]).start();
    }
  }, [selected, scale]);

  const count: number | undefined =
    typeof cat.availableProvidersCount === 'number' ? cat.availableProvidersCount : undefined;

  const hasAvailability = count !== undefined && count > 0;
  const availability = hasAvailability
    ? (count === 1 ? t('availableOne') : t('availableMany')).replace('{n}', String(count))
    : null;

  const cardBg = selected ? '#0F5B3A' : colors.surface;
  const borderColor = selected ? '#B4EB3B' : colors.border;
  const borderWidth = selected ? 2 : 1;

  // Icon container styles
  let iconBg = colors.raised;
  let iconColor = colors.textSecondary;
  if (selected) {
    iconBg = 'rgba(180, 235, 59, 0.2)';
    iconColor = '#B4EB3B';
  } else if (hasAvailability) {
    iconBg = '#E2F5B5';
    iconColor = '#0F5B3A';
  }

  const nameColor = selected ? '#FFFFFF' : colors.text;
  const dotColor = selected ? '#B4EB3B' : '#1FA64A';
  const availColor = selected ? '#B4EB3B' : '#17803A';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={availability ? `${cat.name}, ${availability}` : cat.name}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor,
          borderWidth,
        },
        pressed && !selected && { opacity: 0.88, transform: [{ scale: 0.985 }] },
      ]}
    >
      {/* Icon */}
      <Animated.View
        style={[
          styles.iconBox,
          {
            backgroundColor: iconBg,
            transform: [{ scale }],
          },
        ]}
      >
        <Icon size={20} color={iconColor} strokeWidth={1.8} />
      </Animated.View>

      {/* Text column */}
      <View style={styles.textCol}>
        <Txt
          variant="smallStrong"
          color={nameColor}
          numberOfLines={2}
          style={[styles.cardName, { fontFamily: type.bodyStrong.fontFamily }]}
        >
          {cat.name}
        </Txt>

        {hasAvailability && (
          <View style={styles.availabilityRow}>
            <View style={[styles.dot, { backgroundColor: dotColor }]} />
            <Txt
              variant="caption"
              color={availColor}
              numberOfLines={1}
              style={[styles.availText, { fontFamily: type.captionStrong.fontFamily }]}
            >
              {availability}
            </Txt>
          </View>
        )}
      </View>

      {/* Floating Selected Check Badge */}
      {selected && (
        <View style={[styles.checkBadge, { borderColor: colors.background }]}>
          <Check size={12} color="#0E1F16" strokeWidth={3.2} />
        </View>
      )}
    </Pressable>
  );
}

function SkeletonCard() {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View style={[styles.card, styles.skeletonCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Skeleton style={styles.iconBox} />
      <View style={styles.textCol}>
        <Skeleton style={{ width: '80%', height: 14 }} />
        <Skeleton style={{ width: '50%', height: 10, marginTop: 4 }} />
      </View>
    </View>
  );
}
