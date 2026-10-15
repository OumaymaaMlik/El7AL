import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 99999,
  },

  // -----------------------------------------------------------------
  // Message Banner: 72px height, 20px radius, Near-black green #0E1F16
  // -----------------------------------------------------------------
  chatBanner: {
    minHeight: 72,
    maxHeight: 74,
    backgroundColor: '#0E1F16',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: 14,
    paddingEnd: 6,
    paddingVertical: 10,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },

  // Avatar with 2px Lime Accent (#A3E635)
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#A3E635',
    overflow: 'hidden',
    backgroundColor: '#16291E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A3324',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Chat Content
  chatContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingEnd: 4,
  },
  senderTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  timestampText: {
    color: '#8FA094',
    fontSize: 11,
    marginStart: 8,
  },
  messageText: {
    color: '#D1DCD5',
    fontSize: 14,
    lineHeight: 18,
  },

  // -----------------------------------------------------------------
  // One-line Toast: Compact ~48px height, Green/Red icon, No Avatar
  // -----------------------------------------------------------------
  smallToast: {
    minHeight: 48,
    backgroundColor: '#0E1F16',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: 14,
    paddingEnd: 6,
    paddingVertical: 8,
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  smallIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallContent: {
    flex: 1,
    justifyContent: 'center',
  },
  smallTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  smallBody: {
    color: '#B4C2B8',
    fontWeight: '400',
  },

  errorBorder: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  successBorder: {
    borderColor: 'rgba(163, 230, 53, 0.3)',
  },

  // 44px Minimum Touch Target Close Buttons
  closeTarget: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeTargetSmall: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
