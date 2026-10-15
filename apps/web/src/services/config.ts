/**
 * Where the backend lives. Set VITE_API_URL (e.g. https://api.example.com/api/v1) for builds; in
 * development it defaults to port 4000 of whatever host serves this page, so opening the app from a
 * phone on the LAN reaches the backend on the same machine.
 */
const fromEnv = (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/+$/, '');

export const API_BASE_URL: string = fromEnv || `${window.location.protocol}//${window.location.hostname}:4000/api/v1`;

export const SOCKET_URL: string =
  (import.meta.env.VITE_SOCKET_URL as string | undefined)?.trim().replace(/\/+$/, '') ||
  API_BASE_URL.replace(/\/api\/v1$/, '');

if (import.meta.env.PROD && !API_BASE_URL.startsWith('https://')) {
  // Not fatal (an intranet install may use http), but the login token would travel in clear text.
  console.warn('VITE_API_URL should be an https:// address in production.');
}
