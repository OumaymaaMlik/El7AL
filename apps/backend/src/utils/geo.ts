/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return parseFloat(distance.toFixed(2));
}

/**
 * Calculates estimated travel time in minutes based on distance and city speed (default 30 km/h)
 */
export function calculateEtaMinutes(distanceKm: number, averageSpeedKmH: number = 30): number {
  if (distanceKm <= 0) return 0;
  const hours = distanceKm / averageSpeedKmH;
  const minutes = Math.ceil(hours * 60);
  return minutes;
}
