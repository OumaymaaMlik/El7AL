import { create } from 'zustand';
import { getStorageItem, setStorageItem, removeStorageItem } from '../../../services/storage/secureStorage';
import { userSessionSchema, type UserRole, type UserSession } from '../schemas/auth.schema';
import { resetSocketRooms } from '../../../services/socket/socket.client';
import { logger } from '../../../shared/utils/logger';
import { endServerSession } from '../../../services/http/session';

export type { UserRole, UserSession };

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: UserSession | null;
  activeRole: UserRole;
  isLoadingSession: boolean;
  isProviderAvailable: boolean;
  loadSavedSession: () => Promise<void>;
  /** Signs in. The refresh token is kept when it is not given (profile edits pass only the current token). */
  setSession: (token: string, user: UserSession, refreshToken?: string) => Promise<void>;
  setTokens: (token: string, refreshToken: string) => Promise<void>;
  /** An admin approved or refused the artisan: keep the saved session in step. */
  setAccountStatus: (status: string) => Promise<void>;
  setActiveRole: (role: UserRole) => void;
  setProviderAvailable: (isAvailable: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  refreshToken: null,
  user: null,
  activeRole: 'CLIENT',
  isLoadingSession: true,
  isProviderAvailable: false,

  loadSavedSession: async () => {
    try {
      const token = await getStorageItem('user_token');
      const sessionRaw = await getStorageItem('user_session');
      const refreshToken = await getStorageItem('user_refresh_token');

      if (token && sessionRaw) {
        const parsed = userSessionSchema.safeParse(JSON.parse(sessionRaw));
        if (!parsed.success) throw new Error('Stored session failed validation');
        const user = parsed.data;
        set({
          token,
          refreshToken,
          user,
          activeRole: user.role,
          isLoadingSession: false,
          isProviderAvailable: user.providerProfile?.isAvailable || false,
        });
        return;
      }
    } catch (e) {
      logger.warn('Failed to load saved session:', e);
    }
    await removeStorageItem('user_token');
    await removeStorageItem('user_session');
    await removeStorageItem('user_refresh_token');
    set({ token: null, refreshToken: null, user: null, isLoadingSession: false });
  },

  setSession: async (token, rawUser, refreshToken) => {
    const parsed = userSessionSchema.safeParse(rawUser);
    if (!token || !parsed.success) throw new Error('Invalid session payload received from server');
    const user = parsed.data;
    try {
      await setStorageItem('user_token', token);
      await setStorageItem('user_session', JSON.stringify(user));
      if (refreshToken) await setStorageItem('user_refresh_token', refreshToken);
    } catch (e) {
      logger.warn('Failed to store secure session:', e);
    }
    set({
      token,
      ...(refreshToken ? { refreshToken } : {}),
      user,
      activeRole: user.role,
      isProviderAvailable: user.providerProfile?.isAvailable || false,
    });
  },

  setTokens: async (token, refreshToken) => {
    try {
      await setStorageItem('user_token', token);
      await setStorageItem('user_refresh_token', refreshToken);
    } catch (e) {
      logger.warn('Failed to store renewed tokens:', e);
    }
    set({ token, refreshToken });
  },

  setAccountStatus: async (status) => {
    const user = get().user;
    if (!user) return;
    const next = { ...user, status };
    try {
      await setStorageItem('user_session', JSON.stringify(next));
    } catch (e) {
      logger.warn('Failed to store the account status:', e);
    }
    set({ user: next });
  },

  setActiveRole: (role) => {
    set({ activeRole: role });
  },

  setProviderAvailable: (isAvailable) => {
    set({ isProviderAvailable: isAvailable });
  },

  logout: async () => {
    const { refreshToken } = get();
    if (refreshToken) endServerSession(refreshToken);
    try {
      resetSocketRooms();
      await removeStorageItem('user_token');
      await removeStorageItem('user_session');
      await removeStorageItem('user_refresh_token');
    } catch (e) {
      logger.warn('Failed to clear secure session:', e);
    }
    set({ token: null, refreshToken: null, user: null, activeRole: 'CLIENT' });
  },
}));
