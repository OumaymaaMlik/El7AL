import { randomUUID } from 'crypto';
import { db } from '../../config/db.js';
import { AccountStatus, MissionStatus, UserRole } from '@el7al/shared';
import { verifyPassword } from '../../utils/hash.js';
import { removeProviderGeoLocation } from '../../services/redis.service.js';
import { deleteStoredFile } from '../../services/storage.service.js';
import { forgetAccountStatus } from '../../utils/authGuards.js';
import { getIO } from '../../websockets/socket.gateway.js';

const OPEN_STATUSES = [
  MissionStatus.BROADCASTED,
  MissionStatus.ACCEPTED,
  MissionStatus.EN_ROUTE,
  MissionStatus.ARRIVED,
  MissionStatus.IN_PROGRESS,
  MissionStatus.DUAL_CONFIRM,
];

const REMOVED_NAME = 'Compte supprimé';
const REMOVED_MESSAGE = '[message supprimé]';

type Refusals = { openMission: string; negativeBalance?: string };

/** What a refusal says, depending on who asked: the owner is addressed directly, an admin is told about the user. */
const SELF_REFUSALS: Refusals = {
  openMission: 'Terminez ou annulez votre demande ou intervention en cours avant de supprimer le compte.',
  negativeBalance: 'Votre solde de commissions est négatif. Contactez El 7al pour le régulariser avant la suppression.',
};
// An admin may delete an artisan who still owes commission: the balance stays on the erased profile, so the debt is not lost.
const ADMIN_REFUSALS: Refusals = {
  openMission:
    'Cet utilisateur a une demande ou une intervention en cours: attendez sa fin ou annulez-la avant de supprimer le compte.',
};

const loadAccount = (userId: string) =>
  db.user.findUnique({ where: { id: userId }, include: { clientProfile: true, providerProfile: true } });
type Account = NonNullable<Awaited<ReturnType<typeof loadAccount>>>;

/** Nobody escapes a debt or abandons a customer by deleting: refuse while a job is open or commission is owed. */
async function assertErasable(user: Account, refusals: Refusals) {
  const open = await db.mission.count({
    where: {
      status: { in: OPEN_STATUSES },
      OR: [
        ...(user.clientProfile ? [{ clientId: user.clientProfile.id }] : []),
        ...(user.providerProfile ? [{ providerId: user.providerProfile.id }] : []),
      ],
    },
  });
  if (open > 0) throw new Error(refusals.openMission);
  if (refusals.negativeBalance && user.providerProfile && Number(user.providerProfile.walletBalance) < 0) {
    throw new Error(refusals.negativeBalance);
  }
}

/**
 * A person deletes their own account (the stores require it). Personal data is erased in place: name, phone,
 * e-mail, photo, identity documents, address, position, push token and the text they wrote. What other people
 * keep (a finished job in an artisan's history, a rating) stays, but no longer points to a person.
 */
export async function deleteOwnAccount(userId: string, password: string): Promise<void> {
  const user = await loadAccount(userId);
  if (!user) throw new Error('Compte introuvable.');
  if (user.role === UserRole.ADMIN) throw new Error('Un compte administrateur ne peut pas être supprimé ici.');
  if (!(await verifyPassword(user.passwordHash, password))) throw new Error('Mot de passe incorrect.');
  await assertErasable(user, SELF_REFUSALS);
  await eraseAccount(user);
}

/**
 * An admin deletes an account. The same erasure as above, because a row that jobs, ratings and the money ledger
 * point to cannot simply be removed from the database.
 */
export async function deleteAccountAsAdmin(userId: string): Promise<void> {
  const user = await loadAccount(userId);
  if (!user) throw new Error('Compte introuvable.');
  if (user.role === UserRole.ADMIN) throw new Error('Un compte administrateur ne peut pas être supprimé ici.');
  await assertErasable(user, ADMIN_REFUSALS);
  await eraseAccount(user);
}

async function eraseAccount(user: Account): Promise<void> {
  const userId = user.id;
  const documents = user.providerProfile?.documentsUrl ?? [];

  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: {
        fullName: REMOVED_NAME,
        phoneNumber: `deleted-${userId}`,
        email: null,
        avatarUrl: null,
        pushToken: null,
        // Nobody can sign in again: the password is replaced by a random one nobody knows, and the account is closed.
        passwordHash: randomUUID(),
        status: AccountStatus.BLOCKED,
      },
    }),
    db.chatMessage.updateMany({ where: { senderId: userId }, data: { content: REMOVED_MESSAGE } }),
    ...(user.clientProfile
      ? [
          db.clientProfile.update({
            where: { id: user.clientProfile.id },
            data: { defaultAddress: null, defaultLat: null, defaultLng: null },
          }),
          db.review.updateMany({ where: { clientId: user.clientProfile.id }, data: { comment: null } }),
        ]
      : []),
    ...(user.providerProfile
      ? [
          db.providerProfile.update({
            where: { id: user.providerProfile.id },
            data: {
              bio: null,
              address: null,
              currentLat: null,
              currentLng: null,
              isAvailable: false,
              documentsUrl: [],
              cinNumber: null,
              licenseNumber: null,
              verificationNote: null,
            },
          }),
        ]
      : []),
  ]);

  if (user.providerProfile) await removeProviderGeoLocation(user.providerProfile.id);
  await Promise.all([user.avatarUrl, ...documents].map(deleteStoredFile));

  forgetAccountStatus(userId);
  try {
    getIO().in(`user_${userId}`).disconnectSockets(true);
  } catch {
    // Sockets are not running (scripts): nothing to disconnect.
  }
}
