import { useMemo } from 'react';
import type { Category } from '../../categories';

/** How many artisans of a category are online, or 0 when the backend sent no figure. */
export function onlineCountOf(category?: object | null): number {
  const n = (category as { availableProvidersCount?: unknown } | null | undefined)?.availableProvidersCount;
  return typeof n === 'number' ? n : 0;
}

/**
 * The figures the client home shows about the trades: the total online, and the one trade to guide the choice
 * to (the most available, only when there is a clear one).
 */
export function useCategoryStats(categories: Category[]) {
  return useMemo(() => {
    let total = 0;
    let best: { id: string; n: number } | null = null;
    let tie = false;
    for (const c of categories) {
      const n = onlineCountOf(c);
      total += n;
      if (n <= 0) continue;
      if (!best || n > best.n) {
        best = { id: c.id, n };
        tie = false;
      } else if (n === best.n) tie = true;
    }
    return { onlineTotal: total, popularId: best && !tie ? best.id : null };
  }, [categories]);
}
