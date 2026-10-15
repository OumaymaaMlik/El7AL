import { StyleSheet } from 'react-native';
import { numeralFont } from '../../../shared/theme/typography';
import { radius, space } from '../../../shared/theme/tokens';

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { gap: space.md },
  skeletonRow: { height: 88, borderRadius: radius.md },
  skeletonPanel: { height: 220, borderRadius: radius.md },
  statRow: { flexDirection: 'row' },
  vLine: { width: 1 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  form: { padding: space.lg, gap: space.lg },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.sm,
    paddingStart: space.lg,
    paddingEnd: space.sm,
    minHeight: 60,
  },
  topupCard: { padding: space.lg, gap: space.lg },
  topupActions: { flexDirection: 'row', gap: space.md },
  amount: { fontFamily: numeralFont, fontSize: 34, lineHeight: 38 },
  amountUnit: { fontFamily: numeralFont, fontSize: 18 },
  disputeRow: { padding: space.lg, gap: space.sm },
});
