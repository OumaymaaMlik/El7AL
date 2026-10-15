import { api } from '../../../services/http/client';
import type { ActiveMission } from '../types';
import {
  missionHistoryResponseSchema,
  missionResponseSchema,
  requestMissionResponseSchema,
  type RequestMissionInput,
} from '../schemas/mission.schema';

/** The user's latest missions plus their lifetime number of completed missions. */
export async function fetchMissionHistoryPage() {
  const res = await api.get('/missions/history');
  const parsed = missionHistoryResponseSchema.parse(res.data);
  if (!parsed.success) return null;
  return {
    missions: parsed.data,
    completedCount: parsed.meta?.completedCount ?? parsed.data.filter((m) => m.status === 'COMPLETED').length,
  };
}

export async function fetchMissionHistory() {
  return (await fetchMissionHistoryPage())?.missions ?? null;
}

export async function fetchMission(id: string) {
  const res = await api.get(`/missions/${id}`);
  const parsed = missionResponseSchema.parse(res.data);
  return parsed.success ? parsed.data : null;
}

export async function requestMission(input: RequestMissionInput) {
  const res = await api.post('/missions/request', input);
  const parsed = requestMissionResponseSchema.parse(res.data);
  return parsed.success ? parsed.data : null;
}

/** Returns true when the server confirms the cancellation. */
export async function cancelMission(missionId: string, reason: string): Promise<boolean> {
  const res = await api.post(`/missions/${missionId}/cancel`, { reason });
  return Boolean(res.data?.success);
}

/** Accepts an offer; returns the mission as the server sees it now, or null on failure. */
export async function acceptMission(missionId: string) {
  const res = await api.post(`/missions/${missionId}/accept`);
  // The response also carries the paired provider, so it is kept exactly as the server sent it.
  return res.data?.success ? (res.data.data as ActiveMission) : null;
}

export async function startRoute(missionId: string) {
  await api.post(`/missions/${missionId}/start-route`);
}

export async function markArrived(missionId: string) {
  await api.post(`/missions/${missionId}/arrived`);
}

export async function startWork(missionId: string) {
  await api.post(`/missions/${missionId}/start-work`);
}

export async function dualConfirm(missionId: string) {
  await api.post(`/missions/${missionId}/dual-confirm`);
}

export async function submitReview(missionId: string, rating: number, comment: string, amount: string) {
  await api.post(`/missions/${missionId}/review`, { rating, comment, amount });
}
