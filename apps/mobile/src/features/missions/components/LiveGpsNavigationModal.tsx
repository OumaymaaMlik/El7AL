import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { MapPin, Navigation, ExternalLink } from 'lucide-react-native';
import { BottomSheet } from '../../../shared/ui/BottomSheet';
import { Button } from '../../../shared/ui/Button';
import { Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { numeralFont } from '../../../shared/theme/typography';
import { space } from '../../../shared/theme/tokens';
import { logger } from '../../../shared/utils/logger';

interface LiveGpsNavigationModalProps {
  visible: boolean;
  onClose: () => void;
  onStartDrive: () => void;
  destinationAddress?: string;
  /** The client's coordinates. When given, the Google Maps link goes to this exact point. */
  destinationLat?: number | null;
  destinationLng?: number | null;
  distanceKm?: number;
  etaMinutes?: number;
  loading?: boolean;
}

/** The artisan reviews the trip, then starts driving or opens Google Maps. */
export function LiveGpsNavigationModal({
  visible,
  onClose,
  onStartDrive,
  destinationAddress = '',
  destinationLat,
  destinationLng,
  distanceKm,
  etaMinutes,
  loading = false,
}: LiveGpsNavigationModalProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();

  if (!visible) return null;

  const handleOpenExternalGoogleMaps = () => {
    // Prefer the mission's real coordinates. Fall back to the address text.
    const hasCoords = typeof destinationLat === 'number' && typeof destinationLng === 'number';
    const destination = hasCoords ? `${destinationLat},${destinationLng}` : encodeURIComponent(destinationAddress);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    Linking.openURL(mapsUrl).catch(() => {
      logger.warn('Failed to open external maps URL:', mapsUrl);
    });
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('gpsLive')} subtitle={t('optimalRoute')}>
      <View style={styles.body}>
        <Surface style={styles.metrics}>
          <Metric label={t('arrivalShort')} value={etaMinutes} unit={t('minutesShort')} />
          <View style={[styles.vertical, { backgroundColor: colors.border }]} />
          <Metric label={t('distanceShort')} value={distanceKm} unit="km" />
        </Surface>

        {/* The trip: where the artisan starts and where the client is */}
        <View>
          <View style={styles.point}>
            <View style={[styles.pointIcon, { backgroundColor: colors.raised }]}>
              <Navigation size={16} color={colors.accentText} />
            </View>
            <Txt variant="bodyMedium" style={styles.flex}>
              {t('startPointLabel')}
            </Txt>
          </View>
          <View style={[styles.connector, { backgroundColor: colors.border }]} />
          <View style={styles.point}>
            <View style={[styles.pointIcon, { backgroundColor: colors.raised }]}>
              <MapPin size={16} color={colors.accentText} />
            </View>
            <View style={styles.flex}>
              <Txt variant="bodyMedium">{t('destinationPointLabel')}</Txt>
              {Boolean(destinationAddress) && (
                <Txt variant="small" color={colors.textSecondary}>
                  {destinationAddress}
                </Txt>
              )}
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title={t('startDrive')}
            onPress={() => {
              onStartDrive();
              onClose();
            }}
            loading={loading}
            iconPosition="left"
            icon={<Navigation size={18} color={colors.onAction} />}
          />
          <Button
            title={t('openExternalMaps')}
            variant="outline"
            onPress={handleOpenExternalGoogleMaps}
            iconPosition="left"
            icon={<ExternalLink size={18} color={colors.accentText} />}
          />
        </View>
      </View>
    </BottomSheet>
  );
}

function Metric({ label, value, unit }: { label: string; value?: number; unit: string }) {
  const colors = useThemeStore((state) => state.colors);
  const hasValue = typeof value === 'number' && value > 0;
  return (
    <View style={styles.metric}>
      <Txt variant="small" color={colors.textMuted}>
        {label}
      </Txt>
      <View style={styles.metricValue}>
        <Text style={[styles.numeral, { color: hasValue ? colors.text : colors.textMuted }]}>
          {hasValue ? value : '—'}
        </Text>
        {hasValue && <Text style={[styles.unit, { color: colors.textSecondary }]}>{unit}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: space.xl,
  },
  flex: {
    flex: 1,
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  vertical: {
    width: 1,
  },
  metric: {
    flex: 1,
    padding: space.lg,
    gap: space.xs,
  },
  metricValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  numeral: {
    fontFamily: numeralFont,
    fontSize: 34,
    lineHeight: 36,
  },
  unit: {
    fontFamily: numeralFont,
    fontSize: 22,
    lineHeight: 36,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  pointIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connector: {
    width: 2,
    height: 20,
    marginStart: 17,
    marginVertical: 4,
  },
  actions: {
    gap: space.sm,
  },
});
