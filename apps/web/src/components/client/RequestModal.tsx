import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ArrowRight } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { AddressField } from '../ui/AddressField';
import { Category, getCategoryIcon } from './CategoryGrid';
import { ProblemField } from './request/ProblemField';
import { api, apiErrorMessage } from '../../services/api';
import { useNotificationStore } from '../../store/useNotificationStore';
import { UrgencyLevel } from './RequestComposer';

const SEARCH_RADIUS_KM = 25;

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  defaultAddress?: string;
  defaultLat?: number;
  defaultLng?: number;
  defaultUrgency?: UrgencyLevel;
  defaultDescription?: string;
  onRequestCreated: (mission: { id: string }) => void;
}

/** The last step before a request goes out: the problem, where, and send. */
export const RequestModal: React.FC<RequestModalProps> = ({
  isOpen,
  onClose,
  category,
  defaultAddress = '',
  defaultLat,
  defaultLng,
  defaultDescription = '',
  onRequestCreated,
}) => {
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [addressText, setAddressText] = useState(defaultAddress);
  const [description, setDescription] = useState(defaultDescription);
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(
    typeof defaultLat === 'number' && typeof defaultLng === 'number' ? { lat: defaultLat, lng: defaultLng } : null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Each time the window opens it starts from what the home screen collected.
  useEffect(() => {
    if (!isOpen) return;
    setAddressText(defaultAddress && !defaultAddress.startsWith('+') ? defaultAddress : '');
    setPoint(
      typeof defaultLat === 'number' && typeof defaultLng === 'number' ? { lat: defaultLat, lng: defaultLng } : null,
    );
    setDescription(defaultDescription);
    setError(null);
  }, [isOpen, category, defaultAddress, defaultLat, defaultLng, defaultDescription]);

  if (!category) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!point || !addressText.trim()) {
      setError("Indiquez l'adresse de l'intervention : choisissez un point sur la carte ou utilisez votre position.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/missions/request', {
        categoryId: category.id,
        pickupLat: point.lat,
        pickupLng: point.lng,
        addressText: addressText.trim(),
        description: description || `Demande d'intervention ${category.name}`,
        radiusKm: SEARCH_RADIUS_KM,
      });
      addNotification({
        title: 'Demande émise',
        message: 'Demande envoyée aux techniciens à proximité.',
        type: 'success',
      });
      onRequestCreated(res.data.data);
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err, 'Erreur lors de la création de la demande.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideHeader size="lg" maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-brand-500 dark:text-brand-accent flex items-center justify-center shrink-0">
              {getCategoryIcon(category.name)}
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{category.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={(e) => void submit(e)} className="space-y-4">
          <ProblemField tradeName={category.name} value={description} onChange={setDescription} />

          <AddressField
            label="Adresse de l'intervention"
            value={addressText}
            onChange={setAddressText}
            lat={point?.lat}
            lng={point?.lng}
            onCoordinates={(lat, lng) => setPoint({ lat, lng })}
            onError={setError}
          />

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Envoi...' : 'Envoyer ma demande'}</span>
              <ArrowRight className="rtl:-scale-x-100 w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
