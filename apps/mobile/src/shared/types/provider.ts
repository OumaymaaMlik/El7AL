/** A trade an artisan works in, as the server nests it in their profile. */
export interface TradeLink {
  id?: string;
  categoryId?: string;
  name?: string;
  category?: { id?: string; name?: string };
}

/** The name of a trade, whichever way the server nested it. */
export const tradeName = (trade: TradeLink): string => trade.category?.name || trade.name || trade.id || '';

export interface ProviderReview {
  id?: string;
  rating: number | string;
  comment?: string | null;
  client?: { user?: { fullName?: string | null } };
}

/** What `GET /geo/providers/:id/profile` returns: public information only. */
export interface ProviderPublicProfile {
  user?: { fullName?: string | null; avatarUrl?: string | null; status?: string; createdAt?: string };
  bio?: string | null;
  ratingAverage?: number | string | null;
  totalRatings?: number | string | null;
  categories?: TradeLink[];
  reviews?: ProviderReview[];
}
