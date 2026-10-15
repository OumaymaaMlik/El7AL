# El 7al: API contract

The single source of truth for the mobile and the web apps. Both talk to the same backend, so a
client on web can be served by an artisan on mobile (and the reverse). If you change an endpoint,
event or status, change this file in the same commit.

Base URL: `https://<api-host>/api/v1`. Sockets: `https://<api-host>` (Socket.IO, `websocket` transport).
Auth: `Authorization: Bearer <access token>` (valid 1 hour; login and sign-up also return a one-use `refreshToken`, valid 30 days, renewed with `POST /auth/refresh`; a blocked account gets 401 `ACCOUNT_BLOCKED`). Errors: `{ success: false, error: "<message>" }`. Rate limited per IP
(429 when exceeded).

## Mission lifecycle (the only flow, on web and mobile)

```
CLIENT                         SERVER                                ARTISAN
request ─────────────►  BROADCASTED  ──── mission:new_offer ──►  sees the offer (45 s to answer)
                              │  ◄──────────── accept ─────────  
                         ACCEPTED   ── mission:accepted ──►  both
                              │  ◄───────── start-route ───────  EN_ROUTE   (+ chat line, ETA)
                              │  ◄───────── arrived ───────────  ARRIVED
                              │  ◄───────── start-work ────────  IN_PROGRESS
                              │  ◄───────── dual-confirm ──────  DUAL_CONFIRM  (artisan: work finished)
confirm (dual-confirm) ─►  COMPLETED  ── mission:completed ──►  both
review ─────────────────►  mission:reviewed ───────────────────►  artisan
```
- Each step is allowed only from the previous state and only for the right person; repeating a step is a no-op.
- Either participant can `cancel` until `COMPLETED` (`CANCELLED`). Statuses are stored, so a reload shows the real state.
- Statuses: `CREATED, BROADCASTED, ACCEPTED, EN_ROUTE, ARRIVED, IN_PROGRESS, DUAL_CONFIRM, COMPLETED, CANCELLED`.
- Offers go only to available, active artisans of the category whose last known position is within the radius
  (default 25 km, at most 20). Nobody nearby means nobody is notified.

## Registration (email first, then the account)
1. `POST /auth/email/send-verification` `{ email, fullName? }` → emails a 6-digit code (returned as `code` only when `NODE_ENV != production`).
2. `POST /auth/email/verify` `{ email, code }` (5 attempts per code).
3. `POST /auth/register/client` `{ fullName, phoneNumber (+216 + 8 digits), email, password (≥ 8), defaultAddress? }`
   or `POST /auth/register/provider` `{ …, categoryIds[], bio?, radiusKm?, documentsUrl[]?, cinNumber? (8 digits), cinFrontUrl?, cinBackUrl?, licenseNumber?, vehicleType? (CAR|VAN|MOTO) }`.
   Refused unless that email was just verified. Clients are `ACTIVE`; artisans are `PENDING_VERIFICATION` until an admin approves them.

## REST endpoints
| | |
|---|---|
| **Auth** | `POST /auth/login {identifier,password}` · `POST /auth/refresh {refreshToken}` · `POST /auth/logout {refreshToken}` · `GET /auth/me` · `POST /auth/password/forgot, /password/reset` (e-mail code) |
| **Password reset** | `POST /auth/password/forgot {identifier}` → emailed code · `POST /auth/password/reset {identifier,code,newPassword}` |
| **Profile** | `GET /users/me` · `PUT /users/profile {fullName,defaultAddress,defaultLat,defaultLng,bio,avatarUrl,oldPassword,password,pushToken}` · `DELETE /users/me {password}` (erases personal data; refused while a job is open or commission is owed) · `POST /users/email/request-change {email}` then `POST /users/email/confirm-change {email,code}` (the code goes to the NEW address; the phone number cannot be changed by the user) |
| **Uploads** | `POST /uploads/document` · `/uploads/avatar` · `/uploads/receipt` (multipart `file`) → `{ url }` |
| **Categories** | `GET /categories` (public) |
| **Geo** | `PUT /geo/provider/availability {isAvailable,currentLat?,currentLng?}` · `PUT /geo/provider/location {lat,lng}` · `GET /geo/providers/:id/profile` (signed-in users, no e-mail or phone) · `PUT /geo/provider/settings` |
| **Missions** | `GET /missions/candidates?categoryId&pickupLat&pickupLng&radiusKm` · `POST /missions/request {categoryId,pickupLat,pickupLng,addressText,description?,radiusKm?,selectedProviderIds?}` · `POST /missions/:id/relaunch` · `POST /missions/:id/accept` · `…/start-route` · `…/arrived` · `…/start-work` · `…/dual-confirm` · `…/review {rating 1-5,comment?,amount?}` · `…/cancel {reason}` · `…/read` · `GET /missions/history?limit&cursor` → `{data, meta:{completedCount}}` (each mission has `unreadCount`, last 20 `messages`) · `GET /missions/:id` (participants/admin only) |
| **Disputes** | `POST /disputes {missionId,reason}` |
| **Wallet** | `POST /wallet/topup` · `GET /wallet/transactions` |
| **Admin** (ADMIN only) | `/admin/stats, /users, /users/:id (DELETE), /users/:id/status, /users/:id/missions, /providers/pending, /providers/:id/verify, /missions, /categories (CRUD), /topups/pending, /topups/:id/approve|reject, /disputes` |

