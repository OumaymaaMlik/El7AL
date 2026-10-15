import { logger } from '../utils/logger.js';
const isProduction = () => process.env.NODE_ENV === 'production';

const DEV_JWT_SECRET = 'el7al_dev_only_jwt_secret_never_use_in_production';

/** The JWT signing secret. Production refuses to start without one; development uses a throwaway value. */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (isProduction()) {
    throw new Error('JWT_SECRET must be set (at least 16 characters) when NODE_ENV=production.');
  }
  logger.warn('JWT_SECRET is not set (or too short): using an insecure development secret.');
  return DEV_JWT_SECRET;
}

/**
 * Browser origins allowed by CORS and Socket.IO, from the comma-separated CORS_ORIGINS variable.
 * Development allows any origin; production allows only the listed ones (native apps send no Origin header).
 */
export function allowedOrigins(): true | string[] {
  const list = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (list.length > 0) return list;
  return isProduction() ? [] : true;
}

/** Refuses to start in production with settings that would silently break or expose the service. */
export function assertProductionConfig(): void {
  if (!isProduction()) return;
  const missing = [
    'DATABASE_URL',
    'REDIS_PASSWORD',
    'MINIO_ROOT_PASSWORD',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS',
  ].filter((name) => !process.env[name]);
  if (missing.length > 0) throw new Error(`Missing production settings: ${missing.join(', ')}`);
  if ((process.env.EMAIL_PROVIDER || 'mock') === 'mock') {
    throw new Error('EMAIL_PROVIDER cannot be "mock" in production: users would never receive their codes.');
  }
  if (allowedOrigins() === true || (allowedOrigins() as string[]).length === 0) {
    logger.warn('CORS_ORIGINS is not set: browsers other than native apps are refused. Set it to your web app origin.');
  }
}
