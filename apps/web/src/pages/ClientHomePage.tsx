import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ClientLayout } from '../layouts/ClientLayout';
import { Badge } from '../components/ui/Badge';
import { Category } from '../components/client/CategoryGrid';
import { RequestModal } from '../components/client/RequestModal';
import { ActiveMissionsList, Mission } from '../components/client/ActiveMissionsList';
import { RequestComposer, UrgencyLevel } from '../components/client/RequestComposer';
import { InterventionDetailsModal } from '../components/client/InterventionDetailsModal';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useTranslation } from '../hooks/useTranslation';
import { useMissionCopy } from '../lib/missionCopy';
import { api } from '../services/api';
import { isActive } from '../lib/mission';
import { useNotificationStore } from '../store/useNotificationStore';

export const ClientHomePage: React.FC = () => {
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const language = useLanguageStore((s) => s.language);
  const { t } = useTranslation();
  const copy = useMissionCopy();
  const [categories, setCategories] = useState<Category[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [defaultUrgency, setDefaultUrgency] = useState<UrgencyLevel>('EXPRESS');
  const [defaultDescription, setDefaultDescription] = useState<string>('');
  const [defaultAddress, setDefaultAddress] = useState<string>('');
  const [defaultLat, setDefaultLat] = useState<number | undefined>(undefined);
  const [defaultLng, setDefaultLng] = useState<number | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  /** The past intervention whose details are open. */
  const [openMission, setOpenMission] = useState<Mission | null>(null);

  const [isLoadingMissions, setIsLoadingMissions] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories');
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setCategories(res.data.data);
      } else {
        setCategories([]);
      }
    } catch {
      setCategories([]);
      addNotification({
        title: 'Services indisponibles',
        message: 'Impossible de charger la liste des services. Réessayez.',
        type: 'danger',
      });
    }
  }, [addNotification]);

  const fetchMissions = useCallback(async () => {
    try {
      setIsLoadingMissions(true);
      const res = await api.get('/missions/history');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setMissions(res.data.data);
      } else {
        setMissions([]);
      }
    } catch {
      setMissions([]);
    } finally {
      setIsLoadingMissions(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
    void fetchMissions();
  }, [fetchCategories, fetchMissions]);

  // The composer asks for confirmation in the request dialog, with what was typed as defaults.
  const handleLaunchFromComposer = (
    category: Category,
    address: string,
    lat: number,
    lng: number,
    urgency: UrgencyLevel,
    problemDesc: string,
  ) => {
    setSelectedCategory(category);
    setDefaultAddress(address || '');
    setDefaultLat(lat);
    setDefaultLng(lng);
    setDefaultUrgency(urgency);
    setDefaultDescription(problemDesc || '');
    setIsModalOpen(true);
  };

  const handleRequestCreated = (createdMission?: { id?: string }) => {
    fetchMissions();
    const missionId = createdMission?.id;
    navigate(missionId ? `/client/tracking?id=${missionId}` : '/client/tracking');
  };

  const finishedMissions = missions.filter((m) => m.status === 'COMPLETED' || m.status === 'CANCELLED');
  // Only one request can run at a time, so while one is under way the page shows it, not a new-request form.
  const hasActiveMission = missions.some((m) => isActive(m.status));
  const canRequest = !isLoadingMissions && !hasActiveMission;
  const firstName = user?.fullName?.split(' ')[0] || '';

  return (
    <ClientLayout>
      <div className="flex flex-col gap-10 sm:gap-12">
        {/* The request in progress (if any) comes first and replaces the new-request entry points */}
        {hasActiveMission ? (
          <ActiveMissionsList missions={missions} onRefresh={fetchMissions} />
        ) : (
          <header className="flex flex-col items-center gap-3 text-center">
            <span className="micro">{copy.hello(firstName)}</span>
            <h1 className="text-[clamp(32px,4.4vw,52px)] font-bold leading-[1.05] tracking-[-0.03em] rtl:tracking-normal rtl:leading-[1.25] max-w-[20ch] mx-auto">
              {t.heroTitle}
            </h1>
          </header>
        )}

        {isLoadingMissions && !hasActiveMission && (
          <div
            aria-busy="true"
            className="h-64 w-full max-w-[880px] mx-auto rounded-tile bg-light-tile dark:bg-dark-surface animate-pulse"
          />
        )}

        {canRequest && (
          <div className="max-w-[880px] w-full mx-auto">
            <RequestComposer
              categories={categories}
              defaultAddress={user?.defaultAddress}
              onLaunchRequest={handleLaunchFromComposer}
            />
          </div>
        )}

        {finishedMissions.length > 0 && (
          <section aria-labelledby="history-title" className="flex flex-col gap-4 w-full max-w-[880px] mx-auto">
            <div className="flex flex-col items-center gap-2.5 text-center">
              <span className="micro">{copy.historyLabel}</span>
              <h2
                id="history-title"
                className="text-[clamp(26px,3.2vw,38px)] font-bold leading-[1.1] tracking-[-0.02em] rtl:tracking-normal"
              >
                {copy.historyTitle}
              </h2>
            </div>
            <ul className="border-t border-light-border dark:border-dark-border">
              {finishedMissions.slice(0, 5).map((m) => (
                <li key={m.id} className="border-b border-light-border dark:border-dark-border">
                  <button
                    type="button"
                    onClick={() => setOpenMission(m)}
                    aria-haspopup="dialog"
                    aria-label={`${copy.details.open} : ${m.category?.name}`}
                    className="w-full text-start grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-x-5 gap-y-1 px-2 py-[18px] rounded-xl hover:bg-light-tile dark:hover:bg-dark-surface transition-colors"
                  >
                    <span className="min-w-0">
                      <b className="block text-base">{m.category?.name}</b>
                      <span className="block text-sm text-slate-600 dark:text-slate-300 truncate">{m.addressText}</span>
                    </span>
                    <span className="hidden sm:block text-sm text-slate-600 dark:text-slate-300">
                      {new Date(m.createdAt).toLocaleDateString(language === 'ar' ? 'ar-TN-u-nu-latn' : language)}
                    </span>
                    <Badge variant={m.status === 'COMPLETED' ? 'success' : 'neutral'}>
                      {m.status === 'COMPLETED' ? copy.done : copy.cancelled}
                    </Badge>
                    <ChevronRight
                      className="hidden sm:block w-5 h-5 text-slate-600 dark:text-slate-300 rtl:-scale-x-100"
                      aria-hidden="true"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <InterventionDetailsModal mission={openMission} onClose={() => setOpenMission(null)} />

        <RequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          category={selectedCategory}
          defaultAddress={defaultAddress}
          defaultLat={defaultLat}
          defaultLng={defaultLng}
          defaultUrgency={defaultUrgency}
          defaultDescription={defaultDescription}
          onRequestCreated={handleRequestCreated}
        />
      </div>
    </ClientLayout>
  );
};
