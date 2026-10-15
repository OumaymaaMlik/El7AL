import { useCallback, useEffect, useRef, useState } from 'react';
import { api, apiErrorMessage } from '../services/api';
import { getSocket } from '../services/socket';
import { onServerEvent } from '../services/serverEvents';
import type { ApiMission } from '../lib/mission';

const REFRESH_EVENTS = ['mission:status_update', 'mission:accepted', 'mission:completed', 'mission:cancelled'] as const;

/**
 * The mission a tracking screen shows: the one in the address (?id=), or else the person's current one.
 * It reloads by itself when the server announces a change. Only the first load shows a skeleton.
 *
 * @param isCurrent which stored statuses count as "current" when no id is given (searching or ongoing).
 * @param onLoaded called after each load, e.g. to open the review window.
 */
export function useMission(
  missionId: string | null,
  isCurrent: (status?: string | null) => boolean,
  onLoaded?: (mission: ApiMission) => void,
) {
  const [mission, setMission] = useState<ApiMission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;

  const reload = useCallback(async () => {
    try {
      setError(null);
      let id = missionId;
      if (!id) {
        const history = await api.get('/missions/history');
        const list: ApiMission[] = history.data.success && Array.isArray(history.data.data) ? history.data.data : [];
        id = list.find((m) => isCurrent(m.status))?.id ?? null;
      }
      if (!id) {
        setMission(null);
        return;
      }
      const res = await api.get(`/missions/${id}`);
      const loaded: ApiMission | null = res.data.success && res.data.data ? res.data.data : null;
      setMission(loaded);
      if (loaded) onLoadedRef.current?.(loaded);
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible de charger l'intervention."));
      setMission(null);
    } finally {
      setLoading(false);
    }
  }, [missionId, isCurrent]);

  useEffect(() => {
    setLoading(true);
    void reload();
  }, [reload]);

  const currentId = mission?.id ?? missionId;
  useEffect(() => {
    if (!currentId) return;
    const socket = getSocket();
    socket.emit('join_room', `mission_${currentId}`);
    const stops = REFRESH_EVENTS.map((event) =>
      onServerEvent(socket, event, (data) => {
        if (!data.missionId || data.missionId === currentId) void reload();
      }),
    );
    return () => stops.forEach((stop) => stop());
  }, [currentId, reload]);

  return { mission, loading, error, reload };
}
