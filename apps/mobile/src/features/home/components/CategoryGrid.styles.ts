import { StyleSheet } from 'react-native';
import { space } from '../../../shared/theme/tokens';

export const styles = StyleSheet.create({
  grid: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    height: 72,
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    position: 'relative',
    overflow: 'visible',
  },
  cardPlaceholder: {
    flex: 1,
    height: 72,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 2,
  },
  cardName: {
    fontSize: 14,
    lineHeight: 18,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  checkBadge: {
    position: 'absolute',
    top: -8,
    end: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#B4EB3B',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  skeletonCard: {
    borderWidth: 1,
  },
  errorContainer: {
    padding: space.lg,
    borderRadius: 16,
    borderWidth: 1,
    gap: space.md,
  },
});
