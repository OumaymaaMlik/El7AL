import { useState, useEffect, useRef } from 'react';
import { View, Pressable } from 'react-native';
import { BottomSheet } from '../../../shared/ui/BottomSheet';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { space } from '../../../shared/theme/tokens';
import { ShieldCheck, Mail, RotateCw, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { sendEmailVerification, verifyEmailCode } from '../api/auth.api';
import { styles } from './OtpVerificationSheet.styles';

interface OtpVerificationSheetProps {
  visible: boolean;
  onClose: () => void;
  onVerify?: () => void;
  onSuccess?: () => Promise<void> | void;
  email?: string;
  identifier?: string;
  loading?: boolean;
  initialCode?: string;
  fullName?: string;
  /** How a code is sent and checked; defaults to the sign-up flow. The profile passes the e-mail change flow. */
  sendCode?: (email: string, fullName?: string) => Promise<{ success: boolean; message?: string }>;
  checkCode?: (email: string, code: string) => Promise<boolean>;
}

export function OtpVerificationSheet({
  visible,
  onClose,
  onVerify,
  onSuccess,
  email,
  identifier,
  loading: parentLoading,
  initialCode,
  fullName,
  sendCode = sendEmailVerification,
  checkCode = verifyEmailCode,
}: OtpVerificationSheetProps) {
  const { t } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const targetEmail = (email || identifier || '').trim();

  const [code, setCode] = useState(initialCode || '');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      setCode(initialCode || '');
      setErrorMessage(null);
      setFeedbackMessage(null);
      setCountdown(60);

      // Start 60s countdown
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible, initialCode]);

  const handleResend = async () => {
    if (countdown > 0 || resending || !targetEmail) return;
    setResending(true);
    setErrorMessage(null);
    setFeedbackMessage(null);

    try {
      const res = await sendCode(targetEmail, fullName);
      if (res.success) {
        setFeedbackMessage(t('codeSentSuccess') || 'Nouveau code envoyé par e-mail.');
        setCountdown(60);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              if (timerRef.current) clearInterval(timerRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setErrorMessage(res.message || "Impossible d'envoyer le code.");
      }
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Erreur lors de l'envoi du code."));
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    const cleanCode = code.trim();
    if (cleanCode.length === 0) return;

    // If targetEmail is present, verify directly against the API
    if (targetEmail) {
      setVerifying(true);
      setErrorMessage(null);
      try {
        const verified = await checkCode(targetEmail, cleanCode);

        if (verified) {
          setCode('');
          if (onSuccess) {
            await onSuccess();
          } else if (onVerify) {
            onVerify();
          }
        }
      } catch (err) {
        setErrorMessage(getApiErrorMessage(err, t('invalidCode') || 'Code incorrect ou expiré.'));
      } finally {
        setVerifying(false);
      }
    } else {
      // Fallback to parent verify callback
      if (onSuccess) {
        await onSuccess();
      } else if (onVerify) {
        onVerify();
      }
      setCode('');
    }
  };

  const isSubmitting = verifying || Boolean(parentLoading);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('emailVerification') || 'Vérification Email'}>
      <View style={styles.container}>
        {/* Brand Icon Header */}
        <View style={styles.iconCenter}>
          <View style={[styles.iconCircle, { backgroundColor: colors.raised }]}>
            <Mail size={26} color={colors.accentText} />
          </View>
        </View>

        <View style={styles.textWrap}>
          <Txt variant="bodyMedium" color={colors.textSecondary} style={{ textAlign: 'center' }}>
            {t('otpDesc') || 'Un code de vérification à 6 chiffres a été envoyé à'}
          </Txt>
          {Boolean(targetEmail) && (
            <Txt variant="bodyStrong" color={colors.text} style={{ textAlign: 'center', marginTop: 2 }}>
              {targetEmail}
            </Txt>
          )}
        </View>

        {/* Inline Feedback / Error */}
        {Boolean(errorMessage) && (
          <View style={[styles.alertBanner, { backgroundColor: colors.dangerSoft, borderColor: colors.dangerText }]}>
            <AlertTriangle size={16} color={colors.dangerText} />
            <Txt variant="small" color={colors.dangerText} style={{ flex: 1 }}>
              {errorMessage}
            </Txt>
          </View>
        )}

        {Boolean(feedbackMessage) && !errorMessage && (
          <View style={[styles.alertBanner, { backgroundColor: colors.raised, borderColor: colors.accentText }]}>
            <CheckCircle2 size={16} color={colors.accentText} />
            <Txt variant="small" color={colors.accentText} style={{ flex: 1 }}>
              {feedbackMessage}
            </Txt>
          </View>
        )}

        {/* 6-digit Code Input */}
        <Input
          label={t('verificationCode') || 'Code de vérification'}
          placeholder="••••••"
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={(val) => {
            setCode(val.replace(/\D/g, ''));
            if (errorMessage) setErrorMessage(null);
          }}
          icon={<ShieldCheck size={18} color={colors.textMuted} />}
          autoFocus={visible}
        />

        {/* Action Button */}
        <Button
          title={t('verifyAndContinue') || 'Vérifier & Continuer'}
          onPress={handleVerify}
          loading={isSubmitting}
          disabled={code.trim().length === 0 || isSubmitting}
          style={{ marginTop: space.sm }}
        />

        {/* Resend Action */}
        <View style={styles.resendRow}>
          {countdown > 0 ? (
            <Txt variant="small" color={colors.textMuted}>
              {t('resendCodeIn')?.replace('{n}', String(countdown)) || `Renvoyer le code dans ${countdown}s`}
            </Txt>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={handleResend}
              disabled={resending}
              style={({ pressed }) => [styles.resendPressable, pressed && { opacity: 0.7 }]}
            >
              <RotateCw size={14} color={colors.accentText} />
              <Txt variant="smallStrong" color={colors.accentText}>
                {resending ? 'Envoi…' : t('resendCode') || 'Renvoyer le code'}
              </Txt>
            </Pressable>
          )}
        </View>

        {/* Helpful Spam folder notice */}
        <Txt variant="caption" color={colors.textMuted} style={{ textAlign: 'center', marginTop: 2 }}>
          💡 {t('checkSpamNotice') || 'Pensez à vérifier votre dossier Spam ou Courrier indésirable.'}
        </Txt>
      </View>
    </BottomSheet>
  );
}
