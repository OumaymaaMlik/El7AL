import { useEffect, useRef } from 'react';
import type { Category } from '../../categories';
import { Animated, Pressable, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useType } from '../../../shared/theme/useType';
import { Button } from '../../../shared/ui/Button';
import { Skeleton } from '../../../shared/ui/Skeleton';
import { Txt } from '../../../shared/ui/Txt';
import { ToolIcon } from '../../../shared/ui/art/ToolIcon';
import { toolForCategory } from '../../../shared/ui/art/toolArt';
import { styles } from './CategoryGrid.styles';
import { getCategoryIcon } from './categoryIcons';

interface CategoryGridProps {
  categories: Category[];
  loading: boolean;
  /** True when the last load failed. Shows a message and a retry button. */
  error: boolean;
  selectedId?: string | null;
  /** The category to guide the choice to (the most available), if there is a clear one. */
  popularId?: string | null;
  onSelect: (category: Category) => void;
  onRetry: () => void;
}

/**
 * 2-column card grid redesign matching the refined client home layout.
 */
export function CategoryGrid({
  categories,
  loading,
  error,
  selectedId,
  popularId,
  onSelect,
  onRetry,
}: CategoryGridProps) {
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
          <CategoryCard
            cat={pair[0]}
            selected={selectedId === pair[0].id}
            popular={popularId === pair[0].id}
            onPress={() => onSelect(pair[0])}
          />
          {pair[1] ? (
            <CategoryCard
              cat={pair[1]}
              selected={selectedId === pair[1].id}
              popular={popularId === pair[1].id}
              onPress={() => onSelect(pair[1])}
            />
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
  popular: boolean;
  onPress: () => void;
}

function CategoryCard({ cat, selected, popular, onPress }: CategoryCardProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const type = useType();
  const Icon = getCategoryIcon(cat);
  const tool = toolForCategory(cat.name, cat.icon);
  // The tool wakes up when its tile is chosen (a small overshoot), then rests tilted, as in the prototype.
  const tilt = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(tilt, { toValue: selected ? 1 : 0, friction: 4, tension: 120, useNativeDriver: true }).start();
  }, [selected, tilt]);

  const count: number | undefined =
    typeof cat.availableProvidersCount === 'number' ? cat.availableProvidersCount : undefined;
  const hasAvailability = count !== undefined && count > 0;
  const availability = hasAvailability ? t('onlineCount').replace('{n}', String(count)) : null;

  // A figure that changes drops in softly (the online count moves while you look at it).
  const tick = useRef(new Animated.Value(1)).current;
  const lastCount = useRef(count);
  useEffect(() => {
    if (lastCount.current === count) return;
    lastCount.current = count;
    tick.setValue(0);
    Animated.timing(tick, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [count, tick]);

  const rotate = tilt.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-10deg'] });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={availability ? `${cat.name}, ${availability}` : cat.name}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: selected ? colors.brand : colors.border },
        selected && styles.cardSelected,
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
    >
      {selected && (
        <View style={[styles.check, { backgroundColor: colors.brand }]}>
          <Check size={12} color="#fff" strokeWidth={3.4} />
        </View>
      )}

      {!selected && popular && (
        <View style={[styles.popular, { backgroundColor: colors.live }]}>
          <Txt variant="captionStrong" color={colors.onLive} style={styles.popularText}>
            {`★ ${t('popularBadge')}`}
          </Txt>
        </View>
      )}

      {tool ? (
        <Animated.View style={[styles.art, { transform: [{ rotate }], transformOrigin: '50% 10%' }]}>
          <ToolIcon tool={tool} palette={selected ? 'light' : 'grey'} width={36} height={58} />
        </Animated.View>
      ) : (
        <View style={[styles.fallbackIcon, { backgroundColor: colors.tint }]}>
          <Icon size={22} color={selected ? colors.accentText : colors.textMuted} strokeWidth={1.9} />
        </View>
      )}

      <Txt
        variant="bodyStrong"
        color={colors.text}
        numberOfLines={2}
        style={[styles.cardName, { fontFamily: type.heading.fontFamily }]}
      >
        {cat.name}
      </Txt>

      {hasAvailability && (
        <Animated.View
          style={[
            styles.availabilityRow,
            {
              opacity: tick,
              transform: [{ translateY: tick.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }],
            },
          ]}
          accessible={false}
        >
          <View style={[styles.dot, { backgroundColor: colors.positive }]} />
          <Txt
            variant="caption"
            color={colors.textMuted}
            style={[styles.availText, { fontFamily: type.captionStrong.fontFamily }]}
          >
            {availability}
          </Txt>
        </Animated.View>
      )}
    </Pressable>
  );
}

function SkeletonCard() {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View style={[styles.card, styles.skeletonCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Skeleton style={{ width: '70%', height: 16 }} />
      <Skeleton style={{ width: '45%', height: 11, marginTop: 6 }} />
    </View>
  );
}
