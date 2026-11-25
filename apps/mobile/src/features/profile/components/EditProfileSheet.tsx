import { Pressable, StyleSheet, View } from 'react-native';
import { AlertTriangle, Camera, Mail, MapPin, Phone, ShieldCheck, User } from 'lucide-react-native';
import { Avatar } from '../../../shared/ui/Avatar';
import { BottomSheet } from '../../../shared/ui/BottomSheet';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Txt } from '../../../shared/ui/Txt';
import { radius, space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import type { EditProfileForm } from '../hooks/useEditProfile';

const RADIUS_OPTIONS = [5, 10, 15, 25, 50];

interface Props {
  form: EditProfileForm;
  isClient: boolean;
  displayName?: string | null;
}

export function EditProfileSheet({ form, isClient, displayName }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();

  return (
    <BottomSheet visible={form.editOpen} onClose={() => form.setEditOpen(false)} title={t('editProfile')}>
      <View style={styles.form}>
        <View style={styles.avatarWrap}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('changePhoto')}
            onPress={form.pickAvatar}
            style={({ pressed }) => [pressed && { opacity: 0.8 }]}
          >
            <Avatar
              uri={form.avatarUrl}
              name={displayName || form.fullName}
              size={80}
              failed={form.avatarFailed}
              onError={() => form.setAvatarFailed(true)}
            />
            <View
              style={[
                styles.cameraBadge,
                { backgroundColor: colors.brand, borderColor: colors.background, end: 0, bottom: 0 },
              ]}
            >
              <Camera size={14} color={colors.onBrand} />
            </View>
          </Pressable>
        </View>

        <Input
          label={t('fullName')}
          placeholder="Ahmed Ben Ali"
          value={form.fullName}
          onChangeText={form.setFullName}
          autoCapitalize="words"
          icon={<User size={18} color={colors.textMuted} />}
        />
        <Input
          label={t('phone') || 'Téléphone'}
          placeholder="22 123 456"
          value={form.phoneNumber}
          editable={false}
          keyboardType="phone-pad"
          icon={<Phone size={18} color={colors.textMuted} />}
        />
        <Input
          label={t('email') || 'E-mail'}
          placeholder="ahmed@example.com"
          value={form.email}
          onChangeText={form.setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          icon={<Mail size={18} color={colors.textMuted} />}
        />
        <Pressable accessibilityRole="button" onPress={() => form.setPasswordOpen(true)}>
          <View pointerEvents="none">
            <Input
              label={t('password') || 'Mot de passe'}
              placeholder="••••••••"
              value="********"
              onChangeText={() => {}}
              secureTextEntry
              icon={<ShieldCheck size={18} color={colors.textMuted} />}
              editable={false}
            />
          </View>
        </Pressable>

        <View style={{ gap: space.md }}>
          <Input
            label={t('address')}
            placeholder="Lac 2, Tunis"
            value={form.address}
            onChangeText={form.setAddress}
            icon={<MapPin size={18} color={colors.textMuted} />}
          />
          <Button
            title={t('placeOnMap')}
            variant="outline"
            onPress={() => form.setMapOpen(true)}
            iconPosition="left"
            icon={<MapPin size={16} color={colors.accentText} />}
          />
        </View>

        {!isClient && (
          <>
            <Input
              label={`${t('bio')} ${t('optionalTag')}`}
              placeholder={t('bioPlaceholder')}
              multiline
              value={form.bio}
              onChangeText={form.setBio}
            />
            <View style={{ gap: space.sm }}>
              <Txt variant="captionStrong" color={colors.textSecondary}>
                {t('radiusLabel')}
              </Txt>
              <View style={styles.radii}>
                {RADIUS_OPTIONS.map((km) => {
                  const on = form.radiusKm === km;
                  return (
                    <Pressable
                      key={km}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: on }}
                      onPress={() => form.setRadiusKm(km)}
                      style={[
                        styles.radiusChip,
                        {
                          backgroundColor: on ? colors.brand : 'transparent',
                          borderColor: on ? colors.brand : colors.inputBorder,
                        },
                      ]}
                    >
                      <Txt variant="smallStrong" color={on ? colors.onBrand : colors.textSecondary}>
                        {`${km} km`}
                      </Txt>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {Boolean(form.error) && (
          <View accessibilityRole="alert" style={[styles.banner, { backgroundColor: colors.dangerSoft }]}>
            <AlertTriangle size={16} color={colors.dangerText} />
            <Txt variant="small" color={colors.dangerText} style={styles.flex}>
              {form.error}
            </Txt>
          </View>
        )}

        <Button title={t('save')} onPress={form.save} loading={form.saving} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { gap: space.lg },
  radii: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  radiusChip: {
    minHeight: 44,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  avatarWrap: { alignSelf: 'center', marginBottom: space.sm },
  cameraBadge: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.sm,
  },
});
