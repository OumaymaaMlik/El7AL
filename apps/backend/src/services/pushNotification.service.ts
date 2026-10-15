import axios from 'axios';
import { db } from '../config/db.js';
import { logger } from '../utils/logger.js';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const isExpoToken = (token: string) => /^Expo(nent)?PushToken\[.+\]$/.test(token);

/** Sends a push to one user's phone (if the app registered one). Never throws: a missed push must not break a mission step. */
export async function pushToUser(
  userId: string | undefined | null,
  title: string,
  body: string,
  data: Record<string, unknown> = {},
): Promise<void> {
  if (!userId) return;
  try {
    const user = await db.user.findUnique({ where: { id: userId }, select: { pushToken: true } });
    if (!user?.pushToken || !isExpoToken(user.pushToken)) return;
    await axios.post(
      EXPO_PUSH_URL,
      { to: user.pushToken, sound: 'default', title, body, data, _displayInForeground: true },
      { headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, timeout: 8000 },
    );
  } catch (err) {
    const detail = axios.isAxiosError(err) ? (err.response?.data ?? err.message) : err;
    logger.warn({ err: detail }, 'Push notification failed');
  }
}
