import type { LucideIcon } from 'lucide-react-native';
import { View, Text, Pressable, Animated, Image } from 'react-native';
import { CheckCircle2, AlertTriangle, XCircle, Bell, X, Zap } from 'lucide-react-native';
import type { NotificationType } from '../store/useNotificationStore';
import { useToastController } from '../hooks/useToastController';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { initialsOf, capitalize } from '../../../shared/utils/format';
import { styles } from './NotificationToast.styles';

const ICON_MAP: Record<NotificationType, LucideIcon> = {
  CHAT: Bell,
  OFFER: Zap,
  ACCEPT: CheckCircle2,
  CANCEL: XCircle,
  COMPLETED: CheckCircle2,
  SYSTEM: Bell,
};

export function NotificationToast() {
  const { t } = useTranslation();
  const { activeToast, opacity, translateY, panHandlers, dismiss, avatarFailed, setAvatarFailed } =
    useToastController();

  if (!activeToast) return null;

  const isChat = activeToast.type === 'CHAT';
  const tone =
    activeToast.tone ||
    (activeToast.type === 'CANCEL'
      ? 'error'
      : activeToast.type === 'ACCEPT' || activeToast.type === 'COMPLETED'
        ? 'success'
        : 'info');

  // Tone colors for smaller one-line toast
  const isError = tone === 'error';
  const isSuccess = tone === 'success';
  const iconColor = isError ? '#EF4444' : isSuccess ? '#A3E635' : '#60A5FA';
  const ToastIcon = isError ? AlertTriangle : isSuccess ? CheckCircle2 : ICON_MAP[activeToast.type] || Bell;

  const senderName = activeToast.senderName || activeToast.title || t('notifNewMessage');
  const avatarUrl = activeToast.senderAvatar || activeToast.metadata?.senderAvatar;
  const messageBody = activeToast.message ? capitalize(activeToast.message) : '';

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          top: 0,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View
        {...panHandlers}
        accessibilityRole="alert"
        style={[
          isChat ? styles.chatBanner : styles.smallToast,
          isError && styles.errorBorder,
          isSuccess && styles.successBorder,
        ]}
      >
        {isChat ? (
          // ===============================================================
          // TYPE 1: MESSAGE BANNER (72px, Near-black green #0E1F16, Sender Avatar)
          // ===============================================================
          <>
            {/* Sender Avatar with 2px Lime Accent */}
            <View style={styles.avatarContainer}>
              {avatarUrl && !avatarFailed ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} onError={() => setAvatarFailed(true)} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>{initialsOf(senderName)}</Text>
                </View>
              )}
            </View>

            {/* Sender Name & Message Body */}
            <View style={styles.chatContent}>
              <View style={styles.headerRow}>
                <Text style={styles.senderTitle} numberOfLines={1}>
                  {senderName}
                </Text>
                <Text style={styles.timestampText}>{t('now') || 'maintenant'}</Text>
              </View>

              <Text style={styles.messageText} numberOfLines={1}>
                {messageBody}
              </Text>
            </View>

            {/* Accessible 44px Close Target */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('close')}
              hitSlop={8}
              onPress={(e) => {
                e.stopPropagation?.();
                dismiss();
              }}
              style={styles.closeTarget}
            >
              <X size={16} color="#8FA094" />
            </Pressable>
          </>
        ) : (
          // ===============================================================
          // TYPE 2: ONE-LINE TOAST (Smaller, Green/Red/System Icon, No Avatar)
          // ===============================================================
          <>
            <View style={styles.smallIconBox}>
              <ToastIcon size={18} color={iconColor} strokeWidth={2.2} />
            </View>

            <View style={styles.smallContent}>
              <Text style={styles.smallTitle} numberOfLines={1}>
                {activeToast.title}
                {Boolean(activeToast.message) && <Text style={styles.smallBody}> · {activeToast.message}</Text>}
              </Text>
            </View>

            {/* Accessible 44px Close Target */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('close')}
              hitSlop={8}
              onPress={(e) => {
                e.stopPropagation?.();
                dismiss();
              }}
              style={styles.closeTargetSmall}
            >
              <X size={15} color="#8FA094" />
            </Pressable>
          </>
        )}
      </View>
    </Animated.View>
  );
}
