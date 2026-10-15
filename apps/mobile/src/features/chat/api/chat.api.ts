import { api } from '../../../services/http/client';
import { fetchMissionHistory, type Mission } from '../../missions';

/** Conversations are the user's missions that were not cancelled. */
export async function fetchConversations(): Promise<Mission[] | null> {
  const missions = await fetchMissionHistory();
  return missions ? missions.filter((m) => m.status !== 'CANCELLED') : null;
}

export async function markMissionRead(missionId: string) {
  await api.post(`/missions/${missionId}/read`);
}
