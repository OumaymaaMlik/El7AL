import axios from 'axios';
import { API_URL } from '../../config/env';

/** A plain client with no interceptors: these calls must not trigger a refresh themselves. */
const bare = axios.create({ baseURL: API_URL, timeout: 8000 });

export interface Tokens {
  token: string;
  refreshToken: string;
}

/** Trades the refresh token for a new pair, or null when the server no longer accepts it. */
export async function requestNewTokens(refreshToken: string): Promise<Tokens | null> {
  try {
    const res = await bare.post('/auth/refresh', { refreshToken });
    return res.data?.token && res.data?.refreshToken
      ? { token: res.data.token, refreshToken: res.data.refreshToken }
      : null;
  } catch {
    return null;
  }
}

/** Tells the server the session is over so the refresh token stops working. Best effort. */
export function endServerSession(refreshToken: string): void {
  void bare.post('/auth/logout', { refreshToken }).catch(() => undefined);
}
