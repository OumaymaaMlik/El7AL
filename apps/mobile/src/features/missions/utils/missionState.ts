interface MissionLike {
  activePairingProvider: unknown;
  missionStatus: string | null;
  activeMission: { status?: string } | null;
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
