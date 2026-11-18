/** A trade an artisan works in, as the server nests it in their profile. */
export interface TradeLink {
  id?: string;
  categoryId?: string;
  name?: string;
  category?: { id?: string; name?: string };
}

/** The name of a trade, whichever way the server nested it. */
export const tradeName = (trade: TradeLink): string => trade.category?.name || trade.name || trade.id || '';
