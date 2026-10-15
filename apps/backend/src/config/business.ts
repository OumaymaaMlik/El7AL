/** Fixed commission charged to the artisan for every completed mission, in TND. */
export const COMMISSION_FEE_TND = 30;

/**
 * Optional safety net: when MAX_PROVIDER_DEBT_TND is set (> 0), an artisan who owes more commission than
 * that stops receiving offers and cannot accept new ones until the balance is settled. Unset = no limit.
 */
export function maxProviderDebt(): number {
  const value = Number(process.env.MAX_PROVIDER_DEBT_TND);
  return Number.isFinite(value) && value > 0 ? value : 0;
}
