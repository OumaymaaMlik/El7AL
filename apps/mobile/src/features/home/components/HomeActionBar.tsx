import React, { useEffect, useRef, useState } from 'react';
import type { Category } from '../../categories';
import { Animated, View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { ArrowRight, Bell } from 'lucide-react-native';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useType } from '../../../shared/theme/useType';
import { gutter, space } from '../../../shared/theme/tokens';

export interface HomeActionBarProps {
  /** The currently selected category (if any). */
  category: Category | null;
  /** Whether the action bar is visible. */
  visible: boolean;
  /** Distance from screen bottom (typically tabBarHeight + bottomInset). */
  bottomOffset: number;
  /** Primary action callback (e.g. open request sheet). */
  onConfirm: () => void;
  /** Callback when zero pros are available and user wants to be notified. */
  onNotifyAvailable?: () => void;
  /** Loading state during search or submission. */
  loading?: boolean;
  /** Disabled override. */
  disabled?: boolean;
}

const BAR_HEIGHT_ESTIMATE = 142;

export function HomeActionBar({
  category,
  visible,
  bottomOffset,
  onConfirm,
  onNotifyAvailable,
  loading = false,
  disabled = false,
}: HomeActionBarProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const type = useType();

  // Slide animation for smooth Uber-style docked bar entry & exit
  const slideAnim = useRef(new Animated.Value(BAR_HEIGHT_ESTIMATE + 20)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 65,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: BAR_HEIGHT_ESTIMATE + 20,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setMounted(false);
      });
    }
  }, [visible, slideAnim]);

  if (!mounted && !visible) {
    return null;
  }

  const count: number | undefined =
    typeof category?.availableProvidersCount === 'number' ? category.availableProvidersCount : undefined;

  const isZeroAvailable = count === 0;

  // Format availability text for top line
  let availabilityText = '';
  if (count === undefined) {
    availabilityText = t('qualifiedPro');
  } else if (count === 0) {
    availabilityText = t('artisanNoneAvailable');
  } else if (count === 1) {
    availabilityText = t('artisanAvailableOne');
  } else {
    availabilityText = t('artisanAvailableMany').replace('{n}', String(count));
  }

  // Determine button label and icon based on state
  let buttonLabel = t('findArtisanShort');
  if (isZeroAvailable) {
    buttonLabel = t('notifyWhenAvailable');
  }

  const isDisabled = disabled || !category;

  const handlePress = () => {
    if (isDisabled || loading) return;
    if (isZeroAvailable && onNotifyAvailable) {
      onNotifyAvailable();
    } else {
      onConfirm();
    }
  };

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.container,
        {
          bottom: bottomOffset,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* 1. TOP LINE: Service name (15px semibold) · availability (smaller and green) */}
      <View style={styles.topLine}>
        <Text
          style={[
            styles.serviceName,
            {
              color: colors.text,
              fontFamily: type.bodyStrong.fontFamily,
            },
          ]}
          numberOfLines={1}
        >
          {category?.name || ''}
        </Text>
        <Text style={[styles.separator, { color: colors.textMuted }]}>·</Text>
        <Text
          style={[
            styles.availability,
            {
              color: isZeroAvailable ? colors.textMuted : colors.accentText || '#0F5B3A',
              fontFamily: type.captionStrong.fontFamily,
            },
          ]}
          numberOfLines={1}
        >
          {availabilityText}
        </Text>
      </View>

      {/* 2. CALMER SOLID DARK GREEN BUTTON: 56px high, 16px radius, bold 16px label, arrow on right */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={buttonLabel}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        onPress={handlePress}
        disabled={isDisabled || loading}
        style={({ pressed }) => [
          styles.button,
          isDisabled ? [styles.buttonDisabled, { backgroundColor: colors.raised }] : styles.buttonActive,
          pressed && !isDisabled && !loading && styles.buttonPressed,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <View style={styles.buttonContent}>
            <Text
              style={[
                styles.buttonLabel,
                {
                  fontFamily: type.button.fontFamily,
                  color: isDisabled ? colors.textMuted : '#FFFFFF',
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {buttonLabel}
            </Text>
            {isZeroAvailable ? (
              <Bell size={18} color={isDisabled ? colors.textMuted : '#FFFFFF'} strokeWidth={2.2} />
            ) : (
              <Mirrored>
                <ArrowRight size={18} color={isDisabled ? colors.textMuted : '#FFFFFF'} strokeWidth={2.4} />
              </Mirrored>
            )}
          </View>
        )}
      </Pressable>

      {/* 3. TRUST LINE: 12px muted text reducing hesitation */}
      <Text
        style={[
          styles.trustLine,
          {
            color: colors.textMuted,
            fontFamily: type.caption.fontFamily,
          },
        ]}
        numberOfLines={1}
      >
        {t('trustLineHome')}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: gutter,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 8,
    // Soft shadow for docked action bar
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 99,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  serviceName: {
    fontSize: 15,
    lineHeight: 20,
    flexShrink: 1,
  },
  separator: {
    fontSize: 14,
    lineHeight: 18,
  },
  availability: {
    fontSize: 13,
    lineHeight: 18,
    flexShrink: 1,
  },
  button: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  buttonActive: {
    backgroundColor: '#0F5B3A',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  buttonLabel: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  trustLine: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});
