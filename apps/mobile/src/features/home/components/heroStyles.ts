import { StyleSheet } from 'react-native';

/** Styles shared by the idle (non-mission) hero panels of the client and the artisan. */
export const heroStyles = StyleSheet.create({
  hero: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#0F5B3A',
    gap: 12,
  },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#B4EB3B',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: '#B4EB3B',
  },
  mainTitle: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#FFFFFF',
  },
});
