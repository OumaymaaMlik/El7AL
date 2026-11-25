import { db } from '../../config/db.js';
import { logger } from '../../utils/logger.js';

/** El 7al's bank account: where artisans transfer what they owe. */
const KEY = 'el7al_rib';

export const RIB_FORMAT_MESSAGE = 'Saisissez un RIB de 20 chiffres, ou un IBAN tunisien (TN suivi de 22 chiffres).';

/** The account written the usual way, or an error when it is neither a Tunisian RIB nor a Tunisian IBAN. */
export function formatRib(input: string): string {
  const compact = input.replace(/[\s.-]/g, '').toUpperCase();
  if (/^TN\d{22}$/.test(compact)) return compact.replace(/(.{4})(?=.)/g, '$1 ');
  const rib = /^(\d{2})(\d{3})(\d{13})(\d{2})$/.exec(compact);
  if (rib) return rib.slice(1).join(' ');
  throw new Error(RIB_FORMAT_MESSAGE);
}

/** What the admin saved; before that, EL7AL_RIB from the server settings (or nothing). */
export async function currentRib() {
  const saved = await db.setting.findUnique({ where: { key: KEY } });
  if (saved) return { rib: saved.value, updatedAt: saved.updatedAt };
  return { rib: process.env.EL7AL_RIB?.trim() || null, updatedAt: null };
}

export async function changeRib(input: string, adminUserId: string) {
  const value = formatRib(input);
  const saved = await db.setting.upsert({
    where: { key: KEY },
    create: { key: KEY, value, updatedBy: adminUserId },
    update: { value, updatedBy: adminUserId },
  });
  // Money goes to this account: every change leaves a trace.
  logger.info({ adminUserId }, "El 7al's bank account was changed");
  return { rib: saved.value, updatedAt: saved.updatedAt };
}
