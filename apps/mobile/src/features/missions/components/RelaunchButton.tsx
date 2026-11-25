import { Pressable, StyleSheet } from 'react-native';
import { RotateCw } from 'lucide-react-native';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useRelaunch } from '../hooks/useRelaunch';
import type { Mission } from '../schemas/mission.schema';

/** A request that ended without an artisan can be sent again; every other request shows nothing here. */
export function RelaunchButton({ mission }: { mission: Mission }) {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  const { relaunch, busyId } = useRelaunch();
  if (mission.status !== 'CANCELLED' || mission.provider) return null;

  const busy = busyId === mission.id;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('relaunch')}
      disabled={busy}
      hitSlop={8}
      onPress={() => void relaunch(mission.id)}
      style={({ pressed }) => [styles.button, (pressed || busy) && { opacity: 0.6 }]}
    >
      <RotateCw size={14} color={colors.accentText} strokeWidth={2.4} />
      <Txt variant="smallStrong" color={colors.accentText}>
        {t('relaunch')}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, minHeight: 32 },
});
