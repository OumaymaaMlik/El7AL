import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { Dialog } from '../../../shared/ui/Dialog';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useType } from '../../../shared/theme/useType';
import { hitTarget, inputReset, radius, space } from '../../../shared/theme/tokens';

interface RatingModalProps {
  visible: boolean;
  onSubmit: (rating: number, comment: string) => void;
  onClose: () => void;
  loading?: boolean;
}

/** The client rates the artisan after the job. */
export function RatingModal({ visible, onSubmit, onClose, loading = false }: RatingModalProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const type = useType();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [focused, setFocused] = useState(false);

  if (!visible) return null;

  return (
    <Dialog visible={visible} onClose={onClose} title={t('ratingModalTitle')} subtitle={t('ratingModalSub')}>
      <View
        accessibilityRole="adjustable"
        accessibilityLabel={t('ratingOutOfFive').replace('{n}', String(rating))}
        style={styles.starsRow}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= rating;
          return (
            <Pressable
              key={star}
              accessibilityRole="button"
              accessibilityLabel={t('starsLabel').replace('{n}', String(star))}
              accessibilityState={{ selected: active }}
              onPress={() => setRating(star)}
              style={({ pressed }) => [styles.star, pressed && { transform: [{ scale: 0.9 }] }]}
            >
              <Star
                size={34}
                color={active ? colors.star : colors.inputBorder}
                fill={active ? colors.star : 'transparent'}
              />
            </Pressable>
          );
        })}
      </View>

      <TextInput
        accessibilityLabel={t('writeComment')}
        style={[
          type.body,
          styles.commentInput,
          inputReset,
          {
            backgroundColor: colors.background,
            color: colors.text,
            borderColor: focused ? colors.accentText : colors.inputBorder,
          },
        ]}
        placeholder={t('writeComment')}
        placeholderTextColor={colors.textMuted}
        multiline
        value={comment}
        onChangeText={setComment}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      <Button title={t('submitReview')} onPress={() => onSubmit(rating, comment)} loading={loading} />
    </Dialog>
  );
}

const styles = StyleSheet.create({
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  star: {
    width: hitTarget + 8,
    height: hitTarget + 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentInput: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingTop: space.md,
    paddingBottom: space.md,
    textAlignVertical: 'top',
  },
});
