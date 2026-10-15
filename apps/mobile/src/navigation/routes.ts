import type { UserRole } from '../features/auth/schemas/auth.schema';

export const ROUTES = {
  welcome: '/(auth)/welcome',
  login: '/(auth)/login',
  register: '/(auth)/register',
  forgotPassword: '/(auth)/forgot-password',
  home: '/(tabs)/home',
  adminDashboard: '/dashboard_admin',
} as const;

/** Landing route after authentication, by role. */
export function homeRouteFor(role: UserRole) {
  return role === 'ADMIN' ? ROUTES.adminDashboard : ROUTES.home;
}
