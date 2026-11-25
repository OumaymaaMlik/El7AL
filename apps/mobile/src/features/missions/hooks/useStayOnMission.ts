import { useEffect } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { useMissionStore } from '../store/useMissionStore';
import { isMissionUnderway } from '../utils/missionState';

/**
 * While a job is under way, going to the home page (a tab, the back button, a link) leads back to the job.
 * Returns whether that is the case, so the tab bar can hide the Home tab.
 */
export function useStayOnMission(): boolean {
  const router = useRouter();
  const pathname = usePathname();
  const underway = useMissionStore(isMissionUnderway);
  const setSearchPhase = useMissionStore((s) => s.setSearchPhase);

  useEffect(() => {
    if (!underway || (pathname !== '/home' && pathname !== '/')) return;
    // The search page, if it was up, is over: otherwise it would still cover the home page after the job.
    setSearchPhase('idle');
    router.replace('/(tabs)/tracking');
  }, [underway, pathname, router, setSearchPhase]);

  return underway;
}
