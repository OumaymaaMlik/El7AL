# Caddy (HTTPS reverse proxy) with the built web app inside.  Build context: repository root.
FROM node:20-bookworm-slim AS web
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages packages
COPY apps apps
RUN npm ci --workspace=@el7al/web --no-audit --no-fund
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_SENTRY_DSN=
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
RUN npm run build --workspace=@el7al/web

FROM caddy:2-alpine
COPY --from=web /repo/apps/web/dist /srv/web
COPY deploy/Caddyfile /etc/caddy/Caddyfile
