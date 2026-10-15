/**
 * Sets a new password for an admin account (when the password is lost, or to choose a first one).
 *
 *   npm run admin:reset --workspace=@el7al/backend -- admin@example.com "a new password of 12+ characters"
 *
 * Only accounts with the ADMIN role can be changed this way.
 */
import { db } from '../config/db.js';
import { hashPassword } from '../utils/hash.js';

async function main() {
  const [emailArg, password] = process.argv.slice(2);
  const email = emailArg?.trim().toLowerCase();
  if (!email || !password || password.length < 12) {
    throw new Error('Usage: admin:reset <admin e-mail> "<new password, at least 12 characters>"');
  }
  const admin = await db.user.findFirst({ where: { email, role: 'ADMIN' }, select: { id: true } });
  if (!admin) throw new Error(`No admin account with the e-mail ${email}.`);
  await db.user.update({
    where: { id: admin.id },
    data: { passwordHash: await hashPassword(password), status: 'ACTIVE' },
  });
  console.log(`The password of ${email} was changed.`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
