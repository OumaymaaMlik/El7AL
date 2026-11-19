import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock } from 'lucide-react-native';
import { BrandMark } from '../../../shared/ui/BrandMark';
import { Button } from '../../../shared/ui/Button';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { gutter } from '../../../shared/theme/tokens';
import { useTopPad } from '../../../shared/theme/useTopPad';
import { ROUTES } from '../../../navigation/routes';
import { useAuthStore } from '../../auth';

/** What a client sees while the client side of the app is not open yet: a short message and a way out. */
export function ClientComingSoon() {
  const router = useRouter();
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  const topPad = useTopPad();
  const logout = useAuthStore((s) => s.logout);

  const leave = async () => {
    await logout();
    router.replace(ROUTES.welcome);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.hero, paddingTop: topPad + 16 }]}>
      <BrandMark onDark />
      <View style={styles.center}>
        <View style={styles.disc}>
          <Clock size={44} color={colors.live} strokeWidth={2.2} />
        </View>
        <Txt variant="title" color={colors.onBrand} style={styles.text} accessibilityRole="header">
          {t('comingSoonTitle')}
        </Txt>
        <Txt variant="body" color={colors.onBrandMuted} style={styles.text}>
          {t('comingSoonSub')}
        </Txt>
      </View>
      <Button title={t('logout')} variant="accent" onPress={leave} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: gutter, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  disc: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 10,
  },
  text: { textAlign: 'center' },
  button: { alignSelf: 'stretch' },
});
