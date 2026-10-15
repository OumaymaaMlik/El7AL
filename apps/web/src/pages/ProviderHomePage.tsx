import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProviderLayout } from '../layouts/ProviderLayout';
import { InterventionDetailsModal } from '../components/client/InterventionDetailsModal';
import type { Mission } from '../components/client/ActiveMissionsList';
import { ProviderMapContainer } from '../components/provider/ProviderMapContainer';
import { DutyPanel } from '../components/provider/home/DutyPanel';
import { EmptyTab, MissionHistoryList, ProviderMissionCard } from '../components/provider/home/MissionLists';
import { useProviderMissions } from '../components/provider/home/useProviderMissions';
import { VerificationBanner } from '../components/provider/home/VerificationBanner';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useProviderStore } from '../store/useProviderStore';
import { useProviderCopy } from '../lib/providerCopy';

type Tab = 'ongoing' | 'available' | 'history';

export const ProviderHomePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const copy = useProviderCopy();

  const isOnline = useProviderStore((s) => s.isOnline);
  const setOnline = useProviderStore((s) => s.setOnline);
  const accountStatus = useProviderStore((s) => s.accountStatus);
  const verificationNote = useProviderStore((s) => s.verificationNote);
  const ratingAverage = useProviderStore((s) => s.ratingAverage);
  // Unknown while loading counts as fine: the server refuses an unverified artisan anyway.
  const verified = accountStatus === null || accountStatus === 'ACTIVE';

  const [activeTab, setActiveTab] = useState<Tab>('available');
  const [openMission, setOpenMission] = useState<Mission | null>(null);
  const missions = useProviderMissions((id) => navigate(`/provider/tracking?id=${id}`));

  const toggleOnline = async () => {
    const error = await setOnline(!isOnline);
    if (error) addNotification({ title: 'Disponibilité', message: error, type: 'danger' });
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'ongoing', label: copy.tabOngoing, count: missions.ongoing.length },
    { id: 'available', label: copy.tabAvailable, count: missions.available.length },
    { id: 'history', label: `${copy.tabHistory} (${missions.history.length})` },
  ];

  return (
    <ProviderLayout>
      <div className="flex flex-col gap-10">
        {!verified && <VerificationBanner status={accountStatus ?? ''} note={verificationNote} />}

        <DutyPanel
          firstName={user?.fullName?.split(' ')[0] || ''}
          isOnline={isOnline}
          canGoOnline={verified}
          onToggle={toggleOnline}
          stats={{ done: missions.completedCount, rating: ratingAverage, ongoing: missions.ongoing.length }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-10 items-start">
          <div className="min-w-0">
            <div role="tablist" aria-label={copy.tabAvailable} className="flex flex-wrap gap-1.5 mb-5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={activeTab === tab.id}
                  aria-controls="tab-panel"
                  onClick={() => setActiveTab(tab.id)}
                  className={`h-11 px-[18px] rounded-full border-[1.5px] font-semibold inline-flex items-center gap-2.5 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-950'
                      : 'border-light-border dark:border-dark-border bg-white dark:bg-dark-card hover:bg-light-tile dark:hover:bg-dark-surface'
                  }`}
                >
                  {tab.label}
                  {!!tab.count && (
                    <span className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-brand-accent text-brand-on-accent text-xs font-extrabold grid place-items-center">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div id="tab-panel" role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="flex flex-col gap-4">
              {activeTab === 'ongoing' &&
                (missions.ongoing.length === 0 ? (
                  <EmptyTab title={copy.noOngoingTitle} text={copy.noOngoingText} />
                ) : (
                  missions.ongoing.map((m) => (
                    <ProviderMissionCard
                      key={m.id}
                      mission={m}
                      kind="ongoing"
                      onOpen={() => navigate(`/provider/tracking?id=${m.id}`)}
                      onAccept={() => undefined}
                    />
                  ))
                ))}

              {activeTab === 'available' &&
                (!isOnline ? (
                  <EmptyTab
                    title={copy.offlineTitle}
                    text={copy.offlineText}
                    action={
                      <button
                        type="button"
                        onClick={toggleOnline}
                        className="h-12 px-6 rounded-full border-[1.5px] border-slate-900 dark:border-slate-100 font-bold hover:bg-light-tile dark:hover:bg-dark-surface transition-colors"
                      >
                        {copy.goOnline}
                      </button>
                    }
                  />
                ) : missions.available.length === 0 ? (
                  <EmptyTab title={copy.noOffersTitle} text={copy.noOffersText} />
                ) : (
                  missions.available.map((m) => (
                    <ProviderMissionCard
                      key={m.id}
                      mission={m}
                      kind="available"
                      busy={missions.acceptingId === m.id}
                      onOpen={() => undefined}
                      onAccept={() => void missions.accept(m.id)}
                    />
                  ))
                ))}

              {activeTab === 'history' &&
                (missions.history.length === 0 ? (
                  <EmptyTab title={copy.noHistoryTitle} text={copy.noHistoryText} />
                ) : (
                  <MissionHistoryList missions={missions.history} onOpen={setOpenMission} />
                ))}
            </div>
          </div>

          <aside className="lg:sticky lg:top-24">
            <ProviderMapContainer />
          </aside>
        </div>

        <InterventionDetailsModal mission={openMission} viewer="PROVIDER" onClose={() => setOpenMission(null)} />
      </div>
    </ProviderLayout>
  );
};
