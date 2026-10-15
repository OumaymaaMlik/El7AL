import { z } from 'zod';
import { api } from '../../../services/http/client';
import {
  adminCategorySchema,
  adminMissionSchema,
  adminStatsSchema,
  adminUserSchema,
  disputeSchema,
  pendingProviderSchema,
  topupSchema,
  type UserRoleFilter,
} from '../schemas/admin.schema';

/** GETs an endpoint that answers `{ success, data }` and validates `data`. Returns null when success is false. */
async function getData<T extends z.ZodTypeAny>(url: string, data: T, params?: Record<string, unknown>) {
  const res = await api.get(url, { params });
  const parsed = z.object({ success: z.boolean(), data }).parse(res.data);
  return parsed.success ? (parsed.data as z.infer<T>) : null;
}

export const fetchStats = () => getData('/admin/stats', adminStatsSchema);

export const fetchUsers = (query: string, role: UserRoleFilter) =>
  getData('/admin/users', z.array(adminUserSchema), { query, role: role !== 'ALL' ? role : undefined });

export const fetchPendingProviders = () => getData('/admin/providers/pending', z.array(pendingProviderSchema));

export const fetchMissions = () => getData('/admin/missions', z.array(adminMissionSchema));
export const fetchCategories = () => getData('/admin/categories', z.array(adminCategorySchema));
export const fetchPendingTopups = () => getData('/admin/topups/pending', z.array(topupSchema));
export const fetchDisputes = () => getData('/admin/disputes', z.array(disputeSchema));
export const fetchUserMissions = (userId: string) =>
  getData(`/admin/users/${userId}/missions`, z.array(adminMissionSchema));

export async function verifyProvider(providerProfileId: string, approve: boolean) {
  await api.put(`/admin/providers/${providerProfileId}/verify`, { approve });
}

export async function updateUserStatus(userId: string, status: string) {
  await api.put(`/admin/users/${userId}/status`, { status });
}

export async function deleteUser(userId: string) {
  await api.delete(`/admin/users/${userId}`);
}

export async function createCategory(input: { name: string; icon: string; description?: string }) {
  await api.post('/admin/categories', input);
}

export async function updateCategory(categoryId: string, input: { name: string; icon: string; description?: string }) {
  await api.put(`/admin/categories/${categoryId}`, input);
}

export async function resolveDispute(disputeId: string, status: 'RESOLVED' | 'DISMISSED') {
  await api.put(`/admin/disputes/${disputeId}`, {
    status,
    resolutionNotes:
      status === 'RESOLVED' ? "Dossier traité par l'administrateur El 7al." : 'Signalement classé sans suite.',
  });
}

export async function deleteCategory(categoryId: string) {
  await api.delete(`/admin/categories/${categoryId}`);
}

export async function approveTopup(topupId: string) {
  await api.post(`/admin/topups/${topupId}/approve`);
}

export async function rejectTopup(topupId: string) {
  await api.post(`/admin/topups/${topupId}/reject`);
}
