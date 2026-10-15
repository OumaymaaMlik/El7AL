import { useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, MapPin, Car, Zap, Wrench } from 'lucide-react-native';
import { useIncomingOffer, OFFER_SECONDS } from '../hooks/useIncomingOffer';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { initialsOf } from '../../../shared/utils/format';
import { styles } from './IncomingOfferModal.styles';

/**
 * Avatar with image support (if client has uploaded an avatar)
 * or fallback initials badge (#EEF1EC, 15px font-weight 800).
 */
function OfferClientAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (avatarUrl && !imgFailed) {
    return (
      <View style={styles.avatarWrap}>
        <Image
          source={{ uri: avatarUrl }}
          style={styles.avatarImg}
          resizeMode="cover"
          onError={() => setImgFailed(true)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.avatarWrap, styles.avatarFallback]}>
      <Text style={styles.avatarText}>{initialsOf(name)}</Text>
    </View>
  );
}

/**
 * Redesigned Incoming Offer Sheet for Providers matching the refined design.
 * Features:
 * - 48x48 pistachio badge (#E2F5B5) with category icon
 * - 16px rounded mission card (#E1E7DF border)
 * - Client avatar image (or initials fallback) + address + description + commission
 * - Tabular countdown timer with 6px green progress bar (#0F5B3A)
 * - 56px Lime accept button (#B4EB3B) & 52px clean refuse button
 */
export function IncomingOfferModal() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { offer, countdown, accepting, handleAccept, handleRefuse } = useIncomingOffer();

  if (!offer) return null;

  const progressPercent = Math.max(0, Math.min(100, (countdown / OFFER_SECONDS) * 100));

  const clientName: string = offer.clientName || t('client');
  const clientAvatarUrl: string | null = offer.clientAvatarUrl || null;
  const categoryTitle: string = offer.categoryName || t('nearbyRequest');
  const lower = categoryTitle.toLowerCase();
  const CategoryIcon = lower.includes('méc') || lower.includes('auto') ? Car : lower.includes('élec') ? Zap : Wrench;

  const commissionValue = Number(offer.commissionFee) || 30;
  const addressText = offer.addressText;
  const descriptionText = offer.description || '';

  return (
    <Modal
      visible={!!offer}
      transparent={true}
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={() => {}}
    >
      <View style={styles.backdrop}>
        <View
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}
          accessibilityRole="alert"
          aria-modal={true}
        >
          {/* Header: Badge + Title + Category */}
          <View style={styles.headerRow}>
            <View style={styles.iconCircle}>
              <CategoryIcon size={24} color="#0F5B3A" strokeWidth={1.8} />
            </View>
            <View style={styles.titleColumn}>
              <Text style={styles.sheetTitle}>Nouvelle mission</Text>
              <Text style={styles.categorySubtitle}>{categoryTitle}</Text>
            </View>
          </View>

          {/* Main Mission Card Box */}
          <View style={styles.cardContainer}>
            {/* Section 1: Client Info */}
            <View style={styles.clientRow}>
              <OfferClientAvatar name={clientName} avatarUrl={clientAvatarUrl} />
              <View style={styles.clientInfo}>
                <Text style={styles.clientName} numberOfLines={1}>
                  {clientName}
                </Text>
                <View style={styles.locationRow}>
                  <MapPin size={14} color="#4F5E54" strokeWidth={2} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {addressText}
                  </Text>
                </View>
              </View>
            </View>

            {/* Section 2: Description */}
            <View style={styles.descriptionBlock}>
              <Text style={styles.descriptionLabel}>Description</Text>
              <Text style={styles.descriptionText} numberOfLines={3}>
                {descriptionText}
              </Text>
            </View>

            {/* Section 3: Commission */}
            <View style={styles.commissionRow}>
              <Text style={styles.commissionLabel}>Commission</Text>
              <Text style={styles.commissionValue}>{commissionValue} DT</Text>
            </View>
          </View>

          {/* Countdown Section */}
          <View
            style={styles.countdownSection}
            accessible={true}
            accessibilityLabel={`Temps restant: ${countdown} secondes`}
          >
            <View style={styles.countdownHeader}>
              <Text style={styles.countdownLabel}>Temps restant</Text>
              <View style={styles.countdownValueRow}>
                <Text style={styles.countdownNumber}>{countdown}</Text>
                <Text style={styles.countdownUnit}>s</Text>
              </View>
            </View>
            <View style={styles.progressTrack} aria-hidden={true}>
              <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            {/* Accept Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Accepter la mission"
              onPress={handleAccept}
              disabled={accepting}
              style={({ pressed }) => [styles.acceptButton, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
            >
              {accepting ? (
                <ActivityIndicator size="small" color="#0E1F16" />
              ) : (
                <>
                  <Check size={20} color="#0E1F16" strokeWidth={2.6} />
                  <Text style={styles.acceptButtonText}>Accepter la mission</Text>
                </>
              )}
            </Pressable>

            {/* Refuse Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Refuser"
              onPress={handleRefuse}
              disabled={accepting}
              style={({ pressed }) => [styles.refuseButton, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.refuseButtonText}>Refuser</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
