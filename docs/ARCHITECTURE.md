# Architecture

El 7al is a **modular monolith in a monorepo**. One backend serves a web app and a mobile app. This is deliberate:
a marketplace of this size (hundreds to a few thousand users) needs clear boundaries, not separate services.

```
apps/
  backend/   API + real-time server
  web/       React web app
  mobile/    Expo mobile app
packages/
  shared/    Types used by more than one app
docs/        This file and the API contract
deploy/      Production stack (Docker, Caddy, backups)
```

## The domains
Every marketplace of this kind is made of the same parts. Each one owns its data and its rules.

| Domain | Owns | Backend module |
|---|---|---|
| Identity | accounts, roles, email/phone checks, passwords | `auth`, `user` |
| Catalog | trades and categories | `admin` (to split out) |
| Matching | which artisans are offered a request (distance, availability) | `geo`, `mission` |
| Job lifecycle | the mission state machine | `mission` |
| Messaging | chat between the two people of a job | `websockets`, `mission` |
| Money | commission and the artisan balance (cash only for now) | `wallet` |
| Trust | reviews, disputes, artisan verification | `mission`, `dispute`, `admin` |
| Notifications | who is told what, through which channel | see "Notifications" below |

## Backend rules
1. **Routes are thin.** A route validates input, calls a service, returns the result. No database calls, no business rules.
2. **Services hold the rules** and know nothing about HTTP. The mission state machine lives in one place (`mission.service.ts`).
3. **Every input is validated** (Zod or JSON schema) and no secret ever leaves the server (`stripSecrets`).
4. **Real-time events are sent once, to the right people.** Use `participantRooms(...)` so a socket in several rooms receives an event once. Never emit to a room "just in case".
5. **Nobody is told about what they did themselves.**
6. **Money is stored exactly** (the dinar has 3 decimals) and every movement is a ledger entry with its method (`CASH` today, other methods later).
7. **Secrets and settings come from the environment**, checked at start (`config/security.ts`). Production refuses to start with unsafe settings.

## Client rules (web and mobile)
1. **Organise by feature, not by file type**: `features/<name>/{api, components, hooks, store}`. A feature exposes only what its `index.ts` exports.
2. **Pages are assemblies**: they compose components and call hooks. A page or component over ~200 lines must be split.
3. **Network calls live in `api/` files**, never inside components. Components never call `fetch`/`axios` themselves.
4. **One place per concern**: design tokens (colours, spacing) in the theme, texts in the translation files (French, Arabic, English, all three), shared widgets in `shared/ui`.
5. **No fake data, no emojis as icons, no raw hard-coded UI strings.**
6. Client state in Zustand stores; data that comes from the server should be refetched, not copied around.

## Notifications
One list decides who is told what; the server sends each event once and the apps only decide how to show it.
The list of events, receivers and where a tap leads is in [API_CONTRACT.md](./API_CONTRACT.md#socket-events).
When adding an event: add it to the contract, send it once with `participantRooms`, add a check to `npm run test:lifecycle`, add the text in the three languages.

## Quality gate
`npm run check` and the CI run the same things: strict TypeScript, ESLint (errors fail; warnings may not increase), builds, and the server lifecycle test.
A change that makes any of them worse is not finished.

## Where does X go?
| I am adding... | Put it in |
|---|---|
| A new endpoint | `apps/backend/src/modules/<domain>/` (route, service, schema) |
| A rule about missions | `apps/backend/src/modules/mission/mission.service.ts` |
| A real-time event | the service that changes the state, using `participantRooms`; then the contract and the lifecycle test |
| A screen | `apps/<app>/src/features/<feature>/` (web: `pages/` while features are being introduced) |
| A reusable button, input, modal | `shared/ui` (mobile) or `components/ui` (web) |
| A text shown to users | the translation files, in French, Arabic and English |
| A colour or spacing value | the theme tokens, never a raw value |
| A type used by two apps | `packages/shared` |

## Scaling path (when real usage asks for it, not before)
1. More server memory/CPU on the same machine.
2. Several API copies behind the proxy, with the Socket.IO Redis adapter.
3. Queues and the real-time gateway in their own processes.
Splitting into separate services is not planned.
