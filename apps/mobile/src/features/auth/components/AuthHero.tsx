import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { artwork } from '../../../shared/theme/artwork';
import { space } from '../../../shared/theme/tokens';
import { HeroArt } from '../../../shared/ui/HeroArt';
import { Txt } from '../../../shared/ui/Txt';

interface AuthHeroProps {
  /** Small capitals line above the title (Welcome only). */
  tag?: string;
  title: string;
  text: string;
  /** The smaller panel used on Login and Register. */
  compact?: boolean;
}

/** The green panel at the top of the access screens: the illustration, then what the screen offers. */
export function AuthHero({ tag, title, text, compact = false }: AuthHeroProps) {
  const colors = useThemeStore((state) => state.colors);
  const { language } = useTranslation();
  // Tight letter spacing suits the Latin headline; it would break the joined letters of Arabic.
  const spacing = language === 'ar' ? 0 : compact ? -0.8 : -1.2;
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.brand,
          borderRadius: compact ? 24 : 28,
          padding: compact ? space.md : space.lg,
          gap: compact ? 14 : 18,
        },
      ]}
    >
      <HeroArt height={compact ? 160 : 220} />
      <View style={styles.texts}>
        {Boolean(tag) && (
          <View style={styles.tagRow}>
            <View style={[styles.marker, { backgroundColor: colors.action }]} />
            <Txt variant="overline" color={artwork.tag} style={styles.tag}>
              {tag}
            </Txt>
          </View>
        )}
        <Txt
          variant={compact ? 'heading' : 'display'}
          accessibilityRole="header"
          color={colors.onBrand}
          style={[compact ? styles.titleCompact : styles.titleLarge, { letterSpacing: spacing }]}
        >
          {title}
        </Txt>
        <Txt variant="small" color={colors.onBrandMuted}>
          {text}
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { paddingBottom: 24 },
  texts: { paddingHorizontal: space.sm, gap: space.md },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  marker: { width: 8, height: 8, borderRadius: 4 },
  tag: { flexShrink: 1 },
  titleLarge: { fontSize: 32, lineHeight: 35 },
  titleCompact: { fontSize: 24, lineHeight: 27 },
});
