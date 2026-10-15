import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env from apps/backend/.env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/backend/.env') });

import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set. Define it in apps/backend/.env.');
}

export const db = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
