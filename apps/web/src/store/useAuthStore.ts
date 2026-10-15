import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { endServerSession } from '../services/session';

export type UserRole = 'CLIENT' | 'PROVIDER' | 'ADMIN';
export type AccountStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED_LOW_BALANCE' | 'BLOCKED' | 'REJECTED';

export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  role: UserRole;
  status: AccountStatus;
  avatarUrl?: string;
  defaultAddress?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  activeRole: UserRole;
  /** Signs in. The refresh token is kept when it is not given (profile edits pass only the current token). */
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  setTokens: (token: string, refreshToken: string) => void;
  setActiveRole: (role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      activeRole: 'CLIENT',

      setAuth: (user, token, refreshToken) =>
        set({
          user,
          token,
          ...(refreshToken ? { refreshToken } : {}),
          activeRole: user.role,
        }),

      setTokens: (token, refreshToken) => set({ token, refreshToken }),

      setActiveRole: (activeRole) => set({ activeRole }),

      logout: () => {
        const { refreshToken } = get();
        if (refreshToken) endServerSession(refreshToken);
        set({ user: null, token: null, refreshToken: null, activeRole: 'CLIENT' });
      },
    }),
    {
      name: 'el7al_web_auth',
    },
  ),
);
