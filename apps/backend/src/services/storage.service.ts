import * as Minio from 'minio';
import { hasOwnJson } from '../utils/sanitize.js';
import crypto from 'crypto';
import path from 'path';
import { logger } from '../utils/logger.js';

const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && !process.env.MINIO_ROOT_PASSWORD) {
  throw new Error('MINIO_ROOT_PASSWORD must be set when NODE_ENV=production.');
}

/** Where the backend reaches MinIO (inside Docker this is the service name, e.g. http://minio:9000). */
const internalEndpoint = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
/** The address browsers and phones use for the same files (https, behind the reverse proxy). */
const publicBase = (process.env.MINIO_PUBLIC_URL || internalEndpoint).replace(/\/+$/, '');

const internalUrl = new URL(internalEndpoint);
const minioClient = new Minio.Client({
  endPoint: internalUrl.hostname,
  port: parseInt(internalUrl.port || (internalUrl.protocol === 'https:' ? '443' : '80'), 10),
  useSSL: internalUrl.protocol === 'https:',
  accessKey: process.env.MINIO_ROOT_USER || 'minio_admin',
  secretKey: process.env.MINIO_ROOT_PASSWORD || 'minio_password_2026',
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'el7al-uploads';

/**
 * Signed links are computed (no network call) against the PUBLIC address, because the signature covers
 * the Host header the browser will send. The reverse proxy must forward that Host unchanged to MinIO.
 */
const publicUrl = new URL(publicBase);
const signer = new Minio.Client({
  endPoint: publicUrl.hostname,
  port: parseInt(publicUrl.port || (publicUrl.protocol === 'https:' ? '443' : '80'), 10),
  useSSL: publicUrl.protocol === 'https:',
  region: 'us-east-1',
  accessKey: process.env.MINIO_ROOT_USER || 'minio_admin',
  secretKey: process.env.MINIO_ROOT_PASSWORD || 'minio_password_2026',
});

/** Identity documents and payment receipts are private; only avatars can be fetched without a signature. */
const PRIVATE_FOLDERS = ['documents', 'receipts'] as const;
const SIGNED_URL_SECONDS = 15 * 60;

let bucketReady = false;

/** Creates the bucket if needed and (re)applies the policy: public read for avatars only. */
export async function initStorageBucket() {
  if (bucketReady) return;
  try {
    if (!(await minioClient.bucketExists(BUCKET_NAME))) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      logger.info(`Created MinIO bucket: ${BUCKET_NAME}`);
    }
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/avatars/*`],
        },
      ],
    };
    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    bucketReady = true;
  } catch (err) {
    logger.error({ err }, 'MinIO storage initialization error');
  }
}

/** Upload a file buffer and return its URL (public for avatars, a plain link that needs signing otherwise). */
export async function uploadFileToMinIO(
  buffer: Buffer,
  originalFilename: string,
  folder: 'documents' | 'receipts' | 'avatars',
  mimeType: string,
): Promise<string> {
  await initStorageBucket();

  const fileExt = path.extname(originalFilename) || '.jpg';
  const uniqueName = `${folder}/${crypto.randomUUID()}${fileExt}`;

  await minioClient.putObject(BUCKET_NAME, uniqueName, buffer, buffer.length, {
    'Content-Type': mimeType,
  });

  return `${publicBase}/${BUCKET_NAME}/${uniqueName}`;
}

/** The object key of a private file URL we issued, or null for anything else. */
function privateKeyOf(value: string): string | null {
  const prefix = `${publicBase}/${BUCKET_NAME}/`;
  if (!value.startsWith(prefix)) return null;
  const key = value.slice(prefix.length);
  return PRIVATE_FOLDERS.some((folder) => key.startsWith(`${folder}/`)) ? key : null;
}

/**
 * Replaces every private file URL inside a response with a short-lived signed one, so an admin can
 * open identity documents and receipts while the files stay closed to everybody else.
 */
export async function signPrivateUrls<T>(value: T): Promise<T> {
  if (typeof value === 'string') {
    const key = privateKeyOf(value);
    if (!key) return value;
    try {
      return (await signer.presignedGetObject(BUCKET_NAME, key, SIGNED_URL_SECONDS)) as unknown as T;
    } catch {
      return value;
    }
  }
  if (Array.isArray(value)) return (await Promise.all(value.map(signPrivateUrls))) as unknown as T;
  if (value && typeof value === 'object' && !hasOwnJson(value)) {
    const entries = await Promise.all(
      Object.entries(value as Record<string, unknown>).map(async ([k, v]) => [k, await signPrivateUrls(v)] as const),
    );
    return Object.fromEntries(entries) as T;
  }
  return value;
}

/** Removes a file we stored, given its URL (used when an account is deleted). Never throws: a missing file is fine. */
export async function deleteStoredFile(url: string | null | undefined): Promise<void> {
  const prefix = `${publicBase}/${BUCKET_NAME}/`;
  if (!url || !url.startsWith(prefix)) return;
  try {
    await minioClient.removeObject(BUCKET_NAME, url.slice(prefix.length));
  } catch (err) {
    logger.warn({ err }, 'Could not remove a stored file');
  }
}
