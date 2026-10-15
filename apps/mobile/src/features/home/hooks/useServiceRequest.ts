import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useLoadingStore } from '../../../shared/store/useLoadingStore';
import { useNotificationStore } from '../../notifications/store/useNotificationStore';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { logger } from '../../../shared/utils/logger';
import { getCurrentCoords, type Coords } from '../../map/services/location';
import { reverseGeocode } from '../../map/services/geocoding';
import { joinMissionRoom } from '../../../services/socket/socket.client';
import { fetchCategories, type Category } from '../../categories';
import { requestMission } from '../../missions/api/mission.api';
import { useMissionStore } from '../../missions/store/useMissionStore';
import type { RequestFormErrors } from '../components/RequestSheet';

const SEARCH_RADIUS_KM = 25;

/** The client's service request: category list, selection, request form and submission. */
export function useServiceRequest(locateOnMount = true) {
  const { t } = useTranslation();
  const flashToast = useNotificationStore((state) => state.flashToast);
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);
  const startSearching = useMissionStore((state) => state.startSearching);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [needText, setNeedText] = useState('');
  const [locationText, setLocationTextState] = useState('');
  const [coords, setCoords] = useState<Coords | null>(null);
  const addressEdited = useRef(false);
  const [formErrors, setFormErrors] = useState<RequestFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    setCategoriesError(false);
    try {
      setCategories(await fetchCategories());
    } catch (e) {
      logger.warn('Fetch categories failed:', e);
      setCategoriesError(true);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const setLocationText = (text: string) => {
    addressEdited.current = true;
    setLocationTextState(text);
  };

  /** Reads the device position and, unless the user typed an address, fills it in. */
  const locate = useCallback(async (): Promise<Coords | null> => {
    const here = await getCurrentCoords();
    if (!here) return null;
    setCoords(here);
    const address = await reverseGeocode(here.lat, here.lng);
    if (address) setLocationTextState((current) => (addressEdited.current && current ? current : address));
    return here;
  }, []);

  useEffect(() => {
    if (locateOnMount) locate();
  }, [locateOnMount, locate]);

  const toggleCategory = (cat: Category) => setSelectedCategory((prev) => (prev?.id === cat.id ? null : cat));

  const chooseCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setFormErrors((prev) => ({ ...prev, service: undefined }));
  };

  const changeNeed = (text: string) => {
    setNeedText(text);
    if (formErrors.problem) setFormErrors((prev) => ({ ...prev, problem: undefined }));
  };

  const openSheet = () => {
    setFormErrors({});
    setSheetOpen(true);
    locate();
  };

  const notifyWhenAvailable = () => {
    if (!selectedCategory) return;
    flashToast({ title: t('notifyWhenAvailable'), message: t('notifySetSuccess'), tone: 'success' });
  };

  const submit = async () => {
    // Validation is shown next to the fields, inside the form.
    const errors: RequestFormErrors = {};
    if (!selectedCategory) errors.service = t('errSelectService');
    if (!needText.trim()) errors.problem = t('errDescribeProblem');
    if (!selectedCategory || errors.problem) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    const here = coords ?? (await locate());
    if (!here) {
      setSubmitting(false);
      setFormErrors({ submit: 'Activez la localisation pour trouver un artisan près de vous.' });
      return;
    }
    setFormErrors({});
    showLoading("Recherche d'un artisan", 'Localisation des artisans à proximité');
    try {
      const result = await requestMission({
        categoryId: selectedCategory.id,
        pickupLat: here.lat,
        pickupLng: here.lng,
        addressText: locationText.trim() || `${here.lat.toFixed(5)}, ${here.lng.toFixed(5)}`,
        description: needText,
        radiusKm: SEARCH_RADIUS_KM,
      });
      if (result) {
        joinMissionRoom(result.mission.id);
        setSheetOpen(false);
        startSearching(result.mission.id);
      }
    } catch (err) {
      setFormErrors({ submit: getApiErrorMessage(err, t('errRequestFailed')) });
    } finally {
      setSubmitting(false);
      hideLoading();
    }
  };

  return {
    categories,
    loadingCategories,
    categoriesError,
    loadCategories,
    selectedCategory,
    toggleCategory,
    chooseCategory,
    sheetOpen,
    setSheetOpen,
    openSheet,
    needText,
    changeNeed,
    locationText,
    setLocationText,
    formErrors,
    submitting,
    submit,
    notifyWhenAvailable,
  };
}

export type ServiceRequest = ReturnType<typeof useServiceRequest>;
