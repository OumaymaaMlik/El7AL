import { StyleSheet } from 'react-native';
import { space, radius } from '../../../shared/theme/tokens';

export const styles = StyleSheet.create({
  container: {
    gap: space.md,
    paddingBottom: space.lg,
  },
  iconCenter: {
    alignItems: 'center',
    marginTop: space.xs,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    paddingHorizontal: space.sm,
    gap: 4,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: space.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  resendRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.xs,
  },
  resendPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: space.xs,
  },
});
