import React from 'react';
import { View } from 'react-native';
import { BottomSheet } from '../../../shared/ui/BottomSheet';
import { Button } from '../../../shared/ui/Button';
import { LeafletMap } from './LeafletMap';
import { radius, space } from '../../../shared/theme/tokens';
import { useTranslation } from '../../../shared/store/useLanguageStore';

interface AddressMapSheetProps {
  visible: boolean;
  lat: number;
  lng: number;
  onClose: () => void;
  onSelect: (lat: number, lng: number) => void;
}

export function AddressMapSheet({ visible, lat, lng, onClose, onSelect }: AddressMapSheetProps) {
  const { t } = useTranslation();
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Placer un repère exact">
      <View style={{ gap: space.md, paddingBottom: space.lg }}>
        <LeafletMap
          lat={lat}
          lng={lng}
          onLocationSelect={onSelect}
          style={{ height: 350, width: '100%', borderRadius: radius.md }}
        />
        <Button title={t('save') || 'Confirmer'} onPress={onClose} />
      </View>
    </BottomSheet>
  );
}
