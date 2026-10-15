import { useCallback, useEffect, useState } from 'react';
import { api, apiErrorMessage } from '../../services/api';
import { useNotificationStore } from '../../store/useNotificationStore';

/** Loads one admin endpoint, tells the admin when it fails, and gives back `reload` for after an action. */
export function useAdminData<T>(path: string, initial: T) {
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const res = await api.get(path);
      setData(res.data.data);
    } catch (err) {
      addNotification({
        title: 'Erreur de chargement',
        message: apiErrorMessage(err, 'Impossible de charger les données.'),
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  }, [path, addNotification]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, reload };
}

/** Runs an admin action and reports the result in a notification. Returns true when it succeeded. */
export function useAdminAction() {
  const addNotification = useNotificationStore((s) => s.addNotification);
  return useCallback(
    async (run: () => Promise<unknown>, success: { title: string; message: string; type?: 'success' | 'warning' }) => {
      try {
        await run();
        addNotification({ ...success, type: success.type ?? 'success' });
        return true;
      } catch (err) {
        addNotification({ title: 'Erreur', message: apiErrorMessage(err, 'Action impossible.'), type: 'danger' });
        return false;
      }
    },
    [addNotification],
  );
}
