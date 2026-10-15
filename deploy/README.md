# Deploying El 7al on one VPS

One server runs everything: PostgreSQL, Redis, MinIO (uploaded files), the backend API, the web app and
Caddy (HTTPS). Only ports 80 and 443 are open to the internet. The mobile app talks to the same API.

## 1. Before you start
- A VPS (Ubuntu 22.04/24.04, 2 vCPU, 4 GB RAM is enough for ~100 simultaneous users) with Docker and the Compose plugin.
- A domain with **three A records** pointing at the VPS: `app.<domain>`, `api.<domain>`, `files.<domain>`.
- An SMTP account for the verification and password-reset e-mails (the server refuses to start without one).

## 2. Server setup (once)
```
sudo ufw allow 22 && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable
git clone <your repository> /opt/el7al && cd /opt/el7al
cp deploy/.env.example deploy/.env      # fill every value; generate secrets with: openssl rand -base64 32
```

## 3. Start
```
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env up -d --build
docker compose -f deploy/docker-compose.prod.yml logs -f backend     # wait for "El 7al API server running"
```
On first start the backend creates the tables, the service categories and the admin account from
`ADMIN_EMAIL` / `ADMIN_PASSWORD` (it never deletes data). Check:
- `https://api.<domain>/api/v1/health` shows `"database":"connected"`.
- `https://app.<domain>` loads; log in at `/admin` with the admin account.
- `https://api.<domain>/docs` and `/metrics` answer 404 from outside (by design).

## 4. Backups
`deploy/backup.sh` writes a compressed database dump (14 days kept). Schedule it and copy the dumps
elsewhere:  `0 3 * * * /opt/el7al/deploy/backup.sh`. Uploaded files live in the `miniodata` volume: back it up too.

## 5. Update
```
git pull
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env up -d --build
```
Tables are updated at start with `prisma migrate deploy`: versioned SQL files in apps/backend/prisma/migrations, applied once and in order. To change the schema, edit schema.prisma and run `npm run prisma:migrate --workspace=@el7al/backend -- --name what_changed`, then commit the new folder.

## 6. Mobile builds
Set the API address in `apps/mobile/eas.json` (`EXPO_PUBLIC_API_URL`, https only), then from `apps/mobile`:
```
npx eas build -p android --profile preview      # APK to test with
npx eas build -p ios --profile production       # needs an Apple Developer account
```
Push notifications additionally need an FCM key (Android) and an APNs key (iOS) added with `eas credentials`.

## 7. Checklist before real users
- [ ] Secrets are long and random; `deploy/.env` is not in git.
- [ ] The CSP header in `deploy/Caddyfile` is switched from Report-Only to enforced after a clean test.
- [ ] A restore of a backup was tried at least once.
- [ ] Uptime monitoring (e.g. a free ping of `/api/v1/health`) and error reporting are set up.
- [ ] Map tiles/routing: the free OpenStreetMap services are for light use; switch to a provider with a key for traffic.
- [ ] Privacy policy and terms published (the app stores require them: it uses location and phone numbers).
