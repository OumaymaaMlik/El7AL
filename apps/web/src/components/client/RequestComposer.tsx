import React, { useEffect, useState } from 'react';
import { ArrowRight, Crosshair, MapPin } from 'lucide-react';
import { Category } from './CategoryGrid';
import { LiveDot } from '../ui/LiveDot';
import { TradePicker } from './TradePicker';
import { useTranslation } from '../../hooks/useTranslation';

export type UrgencyLevel = 'EXPRESS' | 'PLANIFIE' | 'STANDARD';

interface RequestComposerProps {
  categories: Category[];
  /** A trade picked elsewhere on the page (chips); the form follows it. */
  selectedCategoryId?: string | null;
  defaultAddress?: string;
  onLaunchRequest: (
    category: Category,
    address: string,
    lat: number,
    lng: number,
    urgency: UrgencyLevel,
    problemDesc: string,
  ) => void;
}

const DEFAULT_LAT = 36.8065;
const DEFAULT_LNG = 10.1815;

const fieldLabel = 'text-[13px] font-semibold text-slate-900 dark:text-slate-100';
const box =
  'flex items-center gap-2.5 h-[52px] px-4 rounded-field border-[1.5px] border-light-border dark:border-dark-border bg-white dark:bg-dark-surface focus-within:border-brand-500 dark:focus-within:border-brand-accent transition-colors';
const inner =
  'flex-1 min-w-0 h-full bg-transparent outline-none text-[15px] text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400';

/** The one form for asking for help: trade, address, problem. Express only: every request goes out at once. */
export const RequestComposer: React.FC<RequestComposerProps> = ({
  categories,
  selectedCategoryId,
  defaultAddress = '',
  onLaunchRequest,
}) => {
  const { t } = useTranslation();
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [problemDescription, setProblemDescription] = useState('');
  const [addressText, setAddressText] = useState(defaultAddress);
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);
  const [isLocating, setIsLocating] = useState(false);
  const [hasCategoryError, setHasCategoryError] = useState(false);

  useEffect(() => {
    if (defaultAddress && !addressText) setAddressText(defaultAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultAddress]);

  useEffect(() => {
    if (selectedCategoryId) {
      setSelectedCatId(selectedCategoryId);
      setHasCategoryError(false);
    }
  }, [selectedCategoryId]);

  const activeCategory = categories.find((c) => c.id === selectedCatId) || null;

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setLat(userLat);
        setLng(userLng);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLat}&lon=${userLng}&zoom=18&addressdetails=1`,
          );
          const data = await response.json();

          if (data && data.display_name) {
            const addrParts = [];
            if (data.address.road) addrParts.push(data.address.road);
            if (data.address.suburb || data.address.neighbourhood)
              addrParts.push(data.address.suburb || data.address.neighbourhood);
            if (data.address.city || data.address.town || data.address.state)
              addrParts.push(data.address.city || data.address.town || data.address.state);

            setAddressText(
              addrParts.length > 0 ? addrParts.join(', ') : data.display_name.split(',').slice(0, 3).join(','),
            );
          } else {
            setAddressText(`${userLat.toFixed(4)}, ${userLng.toFixed(4)}`);
          }
        } catch {
          setAddressText(`${userLat.toFixed(4)}, ${userLng.toFixed(4)}`);
        } finally {
          setIsLocating(false);
        }
      },
      () => setIsLocating(false),
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategory) {
      setHasCategoryError(true);
      return;
    }
    onLaunchRequest(activeCategory, addressText, lat, lng, 'EXPRESS', problemDescription);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="surface p-5 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="rc-category" className={fieldLabel}>
          {t.metier}
        </label>
        <TradePicker
          categories={categories}
          value={selectedCatId}
          invalid={hasCategoryError}
          describedBy={hasCategoryError ? 'rc-category-err' : undefined}
          onChange={(id) => {
            setSelectedCatId(id);
            setHasCategoryError(false);
          }}
        />
        {hasCategoryError && (
          <span id="rc-category-err" role="alert" className="text-[13px] font-semibold text-red-700 dark:text-red-400">
            {t.selectMetier}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="rc-address" className={fieldLabel}>
          {t.lieu}
        </label>
        <div className={box}>
          <MapPin className="w-5 h-5 shrink-0 text-slate-600 dark:text-slate-400" aria-hidden="true" />
          <input
            id="rc-address"
            type="text"
            autoComplete="off"
            value={addressText}
            onChange={(e) => setAddressText(e.target.value)}
            placeholder="Tunis, Tunisie"
            className={inner}
          />
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="shrink-0 inline-flex items-center gap-1.5 h-9 px-2 -me-1 rounded-lg text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-light-tile dark:hover:bg-dark-card disabled:opacity-60"
          >
            <Crosshair className="w-4 h-4" aria-hidden="true" />
            {isLocating ? t.locating : t.gps}
          </button>
        </div>
      </div>

      <div className="sm:col-span-2 flex flex-col gap-2">
        <label htmlFor="rc-problem" className={fieldLabel}>
          {t.probleme}
        </label>
        <textarea
          id="rc-problem"
          value={problemDescription}
          onChange={(e) => setProblemDescription(e.target.value)}
          placeholder={t.problemePlaceholder}
          className="w-full min-h-[96px] resize-y rounded-field border-[1.5px] border-light-border dark:border-dark-border bg-white dark:bg-dark-surface px-4 py-3.5 text-[15px] text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none focus:border-brand-500 dark:focus:border-brand-accent transition-colors"
        />
      </div>

      <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 pt-1">
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-2.5 font-display text-lg font-bold">
            <LiveDot />
            {t.expressBadge}
          </span>
          <span className="text-sm text-slate-600 dark:text-slate-300">{t.expressSubtext}</span>
        </div>
        <button
          type="submit"
          className="h-14 px-8 rounded-full bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-accent dark:text-brand-on-accent dark:hover:bg-brand-accent-hover font-bold text-base inline-flex items-center justify-center gap-2.5 transition-colors w-full sm:w-auto"
        >
          {t.launchBtn}
          <ArrowRight className="w-5 h-5 rtl:-scale-x-100" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
};
