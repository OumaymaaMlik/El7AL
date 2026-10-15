import { useCallback, useEffect, useState } from 'react';
import { logger } from '../../../shared/utils/logger';
import { fetchCategories, type Category } from '../../categories';

/** The trades an artisan can pick while registering, with a retry when the list could not be loaded. */
export function useRegisterCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setFailed(false);
    try {
      setCategories(await fetchCategories());
    } catch (e) {
      logger.warn('Failed to load categories:', e);
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { categories, failed, reload: load };
}