`passwordHash` and `pushToken` are never returned.

## Socket events
Connect with `auth: { token }`; the server puts you in `user_<id>` (and `provider_<id>`, `providers` for artisans).
`join_room` is allowed only for `mission_<id>` of a mission you take part in (artisans may follow an open offer until it is accepted).

**Client → server:** `join_room "mission_<id>"` · `chat:send {missionId,content}` · `chat:read {missionId}` · `provider:location_update {lat,lng,missionId?}` (artisan) · `mission:view_offer {missionId}` · `mission:reject_offer {missionId}`

**Server → client**
| Event | Payload |
|---|---|
| `mission:new_offer` | `{missionId,categoryId,categoryName,addressText,description,clientName,clientAvatarUrl,commissionFee,pickupLat,pickupLng,createdAt}` |
| `mission:offer_dispatched` | `{missionId,count}` (to the client: how many artisans were asked) |
| `mission:offer_viewed` / `offer_rejected` | `{missionId,providerName,…}` |
| `mission:accepted` | `{missionId,clientUserId,providerUserId,clientName,provider:{id,fullName,phoneNumber,avatarUrl,ratingAverage}}` |
| `mission:taken` | `{missionId}` (to the other artisans, not to the one who accepted) |
| `mission:offer_withdrawn` | `{missionId}` (to artisans: the client cancelled a request nobody had accepted yet; the offer just disappears) |
| `mission:status_update` | `{missionId,status,message,providerName,chatMessage?, etaMinutes?,distanceKm?,startedAt?,providerConfirmed?,clientConfirmed?}` |
| `mission:completed` | `{missionId,status,completedAt,message,chatMessage?}` |
| `mission:cancelled` | `{missionId,reason,wasAccepted,cancelledBy:'CLIENT'\|'PROVIDER'}` (to the two participants only) |
| `mission:reviewed` | `{missionId,rating,comment,clientName,ratingAverage,totalRatings,amount}` (`comment` is exactly what the client wrote, `""` if nothing) |
| `mission:delay_alert` | `{missionId,message,etaMinutes,distanceKm}` (client; the artisan is 5 min or more later than announced) |
| `admin:artisan_pending` | `{providerId,fullName,createdAt}` (to admins only: an artisan finished registering and waits for the identity check; admins also get a push) |
| `account:verification` | `{status:'ACTIVE'\|'REJECTED',note}` (to one artisan: an admin approved the account, or refused it with a reason) |
| `location:stream` | `{providerId,lat,lng,distanceKm,etaMinutes,timestamp}` (artisan on the way; sent every few seconds) |
| `chat:receive` | message `{id,missionId,senderId,content,createdAt,isRead,senderName,senderAvatar,system?}` (`system: true` is the chat line of a status change: show it in the conversation, do not notify it as a message) |
| `chat:seen` | `{missionId,readerId,readAt}` |

**Delivery rules.** Every event is sent once per user (rooms are chained in one broadcast), only to the people concerned. Apps must not notify a person of an action they made themselves.

**Notifications worth showing** (and where a tap leads)
| Receiver | Event | Tap opens |
|---|---|---|
| Client | `accepted`, `status_update` EN_ROUTE / ARRIVED / DUAL_CONFIRM, `delay_alert` | tracking of that job |
| Client | `cancelled` by the artisan (`wasAccepted`) | home |
| Artisan | `new_offer` (pop-up) | home |
| Artisan | `cancelled` by the client (`wasAccepted`) · `completed` | home |
| Artisan | `reviewed` | a window with the rating and the comment |
| Artisan | `account:verification` (approved / refused with the reason) | home |
| Both | `chat:receive` (not `system`, not while that chat is open) | the chat of that job |

Push (Expo) is sent to the phone for the same events: new offer, accepted, en route, arrived, work finished, completed, cancelled, review, chat.

## Commission
Every completed mission charges the artisan a **fixed 30 TND**, taken automatically from their balance (`walletBalance`, which goes negative) in the same transaction as the client's final confirmation. Nobody has to approve it; repeating the confirmation never charges twice. Artisans are not held back by a negative balance unless `MAX_PROVIDER_DEBT_TND` is set (then they stop receiving offers beyond that debt).

## Artisan verification
A new artisan is `PENDING_VERIFICATION`: they can sign in and read their profile, but `PUT /geo/provider/availability {isAvailable:true}` and `POST /missions/:id/accept` answer 403 (`code: ACCOUNT_NOT_VERIFIED`). An admin works the queue:
`GET /admin/providers/pending` (documents come as time-limited links) then `PUT /admin/providers/:id/verify {approve, notes?}`. Refusing needs no reason (`notes`, up to 500 characters, is optional and shown to the artisan when given): the status becomes `REJECTED` and the artisan can still sign in but cannot go online or accept. Until an admin approves, a new artisan stays `PENDING_VERIFICATION` with the same limits. Revenue: an intervention both sides confirmed (`COMPLETED`, never cancelled) counts one fixed fee. Approving sets `ACTIVE`. Both send `account:verification` and a push.

## Rules both apps follow
- Phone: `+216` followed by exactly 8 digits. Password: at least 8 characters.
- The artisan app sends its real GPS (`PUT /geo/provider/availability` when going online, then `provider:location_update` / `PUT /geo/provider/location`) so offers reach it.
- Never trust the client for identity: senders, readers and artisans are taken from the token.
