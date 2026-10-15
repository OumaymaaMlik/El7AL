import { describe, expect, it } from 'vitest';
import { distanceKm, isActive, isOngoing, isSearching } from '../mission';
import { durationMinutes } from '../../components/admin/adminTypes';

describe('mission statuses', () => {
  it('tells a search from a job under way', () => {
    expect(isSearching('BROADCASTED')).toBe(true);
    expect(isSearching('ACCEPTED')).toBe(false);
    expect(isOngoing('EN_ROUTE')).toBe(true);
    expect(isOngoing('COMPLETED')).toBe(false);
  });

  it('counts both as the mission the client is waiting for', () => {
    expect(isActive('CREATED')).toBe(true);
    expect(isActive('DUAL_CONFIRM')).toBe(true);
    expect(isActive('CANCELLED')).toBe(false);
    expect(isActive(undefined)).toBe(false);
  });
});

describe('distanceKm', () => {
  it('is zero for the same point', () => {
    expect(distanceKm(36.8, 10.18, 36.8, 10.18)).toBe(0);
  });

  it('measures Tunis to Sousse at about 120 km', () => {
    const km = distanceKm(36.8065, 10.1815, 35.8256, 10.6084);
    expect(km).toBeGreaterThan(110);
    expect(km).toBeLessThan(130);
  });
});

describe('durationMinutes', () => {
  it('is null until the job is finished', () => {
    expect(durationMinutes('2026-01-01T10:00:00Z', undefined)).toBeNull();
    expect(durationMinutes(undefined, '2026-01-01T10:00:00Z')).toBeNull();
  });

  it('rounds to minutes and never shows less than one', () => {
    expect(durationMinutes('2026-01-01T10:00:00Z', '2026-01-01T10:42:20Z')).toBe(42);
    expect(durationMinutes('2026-01-01T10:00:00Z', '2026-01-01T10:00:10Z')).toBe(1);
  });
});
