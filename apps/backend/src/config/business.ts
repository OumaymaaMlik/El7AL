import { ACTIVATION_FEE_TND, COMMISSION_FEE_TND } from '@el7al/shared';

export { ACTIVATION_FEE_TND, COMMISSION_FEE_TND };

/**
 * An artisan is stopped while they owe El 7al: after a finished job they have been paid in cash, and the commission
 * (plus, once, the activation fee) is taken from the wallet, which goes negative until a transfer is confirmed.
 */
export function owesCommission(profile: { walletBalance: unknown }): boolean {
  return Number(profile.walletBalance) < 0;
}

export const COMMISSION_DUE_MESSAGE = 'Réglez votre commission pour continuer à recevoir des demandes.';
