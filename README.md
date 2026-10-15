# El 7al

Real-time marketplace that connects clients with nearby artisans (electricians, mechanics, plumbers...) in Tunisia.
One repository, three apps and one shared package.

| Folder | What | Run |
|---|---|---|
| `apps/backend` | REST API + Socket.IO (Fastify, Prisma, PostgreSQL/PostGIS, Redis, MinIO) | `npm run dev:backend` |
| `apps/web` | Web app for clients, artisans and admins (React, Vite, Tailwind) | `npm run dev:web` |
| `apps/mobile` | Mobile app for clients and artisans (Expo, React Native) | `npm run dev:mobile` |
| `packages/shared` | Types shared by the apps | `npm run build:shared` |

Read next: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) (how the code is organised and the rules that keep it clean),
[docs/API_CONTRACT.md](./docs/API_CONTRACT.md) (every endpoint and real-time event),
[deploy/README.md](./deploy/README.md) (putting it on a server), [.agents/AGENTS.md](./.agents/AGENTS.md) (rules for AI assistants).

## First run
```
npm install
npm run docker:up           # PostgreSQL, Redis, MinIO
npm run build:shared
cp apps/backend/.env.example apps/backend/.env      # then fill it in
cd apps/backend && npx prisma generate && npx prisma migrate deploy && cd ../..
npm run dev:backend         # http://localhost:4000  (API docs: /docs)
npm run dev:web             # http://localhost:3000
npm run dev:mobile          # Expo
```

If your shell sets `NODE_ENV=production`, install with `npm install --include=dev`, otherwise the development tools are skipped.

## Quality gate
Every change must pass the same checks locally and in CI (`.github/workflows/ci.yml`):

| Command | What it checks |
|---|---|
| `npm run typecheck` | TypeScript in all apps (strict) |
| `npm run lint` | ESLint: errors fail; warnings are a counted debt that may not grow |
| `npm run test:lifecycle` | End-to-end server test: registration, requests, every mission step, who receives which event, security |
| `npm run build:web` / `build:backend` | The production builds |
| `npm run check` | All of the above except the lifecycle test |

`npm run format` formats the source with Prettier.
