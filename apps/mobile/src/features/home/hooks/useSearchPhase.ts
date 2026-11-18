import { useEffect, useRef } from 'react';
import { useMissionStore, type SearchPhase } from '../../missions/store/useMissionStore';

/**
 * How the artisan search is going, for the search page: `searching` while the request is out, then `found` when
 * an artisan accepted or `none` when the time ran out. The page stays until the person moves on (`dismiss`).
 * The phase lives in the store so the tab bar can hide while the page is up.
 */
export function useSearchPhase(isSearching: boolean, hasPartner: boolean, noArtisan: boolean) {
  const stored = useMissionStore((s) => s.searchPhase);
  const setPhase = useMissionStore((s) => s.setSearchPhase);
  const wasSearching = useRef(false);

  useEffect(() => {
    if (isSearching) {
      wasSearching.current = true;
      setPhase('searching');
      return;
    }
    if (!wasSearching.current) return;
    // The search just ended: an accept or a time-out arrives in the same moment; give it a beat before giving up.
    if (hasPartner) {
      wasSearching.current = false;
      setPhase('found');
      return;
    }
    if (noArtisan) {
      wasSearching.current = false;
      setPhase('none');
      return;
    }
    const id = setTimeout(() => {
      wasSearching.current = false;
      setPhase('idle');
    }, 1500);
    return () => clearTimeout(id);
  }, [isSearching, hasPartner, noArtisan, setPhase]);

  const phase: SearchPhase = isSearching ? 'searching' : stored;
  return { phase, dismiss: () => setPhase('idle') };
}
