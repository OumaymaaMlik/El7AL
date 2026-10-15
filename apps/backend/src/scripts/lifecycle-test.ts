/**
 * End-to-end test of the mission lifecycle shared by the mobile and web apps:
 * verified registration, proximity dispatch, accept, the server-driven steps, dual confirmation,
 * review, plus the security rules (socket auth, room membership, ownership).
 *
 * Runs against the real database and Redis configured in .env, with the server started in-process
 * on a random port, and removes every row it creates. Usage: npm run test:lifecycle
 */
import { publish } from '../events/domain-events.js';
import { verifyAccessToken } from '../services/sessions.js';
import './test-env.js';
import { io as connect, Socket } from 'socket.io-client';
import { buildServer } from '../server.js';
import { initSocketGateway } from '../websockets/socket.gateway.js';
import { db } from '../config/db.js';
import { redis } from '../services/redis.service.js';
import { hashPassword } from '../utils/hash.js';
import { deleteStoredFile } from '../services/storage.service.js';

const results: { name: string; ok: boolean; detail?: string }[] = [];
const check = (name: string, ok: boolean, detail?: string) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${!ok && detail ? `  -> ${detail}` : ''}`);
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function waitFor<T = any>(socket: Socket, event: string, ms = 4000, match?: (d: any) => boolean): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      socket.off(event, handler);
      resolve(null);
    }, ms);
    const handler = (data: any) => {
      if (match && !match(data)) return;
      clearTimeout(timer);
      socket.off(event, handler);
      resolve(data);
    };
    socket.on(event, handler);
  });
}

/** Counts every delivery of an event, to prove each one arrives exactly once. */
function collect(socket: Socket, event: string, match?: (d: any) => boolean) {
  const seen: any[] = [];
  socket.on(event, (d: any) => {
    if (!match || match(d)) seen.push(d);
  });
  return { count: () => seen.length, last: () => seen[seen.length - 1] };
}

async function main() {
  const app = await buildServer();
  await app.listen({ port: 0, host: '127.0.0.1' });
  initSocketGateway(app.server, verifyAccessToken(app));
  const port = (app.server.address() as { port: number }).port;
  const base = `http://127.0.0.1:${port}`;

  const stamp = Date.now().toString().slice(-8);
  const createdUserIds: string[] = [];
  const sockets: Socket[] = [];
  const missionIds: string[] = [];

  const call = async (method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, token?: string, payload?: object) => {
    const res = await app.inject({
      method,
      url: `/api/v1${url}`,
      payload,
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    });
    let body: any = null;
    try {
      body = res.json();
    } catch {
      /* not json */
    }
    return { status: res.statusCode, body };
  };

  const open = (token: string) =>
    new Promise<Socket>((resolve) => {
      const s = connect(base, { transports: ['websocket'], reconnection: false, auth: { token } });
      sockets.push(s);
      s.on('connect', () => resolve(s));
      s.on('connect_error', () => resolve(s));
    });

  async function register(role: 'client' | 'provider', n: number, categoryId?: string) {
    const email = `lifecycle-${role}-${stamp}-${n}@example.invalid`;
    const sent = await call('POST', '/auth/email/send-verification', undefined, { email, fullName: `Test ${role}` });
    const verified = await call('POST', '/auth/email/verify', undefined, { email, code: sent.body?.code });
    const body: any = {
      fullName: `Test ${role} ${n}`,
      phoneNumber: `+216${stamp.slice(-7)}${n}`,
      email,
      password: 'Lifecycle#1',
      ...(role === 'provider'
        ? {
            categoryIds: [categoryId],
            cinNumber: '12345678',
            cinFrontUrl: 'https://x.invalid/front.jpg',
            vehicleType: 'CAR',
          }
        : {}),
    };
    const res = await call('POST', `/auth/register/${role}`, undefined, body);
    if (res.body?.user?.id) createdUserIds.push(res.body.user.id);
    return { email, verified, res, token: res.body?.token as string, id: res.body?.user?.id as string };
  }

  try {
    const category = await db.category.findFirst();
    if (!category) throw new Error('No category in the database: seed categories first.');

    // ---- Registration rules
    const unverified = await call('POST', '/auth/register/client', undefined, {
      fullName: 'No Verify',
      phoneNumber: `+216${stamp.slice(-7)}9`,
      email: `unverified-${stamp}@example.invalid`,
      password: 'Lifecycle#1',
    });
    check(
      'registration is refused without a verified email',
      unverified.status === 400,
      JSON.stringify(unverified.body),
    );

    const probe = `lifecycle-probe-${stamp}@example.invalid`;
    const probeSent = await call('POST', '/auth/email/send-verification', undefined, { email: probe });
    let lastStatus = 0;
    for (let i = 0; i < 6; i++)
      lastStatus = (await call('POST', '/auth/email/verify', undefined, { email: probe, code: '000000' })).status;
    const afterBurn = await call('POST', '/auth/email/verify', undefined, { email: probe, code: probeSent.body?.code });
    check(
      'email code is burned after 5 wrong attempts',
      lastStatus === 429 && afterBurn.status !== 200,
      `${lastStatus}/${afterBurn.status}`,
    );

    const client = await register('client', 1);
    check(
      'client registers after verifying the email',
      client.res.status === 201 && Boolean(client.token),
      JSON.stringify(client.res.body).slice(0, 120),
    );
    check(
      'registration response never contains passwordHash',
      !JSON.stringify(client.res.body).includes('passwordHash'),
    );

    const reuse = await call('POST', '/auth/register/client', undefined, {
      fullName: 'Reuse',
      phoneNumber: `+216${stamp.slice(-7)}8`,
      email: client.email,
      password: 'Lifecycle#1',
    });
    check('a verification cannot be reused for a second account', reuse.status === 400);

    const provider = await register('provider', 2, category.id);
    check(
      'provider registers with documents',
      provider.res.status === 201,
      JSON.stringify(provider.res.body).slice(0, 120),
    );
    const profile = await db.providerProfile.findUnique({ where: { userId: provider.id } });
    check(
      'provider documents and identity fields are stored',
      (profile?.documentsUrl.length ?? 0) === 1 && profile?.cinNumber === '12345678' && profile?.vehicleType === 'CAR',
    );

    const stranger = await register('provider', 3, category.id);
    await db.user.updateMany({ where: { id: { in: [provider.id, stranger.id] } }, data: { status: 'ACTIVE' } });

    // ---- Calls the web app makes outside the mission flow
    const cats = await call('GET', '/categories');
    check(
      'categories list has id and name',
      Array.isArray(cats.body?.data) &&
        cats.body.data.length > 0 &&
        Boolean(cats.body.data[0].id && cats.body.data[0].name),
    );
    const me = await call('GET', '/users/me', client.token);
    check(
      'GET /users/me returns the profile',
      me.status === 200 && me.body?.data?.id === client.id && !JSON.stringify(me.body).includes('passwordHash'),
    );
    const authMe = await call('GET', '/auth/me', provider.token);
    check(
      'GET /auth/me exposes providerProfile.isAvailable and rating',
      authMe.status === 200 && typeof authMe.body?.data?.providerProfile?.isAvailable === 'boolean',
    );
    const edit = await call('PUT', '/users/profile', client.token, {
      fullName: 'Renamed Client',
      defaultAddress: 'Lac 2',
    });
    check(
      'PUT /users/profile updates the name',
      edit.status === 200 && edit.body?.data?.fullName === 'Renamed Client',
      JSON.stringify(edit.body).slice(0, 100),
    );
    const shortPassword = await call('PUT', '/users/profile', client.token, {
      oldPassword: 'Lifecycle#1',
      password: '123',
    });
    check('a short new password is refused', shortPassword.status === 400);
    const settings = await call('PUT', '/geo/provider/settings', provider.token, { bio: 'Test bio', radiusKm: 30 });
    check(
      'PUT /geo/provider/settings stores bio and radius',
      settings.status === 200,
      JSON.stringify(settings.body).slice(0, 100),
    );

    // ---- Socket authentication
    const anonymous = await open('');
    check('socket without a token is rejected', !anonymous.connected);
    const providerSocket = await open(provider.token);
    const clientSocket = await open(client.token);
    const strangerSocket = await open(stranger.token);
    check(
      'authenticated sockets connect',
      providerSocket.connected && clientSocket.connected && strangerSocket.connected,
    );

    // ---- Provider goes online at a position near the pickup
    const pickup = { lat: 36.8065, lng: 10.1815 };
    for (const p of [provider, stranger]) {
      const online = await call('PUT', '/geo/provider/availability', p.token, {
        isAvailable: true,
        currentLat: pickup.lat + 0.01,
        currentLng: pickup.lng,
      });
      check(
        `artisan ${p === provider ? 'A' : 'B'} goes online with a position`,
        online.status === 200,
        JSON.stringify(online.body).slice(0, 100),
      );
    }

    const candidates = await call(
      'GET',
      `/missions/candidates?categoryId=${category.id}&pickupLat=${pickup.lat}&pickupLng=${pickup.lng}`,
      client.token,
    );
    const listed = (candidates.body?.data ?? []).map((c: any) => c.providerId);
    check(
      'candidates lists the nearby artisans without phone numbers',
      listed.includes(profile?.id) && !JSON.stringify(candidates.body).includes('phoneNumber'),
    );

    // ---- Request restricted to a chosen artisan
    const request = {
      categoryId: category.id,
      pickupLat: pickup.lat,
      pickupLng: pickup.lng,
      addressText: 'Test address',
      description: 'Lifecycle test',
    };
    const offerForA = waitFor(providerSocket, 'mission:new_offer');
    const offerForB = waitFor(strangerSocket, 'mission:new_offer', 1500);
    const created = await call('POST', '/missions/request', client.token, {
      ...request,
      selectedProviderIds: [profile?.id],
    });
    const missionId: string = created.body?.data?.mission?.id;
    missionIds.push(missionId);
    check(
      'request is created',
      created.status === 201 && Boolean(missionId),
      JSON.stringify(created.body).slice(0, 120),
    );
    check('only the chosen artisan receives the offer', Boolean(await offerForA) && !(await offerForB));

    // ---- Room membership (the participants are in the mission room too, as when they have the tracking page open)
    clientSocket.emit('join_room', `mission_${missionId}`);
    providerSocket.emit('join_room', `mission_${missionId}`);
    await sleep(300);
    strangerSocket.emit('join_room', `mission_${missionId}`);
    const leak = waitFor(strangerSocket, 'mission:status_update', 1500);

    // ---- Accept and the server-driven steps
    const accepted = waitFor(clientSocket, 'mission:accepted');
    const acceptedCopies = collect(clientSocket, 'mission:accepted');
    const takenForOthers = collect(strangerSocket, 'mission:taken');
    const takenForAccepter = collect(providerSocket, 'mission:taken');
    const acc = await call('POST', `/missions/${missionId}/accept`, provider.token);
    check(
      'artisan accepts and the client is notified',
      acc.status === 200 && Boolean(await accepted),
      JSON.stringify(acc.body).slice(0, 100),
    );
    await sleep(300);
    check(
      'the acceptance reaches the client exactly once',
      acceptedCopies.count() === 1,
      String(acceptedCopies.count()),
    );
    check(
      'other artisans learn the request is taken, the artisan who accepted does not',
      takenForOthers.count() === 1 && takenForAccepter.count() === 0,
      `${takenForOthers.count()}/${takenForAccepter.count()}`,
    );

    const intruder = await call('POST', `/missions/${missionId}/start-route`, stranger.token);
    check('another artisan cannot drive the mission', intruder.status >= 400);

    const outOfOrder = await call('POST', `/missions/${missionId}/start-work`, provider.token);
    check(
      'steps cannot be skipped (start-work right after accept)',
      outOfOrder.status >= 400,
      String(outOfOrder.status),
    );

    const steps: [string, string][] = [
      ['start-route', 'EN_ROUTE'],
      ['arrived', 'ARRIVED'],
      ['start-work', 'IN_PROGRESS'],
    ];
    for (const [route, expected] of steps) {
      const evt = waitFor(clientSocket, 'mission:status_update', 4000, (d) => d.status === expected);
      const copies = collect(clientSocket, 'mission:status_update', (d) => d.status === expected);
      const providerCopies = collect(providerSocket, 'mission:status_update', (d) => d.status === expected);
      const chatLines = collect(clientSocket, 'chat:receive', (d) => d.system === true);
      const res = await call('POST', `/missions/${missionId}/${route}`, provider.token);
      check(
        `${route}: client sees ${expected}`,
        res.status === 200 && Boolean(await evt),
        `${res.status} ${JSON.stringify(res.body).slice(0, 100)}`,
      );
      await sleep(300);
      check(
        `${route}: each side receives it exactly once`,
        copies.count() === 1 && providerCopies.count() === 1,
        `${copies.count()}/${providerCopies.count()}`,
      );
      check(
        `${route}: its chat line is flagged as a system line, once`,
        chatLines.count() === 1,
        String(chatLines.count()),
      );
      const stored = await call('GET', `/missions/${missionId}`, client.token);
      check(
        `${route}: state survives a reload (${expected})`,
        stored.body?.data?.status === expected,
        String(stored.body?.data?.status),
      );
      const repeat = await call('POST', `/missions/${missionId}/${route}`, provider.token);
      check(`${route}: repeating it is harmless`, repeat.status === 200);
    }

    const peek = await call('GET', `/missions/${missionId}`, stranger.token);
    check('a stranger cannot read the mission', peek.status === 404, String(peek.status));
    const strangerCancel = await call('POST', `/missions/${missionId}/cancel`, stranger.token, { reason: 'x' });
    check('a stranger cannot cancel the mission', strangerCancel.status >= 400, String(strangerCancel.status));
    const strangerRead = await call('POST', `/missions/${missionId}/read`, stranger.token);
    check('a stranger cannot mark its messages read', strangerRead.status === 404, String(strangerRead.status));
    check('a stranger in the room received nothing', !(await leak));

    const clientEarly = await call('POST', `/missions/${missionId}/dual-confirm`, client.token);
    check(
      'the client cannot confirm before the artisan has finished',
      clientEarly.status >= 400,
      String(clientEarly.status),
    );
    const strangerFinish = await call('POST', `/missions/${missionId}/dual-confirm`, stranger.token);
    check('another artisan cannot finish the mission', strangerFinish.status >= 400, String(strangerFinish.status));
    const providerDone = waitFor(clientSocket, 'mission:status_update', 4000, (d) => d.status === 'DUAL_CONFIRM');
    const finish = await call('POST', `/missions/${missionId}/dual-confirm`, provider.token);
    check(
      'artisan finishes: client is asked to confirm',
      finish.status === 200 && Boolean(await providerDone),
      JSON.stringify(finish.body).slice(0, 100),
    );

    const completed = waitFor(providerSocket, 'mission:completed');
    const confirm = await call('POST', `/missions/${missionId}/dual-confirm`, client.token);
    check(
      'client confirms: mission completes for both',
      confirm.status === 200 && Boolean(await completed),
      JSON.stringify(confirm.body).slice(0, 100),
    );

    const afterConfirm = await db.providerProfile.findUnique({
      where: { userId: provider.id },
      select: { walletBalance: true },
    });
    check(
      'the fixed 30 TND commission is charged automatically on completion',
      Number(afterConfirm?.walletBalance) === -30,
      String(afterConfirm?.walletBalance),
    );
    await call('POST', `/missions/${missionId}/dual-confirm`, client.token);
    const afterRepeat = await db.providerProfile.findUnique({
      where: { userId: provider.id },
      select: { walletBalance: true },
    });
    check(
      'confirming twice does not charge twice',
      Number(afterRepeat?.walletBalance) === -30,
      String(afterRepeat?.walletBalance),
    );

    const strangerReview = await call('POST', `/missions/${missionId}/review`, stranger.token, {
      rating: 1,
      comment: 'x',
    });
    check('a non-client cannot review the mission', strangerReview.status >= 400, String(strangerReview.status));
    const reviewed = waitFor(providerSocket, 'mission:reviewed');
    const reviewCopies = collect(providerSocket, 'mission:reviewed');
    const review = await call('POST', `/missions/${missionId}/review`, client.token, {
      rating: 5,
      comment: 'Parfait',
      amount: 40,
    });
    const reviewPayload = await reviewed;
    check(
      'client reviews and the artisan is notified',
      review.status === 200 && Boolean(reviewPayload),
      JSON.stringify(review.body).slice(0, 100),
    );
    await sleep(300);
    check(
      'the review reaches the artisan exactly once, with the real comment and rating',
      reviewCopies.count() === 1 && reviewPayload?.comment === 'Parfait' && reviewPayload?.rating === 5,
      `${reviewCopies.count()} ${reviewPayload?.comment}`,
    );

    const secondReview = await call('POST', `/missions/${missionId}/review`, client.token, {
      rating: 1,
      comment: 'again',
    });
    check('a mission can be reviewed only once', secondReview.status >= 400, String(secondReview.status));

    const done = await db.mission.findUnique({ where: { id: missionId } });
    check('mission ends COMPLETED', done?.status === 'COMPLETED', String(done?.status));

    // ---- History payload
    const history = await call('GET', '/missions/history?limit=5', client.token);
    check(
      'history has meta.completedCount and unreadCount',
      history.body?.meta?.completedCount >= 1 && typeof history.body?.data?.[0]?.unreadCount === 'number',
    );

    // ---- Manual verification of artisans (admin queue)
    // Created directly: the registration rate limit (a few e-mail codes per minute) is already used up by the checks above.
    const newcomerRow = await db.user.create({
      data: {
        fullName: 'Lifecycle Newcomer',
        phoneNumber: `+998${stamp}`,
        email: `lifecycle-newcomer-${stamp}@example.invalid`,
        passwordHash: await hashPassword('Lifecycle#1'),
        role: 'PROVIDER',
        status: 'PENDING_VERIFICATION',
        providerProfile: {
          create: {
            documentsUrl: ['https://x.invalid/front.jpg'],
            cinNumber: '87654321',
            categories: { create: [{ categoryId: category.id }] },
          },
        },
      },
    });
    createdUserIds.push(newcomerRow.id);
    const newcomerLogin = await call('POST', '/auth/login', undefined, {
      identifier: newcomerRow.email,
      password: 'Lifecycle#1',
    });
    const newcomer = { id: newcomerRow.id, token: newcomerLogin.body?.token as string };
    check('a pending artisan can sign in', Boolean(newcomer.token), String(newcomerLogin.status));
    check(
      'a new artisan starts pending verification',
      (await db.user.findUnique({ where: { id: newcomer.id } }))?.status === 'PENDING_VERIFICATION',
    );
    const newcomerOnline = await call('PUT', '/geo/provider/availability', newcomer.token, {
      isAvailable: true,
      currentLat: pickup.lat,
      currentLng: pickup.lng,
    });
    check(
      'a pending artisan cannot go online',
      newcomerOnline.status === 403 && newcomerOnline.body?.code === 'ACCOUNT_NOT_VERIFIED',
      `${newcomerOnline.status} ${JSON.stringify(newcomerOnline.body).slice(0, 80)}`,
    );
    const newcomerAccept = await call('POST', `/missions/${missionId}/accept`, newcomer.token);
    check(
      'a pending artisan cannot accept a mission',
      newcomerAccept.status >= 400 && String(newcomerAccept.body?.error ?? '').includes('vérifié'),
      `${newcomerAccept.status} ${JSON.stringify(newcomerAccept.body).slice(0, 80)}`,
    );

    const admin = await db.user.create({
      data: {
        fullName: 'Lifecycle Admin',
        phoneNumber: `+999${stamp}`,
        email: `lifecycle-admin-${stamp}@example.invalid`,
        passwordHash: await hashPassword('Lifecycle#1'),
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
    createdUserIds.push(admin.id);
    const adminLogin = await call('POST', '/auth/login', undefined, {
      identifier: admin.email,
      password: 'Lifecycle#1',
    });
    const adminToken: string = adminLogin.body?.token;
    check('the admin signs in', Boolean(adminToken), String(adminLogin.status));

    const queue = await call('GET', '/admin/providers/pending', adminToken);
    const newcomerProfile = await db.providerProfile.findUnique({ where: { userId: newcomer.id } });
    check(
      'the pending artisan is in the admin queue with the documents',
      queue.status === 200 &&
        (queue.body?.data ?? []).some((p: any) => p.id === newcomerProfile?.id && p.documentsUrl?.length > 0),
    );
    const notAdmin = await call('PUT', `/admin/providers/${newcomerProfile?.id}/verify`, client.token, {
      approve: true,
    });
    check(
      'only an admin can verify an artisan',
      notAdmin.status >= 400 && notAdmin.status < 500,
      String(notAdmin.status),
    );

    const newcomerSocket = await open(newcomer.token);
    const decisions = collect(newcomerSocket, 'account:verification');
    const refuse = await call('PUT', `/admin/providers/${newcomerProfile?.id}/verify`, adminToken, {
      approve: false,
    });
    await sleep(300);
    check(
      'the admin refuses without having to give a reason',
      refuse.status === 200,
      JSON.stringify(refuse.body).slice(0, 100),
    );
    check(
      'the artisan is told once',
      decisions.count() === 1 && decisions.last()?.status === 'REJECTED' && decisions.last()?.note === null,
      `${decisions.count()} ${JSON.stringify(decisions.last())}`,
    );
    const rejectedMe = await call('GET', '/auth/me', newcomer.token);
    check('the refused artisan sees the refusal', rejectedMe.body?.data?.status === 'REJECTED');
    const stillBlocked = await call('PUT', '/geo/provider/availability', newcomer.token, {
      isAvailable: true,
      currentLat: pickup.lat,
      currentLng: pickup.lng,
    });
    check('a refused artisan cannot go online', stillBlocked.status === 403);

    const approve = await call('PUT', `/admin/providers/${newcomerProfile?.id}/verify`, adminToken, { approve: true });
    await sleep(300);
    check(
      'the admin approves the artisan',
      approve.status === 200 && decisions.count() === 2 && decisions.last()?.status === 'ACTIVE',
      `${approve.status} ${decisions.count()}`,
    );
    const approvedOnline = await call('PUT', '/geo/provider/availability', newcomer.token, {
      isAvailable: true,
      currentLat: pickup.lat + 5,
      currentLng: pickup.lng,
    });
    check('an approved artisan can go online', approvedOnline.status === 200, String(approvedOnline.status));
    await call('PUT', '/geo/provider/availability', newcomer.token, { isAvailable: false });

    // ---- Nobody nearby: no one is notified
    await call('PUT', '/geo/provider/availability', provider.token, { isAvailable: false });
    await call('PUT', '/geo/provider/availability', stranger.token, { isAvailable: false });
    const faraway = { ...request, pickupLat: 33.88, pickupLng: 10.1 }; // other artisans in the dev database are near Tunis
    const none = await call('POST', '/missions/request', client.token, faraway);
    if (none.body?.data?.mission?.id) missionIds.push(none.body.data.mission.id);
    check(
      'with nobody nearby the request reaches no artisan',
      none.body?.data?.notifiedProviderCount === 0,
      JSON.stringify(none.body).slice(0, 120),
    );
    if (none.body?.data?.mission?.id) {
      const strangerCancelled = collect(strangerSocket, 'mission:cancelled');
      const strangerWithdrawn = collect(strangerSocket, 'mission:offer_withdrawn');
      const clientCancelled = collect(clientSocket, 'mission:cancelled');
      const cancel = await call('POST', `/missions/${none.body.data.mission.id}/cancel`, client.token, {
        reason: 'test',
      });
      check('client cancels a search', cancel.status === 200, JSON.stringify(cancel.body).slice(0, 100));
      await sleep(400);
      check(
        'a cancelled search is not announced to other artisans as a cancellation, only withdrawn',
        strangerCancelled.count() === 0 && strangerWithdrawn.count() === 1,
        `${strangerCancelled.count()}/${strangerWithdrawn.count()}`,
      );
      check(
        'the cancellation reaches its author once and says who cancelled',
        clientCancelled.count() === 1 && clientCancelled.last()?.cancelledBy === 'CLIENT',
        `${clientCancelled.count()} ${clientCancelled.last()?.cancelledBy}`,
      );
    }

    // ---- Rules added while cleaning the server up
    const token = 'ExponentPushToken[lifecycle-test]';
    await call('PUT', '/users/profile', client.token, { pushToken: token });
    const stored = await db.user.findUnique({ where: { id: client.id }, select: { pushToken: true } });
    check('the phone push token is saved from the profile update', stored?.pushToken === token);

    const resetOngoing = await call('POST', `/missions/${missionId}/relaunch`, client.token);
    check('a finished mission cannot be relaunched', resetOngoing.status === 400, String(resetOngoing.status));
    const foreignDispute = await call('POST', '/disputes', stranger.token, { missionId, reason: 'Not my mission' });
    check('only the people of a mission can report it', foreignDispute.status === 400, String(foreignDispute.status));
    const negativeTopup = await call('POST', '/wallet/topup', provider.token, {
      amount: -500,
      receiptPhotoUrl: 'https://x.invalid/r.jpg',
    });
    check('a negative top-up is refused', negativeTopup.status === 400, String(negativeTopup.status));
    const anonymousProfile = await call('GET', `/geo/providers/${provider.id}/profile`);
    check(
      'an artisan profile needs a signed-in user',
      anonymousProfile.status === 401,
      String(anonymousProfile.status),
    );
    const seenProfile = await call('GET', `/geo/providers/${provider.id}/profile`, client.token);
    check(
      'the artisan profile hides e-mail and phone',
      seenProfile.status === 200 &&
        !('email' in (seenProfile.body?.data?.user ?? {})) &&
        !('phoneNumber' in (seenProfile.body?.data?.user ?? {})),
      String(seenProfile.status),
    );
    const clientOnAdmin = await call('GET', '/admin/stats', client.token);
    check('the admin portal refuses a client', clientOnAdmin.status === 403, String(clientOnAdmin.status));

    // ---- Changing the e-mail address needs a code sent to the new address
    const newEmail = `lifecycle-new-${stamp}@example.invalid`;
    const sameEmail = await call('POST', '/users/email/request-change', client.token, { email: client.email });
    check('changing to the current address is refused', sameEmail.status === 400, String(sameEmail.status));
    const takenEmail = await call('POST', '/users/email/request-change', client.token, { email: provider.email });
    check('changing to an address of another account is refused', takenEmail.status === 409, String(takenEmail.status));
    const direct = await call('PUT', '/users/profile', client.token, { email: newEmail, phoneNumber: '+21611111111' });
    const afterDirect = await db.user.findUnique({ where: { id: client.id } });
    check(
      'the profile update cannot change the e-mail or the phone number',
      direct.status === 200 && afterDirect?.email === client.email && afterDirect?.phoneNumber !== '+21611111111',
    );
    const asked = await call('POST', '/users/email/request-change', client.token, { email: newEmail });
    check(
      'a code is sent to the new address',
      asked.status === 200 && /^\d{6}$/.test(asked.body?.code ?? ''),
      String(asked.status),
    );
    const again = await call('POST', '/users/email/request-change', client.token, { email: newEmail });
    check('a second code cannot be requested at once', again.status === 429, String(again.status));
    const wrong = await call('POST', '/users/email/confirm-change', client.token, { email: newEmail, code: '000000' });
    check('a wrong code does not change the address', wrong.status === 400, String(wrong.status));
    const elsewhere = await call('POST', '/users/email/confirm-change', stranger.token, {
      email: newEmail,
      code: asked.body?.code,
    });
    check('the code works only for the account that asked', elsewhere.status === 400, String(elsewhere.status));
    const confirmed = await call('POST', '/users/email/confirm-change', client.token, {
      email: newEmail,
      code: asked.body?.code,
    });
    check(
      'the right code changes the address',
      confirmed.status === 200 && confirmed.body?.data?.email === newEmail,
      String(confirmed.status),
    );
    const replay = await call('POST', '/users/email/confirm-change', client.token, {
      email: newEmail,
      code: asked.body?.code,
    });
    check('a code works once', replay.status === 400, String(replay.status));
    const loginNew = await call('POST', '/auth/login', undefined, { identifier: newEmail, password: 'Lifecycle#1' });
    check('the new address can sign in', loginNew.status === 200, String(loginNew.status));

    // ---- Sessions: short access token, one-use refresh token, blocked accounts cut off
    const signIn = await call('POST', '/auth/login', undefined, {
      identifier: stranger.email,
      password: 'Lifecycle#1',
    });
    const refreshToken: string = signIn.body?.refreshToken;
    check('login returns an access token and a refresh token', Boolean(signIn.body?.token && refreshToken));
    const asAccess = await call('GET', '/auth/me', refreshToken);
    check('a refresh token cannot be used as an access token', asAccess.status === 401, String(asAccess.status));
    const renewed = await call('POST', '/auth/refresh', undefined, { refreshToken });
    check(
      'a refresh token renews the session',
      renewed.status === 200 && Boolean(renewed.body?.token),
      String(renewed.status),
    );
    const replayed = await call('POST', '/auth/refresh', undefined, { refreshToken });
    check('a refresh token works only once', replayed.status === 401, String(replayed.status));
    const garbage = await call('POST', '/auth/refresh', undefined, { refreshToken: 'not-a-token' });
    check('a made-up refresh token is refused', garbage.status === 401, String(garbage.status));
    const blockIt = await call('PUT', `/admin/users/${stranger.id}/status`, adminToken, { status: 'BLOCKED' });
    const blockedMe = await call('GET', '/auth/me', renewed.body?.token);
    check(
      'a blocked account is cut off at once',
      blockIt.status === 200 && blockedMe.status === 401,
      String(blockedMe.status),
    );
    const blockedRefresh = await call('POST', '/auth/refresh', undefined, { refreshToken: renewed.body?.refreshToken });
    check('a blocked account cannot renew its session', blockedRefresh.status === 401, String(blockedRefresh.status));
    await call('PUT', `/admin/users/${stranger.id}/status`, adminToken, { status: 'ACTIVE' });

    // ---- A person deletes their own account
    const leaverRow = await db.user.create({
      data: {
        fullName: 'Lifecycle Leaver',
        phoneNumber: `+997${stamp}`,
        email: `lifecycle-leaver-${stamp}@example.invalid`,
        passwordHash: await hashPassword('Lifecycle#1'),
        role: 'CLIENT',
        status: 'ACTIVE',
        pushToken: 'ExponentPushToken[leaver]',
        clientProfile: { create: { defaultAddress: 'Somewhere 1' } },
      },
    });
    createdUserIds.push(leaverRow.id);
    const leaverLogin = await call('POST', '/auth/login', undefined, {
      identifier: leaverRow.email!,
      password: 'Lifecycle#1',
    });
    const wrongPassword = await call('DELETE', '/users/me', leaverLogin.body?.token, { password: 'not-the-password' });
    check('deleting an account needs the right password', wrongPassword.status === 400, String(wrongPassword.status));
    const leaverMission = await call('POST', '/missions/request', leaverLogin.body?.token, {
      categoryId: category.id,
      pickupLat: pickup.lat,
      pickupLng: pickup.lng,
      addressText: 'Somewhere 1',
    });
    const refusedOpen = await call('DELETE', '/users/me', leaverLogin.body?.token, { password: 'Lifecycle#1' });
    check('an account with an open request cannot be deleted', refusedOpen.status === 400, String(refusedOpen.status));
    if (leaverMission.body?.data?.mission?.id) {
      missionIds.push(leaverMission.body.data.mission.id);
      await call('POST', `/missions/${leaverMission.body.data.mission.id}/cancel`, leaverLogin.body?.token, {
        reason: 'test',
      });
    }
    const deleted = await call('DELETE', '/users/me', leaverLogin.body?.token, { password: 'Lifecycle#1' });
    check('the owner can delete the account', deleted.status === 200, String(deleted.status));
    const erased = await db.user.findUnique({ where: { id: leaverRow.id }, include: { clientProfile: true } });
    check(
      'personal data is erased',
      erased?.fullName === 'Compte supprimé' &&
        erased.email === null &&
        erased.pushToken === null &&
        !erased.phoneNumber.startsWith('+997') &&
        erased.clientProfile?.defaultAddress === null,
    );
    const signInAgain = await call('POST', '/auth/login', undefined, {
      identifier: leaverRow.email!,
      password: 'Lifecycle#1',
    });
    check('a deleted account cannot sign in again', signInAgain.status === 401, String(signInAgain.status));
    const oldToken = await call('GET', '/auth/me', leaverLogin.body?.token);
    check('its old session stops working', oldToken.status === 401, String(oldToken.status));

    // ---- Uploads are judged by their content, not by the type the client declares
    const PNG_1PX = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64',
    );
    const upload = async (path: string, content: Buffer, filename: string, mime: string, token?: string) => {
      const boundary = '----el7al' + Date.now();
      const head = Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mime}\r\n\r\n`,
      );
      const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/uploads${path}`,
        payload: Buffer.concat([head, content, tail]),
        headers: {
          'content-type': `multipart/form-data; boundary=${boundary}`,
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      });
      return { status: res.statusCode, body: res.json() };
    };
    const fakeImage = await upload(
      '/avatar',
      Buffer.from('<script>alert(1)</script>'),
      'a.png',
      'image/png',
      client.token,
    );
    check(
      'an upload declared as an image but with other content is refused',
      fakeImage.status === 400,
      String(fakeImage.status),
    );
    const pdfAsAvatar = await upload('/avatar', Buffer.from('%PDF-1.4 test'), 'a.png', 'image/png', client.token);
    check('a PDF is refused where only images are accepted', pdfAsAvatar.status === 400, String(pdfAsAvatar.status));
    const noAuth = await upload('/avatar', PNG_1PX, 'a.png', 'image/png');
    check('an upload needs a signed-in user', noAuth.status === 401, String(noAuth.status));
    const realImage = await upload('/avatar', PNG_1PX, 'photo.html', 'image/png', client.token);
    check(
      'a real image is accepted and stored with a safe extension',
      realImage.status === 201 && String(realImage.body?.url).endsWith('.png'),
      String(realImage.status),
    );
    await deleteStoredFile(realImage.body?.url);
    // The identity photo is uploaded while registering, before any login exists.
    const anonymousId = await upload('/document', PNG_1PX, 'cin.png', 'image/png');
    check(
      'an identity photo can be uploaded before the account exists',
      anonymousId.status === 201,
      String(anonymousId.status),
    );
    await deleteStoredFile(anonymousId.body?.url);
    const anonymousFake = await upload('/document', Buffer.from('not an image'), 'cin.png', 'image/png');
    check(
      'an anonymous upload is still checked by content',
      anonymousFake.status === 400,
      String(anonymousFake.status),
    );
    const anonymousReceipt = await upload('/receipt', PNG_1PX, 'r.png', 'image/png');
    check('receipts still need a signed-in user', anonymousReceipt.status === 401, String(anonymousReceipt.status));

    // A browser asks permission before sending PUT, PATCH or DELETE
    const preflight = await app.inject({
      method: 'OPTIONS',
      url: '/api/v1/users/profile',
      headers: { origin: 'https://el7al.tn', 'access-control-request-method': 'PUT' },
    });
    const allowedMethods = String(preflight.headers['access-control-allow-methods'] ?? '');
    check(
      'the browser preflight allows PUT, PATCH and DELETE',
      ['PUT', 'PATCH', 'DELETE'].every((m) => allowedMethods.includes(m)),
      allowedMethods,
    );

    // ---- Money amounts reach the dashboards as plain values, not as library objects
    const adminUsers = await call('GET', '/admin/users', adminToken);
    const artisanRow = (adminUsers.body?.data ?? []).find((u: any) => u.providerProfile);
    check(
      'a wallet balance in the admin list is a plain value',
      typeof artisanRow?.providerProfile?.walletBalance === 'string' ||
        typeof artisanRow?.providerProfile?.walletBalance === 'number',
      JSON.stringify(artisanRow?.providerProfile?.walletBalance),
    );

    // ---- Admins are alerted about a new artisan, and the revenue figures follow the completed jobs
    const adminSocket = await open(adminToken);
    const alerts = collect(adminSocket, 'admin:artisan_pending');
    const artisanSocketAlerts = collect(strangerSocket, 'admin:artisan_pending');
    await publish('provider.registered', {
      providerId: 'lifecycle-alert',
      fullName: 'Alerte Test',
      createdAt: new Date(),
    });
    await sleep(300);
    check(
      'admins are alerted once when an artisan registers',
      alerts.count() === 1 && alerts.last()?.fullName === 'Alerte Test',
      String(alerts.count()),
    );
    check(
      'artisans do not receive the admin alert',
      artisanSocketAlerts.count() === 0,
      String(artisanSocketAlerts.count()),
    );
    const figures = await call('GET', '/admin/stats', adminToken);
    const completedCount = await db.mission.count({ where: { status: 'COMPLETED' } });
    check(
      'revenue is one fixed fee per completed intervention',
      figures.body?.data?.totalCommissionsCollectedTND === completedCount * 30 &&
        typeof figures.body?.data?.revenueMonthTND === 'number' &&
        typeof figures.body?.data?.pendingVerifications === 'number',
      JSON.stringify(figures.body?.data).slice(0, 160),
    );

    // ---- Errors and health look clean from outside
    const nowhere = await call('GET', '/does-not-exist');
    check(
      'an unknown route answers a clean 404',
      nowhere.status === 404 && nowhere.body?.success === false,
      String(nowhere.status),
    );
    const health = await app.inject({ method: 'GET', url: '/api/v1/health' });
    check(
      'the health check answers ok with the database connected',
      health.statusCode === 200 && health.json().database === 'connected',
    );
    const badBody = await call('POST', '/auth/login', undefined, { identifier: 1 });
    check(
      'a malformed request answers a clear 400, no stack trace',
      badBody.status === 400 && !JSON.stringify(badBody.body).includes('at '),
      String(badBody.status),
    );

    // ---- Rate limiting on login
    let limited = 0;
    for (let i = 0; i < 13; i++) {
      const r = await call('POST', '/auth/login', undefined, {
        identifier: 'nobody@example.invalid',
        password: 'nope',
      });
      if (r.status === 429) limited++;
    }
    check('login is rate limited', limited >= 1);
  } finally {
    sockets.forEach((s) => s.close());
    await sleep(100);
    if (missionIds.length) {
      await db.chatMessage.deleteMany({ where: { missionId: { in: missionIds } } });
      await db.review.deleteMany({ where: { missionId: { in: missionIds } } });
      await db.mission.deleteMany({ where: { id: { in: missionIds } } });
    }
    for (const id of createdUserIds) await db.user.delete({ where: { id } }).catch(() => undefined);
    const failed = results.filter((r) => !r.ok);
    console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
    await app.close();
    await db.$disconnect();
    redis.disconnect();
    process.exit(failed.length ? 1 : 0);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
