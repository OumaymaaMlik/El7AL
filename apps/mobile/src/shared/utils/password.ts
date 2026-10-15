/** Returns a password strength score from 0 (very weak) to 4 (very strong). */
export function calculatePasswordStrength(pass: string): number {
  if (!pass) return 0;
  let score = 0;

  if (pass.length >= 8) score += 1;
  if (pass.length >= 12) score += 1;

  const variety = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) => re.test(pass)).length;
  if (variety >= 3) score += 1;
  if (variety === 4) score += 1;

  if (/(12345|qwerty|azerty|password|motdepasse|admin)/.test(pass.toLowerCase())) score -= 2;

  return Math.max(0, Math.min(4, score));
}
