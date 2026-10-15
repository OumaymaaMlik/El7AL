/** What the admin endpoints return, as far as the dashboard reads it. */

export interface AdminStats {
  /** Revenue: one fixed fee per intervention both sides confirmed. */
  totalCommissionsCollectedTND?: number;
  revenueTodayTND?: number;
  revenueWeekTND?: number;
  revenueMonthTND?: number;
  /** Artisans waiting for the identity check. */
  pendingVerifications?: number;
  totalCompletedMissions?: number;
  activeProviders?: number;
  activeClients?: number;
  totalProviders?: number;
  totalClients?: number;
  pendingWireTransfers?: number;
  totalDisputes?: number;
}

export interface AdminCategory {
  id: string;
  name: string;
  icon: string;
  description?: string | null;
  _count?: { providers: number };
}

export interface AdminProviderProfile {
  id: string;
  walletBalance: number | string;
  radiusKm?: number;
  bio?: string | null;
  ratingAverage?: number;
  totalRatings?: number;
  documentsUrl?: string[];
  categories?: { category: { id: string; name: string } }[];
}

export interface AdminUser {
  id: string;
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  status: string;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  createdAt: string;
  missionsCount?: number;
  disputesCount?: number;
  providerProfile?: AdminProviderProfile | null;
}

export interface AdminMission {
  id: string;
  status: string;
  addressText: string;
  commissionFee?: number | string | null;
  startedAt?: string;
  completedAt?: string;
  category?: { name: string } | null;
  client?: { user?: { fullName: string } } | null;
  provider?: { user?: { fullName: string } } | null;
  review?: { rating: number; comment?: string | null } | null;
}

export interface AdminTopup {
  id: string;
  uniqueRef: string;
  amount: number | string;
  provider?: { user?: { fullName: string; phoneNumber: string } } | null;
}

export interface AdminDispute {
  id: string;
  status: string;
  reason: string;
  createdAt: string;
}

/** Minutes between the start and the end of a job, at least 1; null while it is not finished. */
export function durationMinutes(startedAt?: string, completedAt?: string): number | null {
  if (!startedAt || !completedAt) return null;
  const diffMs = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  return Math.max(1, Math.round(diffMs / 60000));
}
