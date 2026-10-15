import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Edit3 } from 'lucide-react-native';
import { Avatar } from '../../../shared/ui/Avatar';
import { IconButton } from '../../../shared/ui/IconButton';
import { StatusBadge } from '../../../shared/ui/StatusBadge';
import { Txt } from '../../../shared/ui/Txt';
import { space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';

interface Props {
  name?: string | null;
  phone?: string | null;
  roleLabel: string;
  avatarUrl: string;
  avatarFailed: boolean;
  onAvatarError: () => void;
  onAvatarPress: () => void;
  onEdit: () => void;
}

export function ProfileIdentity({
  name,
  phone,
  roleLabel,
  avatarUrl,
  avatarFailed,
  onAvatarError,
  onAvatarPress,
  onEdit,
}: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  return (
    <View style={styles.identity}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voir la photo"
        onPress={onAvatarPress}
        style={({ pressed }) => [pressed && { opacity: 0.8 }]}
      >
        <Avatar uri={avatarUrl} name={name} failed={avatarFailed} onError={onAvatarError} />
      </Pressable>

      <View style={styles.flex}>
        <Txt variant="heading" numberOfLines={1}>
          {name || t('notProvided')}
        </Txt>
        <Txt variant="small" color={colors.textSecondary} numberOfLines={1}>
          {phone || t('notProvided')}
        </Txt>
        <View style={styles.tags}>
          <StatusBadge label={roleLabel} tone="neutral" icon="none" />
        </View>
      </View>

      <IconButton accessibilityLabel={t('editProfile')} onPress={onEdit}>
        <Edit3 size={18} color={colors.text} />
      </IconButton>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm },
});
