# Backend image. Build context is the repository root:  docker build -f apps/backend/Dockerfile .
FROM node:20-bookworm-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /repo
ENV NODE_ENV=production

# The repository may hold only some of the apps (web+backend, mobile+backend, or all three); the
# lockfile always matches what is present, so copy whatever exists and install just the backend.
COPY package.json package-lock.json ./
COPY packages packages
COPY apps apps
RUN npm ci --include=dev --workspace=@el7al/backend --workspace=@el7al/shared --no-audit --no-fund
RUN npm run build --workspace=@el7al/shared \
 && cd apps/backend && npx prisma generate && npm run build

WORKDIR /repo/apps/backend
EXPOSE 4000

# On start: create/update tables (never drops data), fill categories and the first admin if missing, run.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/scripts/bootstrap.js && node dist/server.js"]
