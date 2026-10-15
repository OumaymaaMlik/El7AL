import { StyleSheet } from 'react-native';
import { numeralFont } from '../../../shared/theme/typography';

export const styles = StyleSheet.create({
  sectionContainer: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gridRow: {
    flexDirection: 'row',
  },
  statCell: {
    flex: 1,
    minHeight: 104,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 6,
    justifyContent: 'center',
  },
  cellBorderRight: {
    borderRightWidth: 1,
  },
  cellBorderBottom: {
    borderBottomWidth: 1,
  },
  cellLabel: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 16,
  },
  cellValue: {
    fontFamily: numeralFont,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  ratingValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  cellUnit: {
    fontSize: 14,
    fontWeight: '700',
  },
  cellHint: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  historyLink: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyLinkText: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyBox: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  avatarFallback: {
    backgroundColor: '#EEF1EC',
  },
  avatarFallbackText: {
    fontFamily: numeralFont,
    fontSize: 15,
    fontWeight: '800',
    color: '#0E1F16',
  },
  clientInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  clientService: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  clientDate: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#E2F5B5',
    flexShrink: 0,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F5B3A',
  },
});
