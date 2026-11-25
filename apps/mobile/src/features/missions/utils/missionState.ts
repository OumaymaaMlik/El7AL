interface MissionLike {
  activePairingProvider: unknown;
  missionStatus: string | null;
  activeMission: { status?: string } | null;
}

const UNDERWAY = ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'DUAL_CONFIRM'];

/**
 * True from the moment an artisan accepts until the job is confirmed or cancelled: the app then stays on the job
 * (the Home tab is hidden), for the client and for the artisan.
 */
export function isMissionUnderway(state: MissionLike): boolean {
  const status = state.missionStatus ?? state.activeMission?.status ?? null;
  return status !== null && UNDERWAY.includes(status);
}

/** True when a provider is paired with the client, i.e. the mission is past the search phase. */
export function isMissionActive(state: MissionLike): boolean {
  const { activePairingProvider, missionStatus, activeMission } = state;
  return Boolean(
    activePairingProvider ||
    (missionStatus && missionStatus !== 'BROADCASTED' && missionStatus !== 'COMPLETED') ||
    (activeMission &&
      activeMission.status !== 'BROADCASTED' &&
      activeMission.status !== 'CANCELLED' &&
      activeMission.status !== 'COMPLETED'),
  );
}
