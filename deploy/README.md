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
`deploy/backup.sh` saves the database (a checked dump) and the uploaded files (identity documents, receipts, avatars) to `/var/backups/el7al`, and keeps 14 days. Schedule it and **copy the files off the server** (set `BACKUP_RSYNC_TARGET` to another machine, or download them regularly):
```
chmod +x /opt/el7al/deploy/backup.sh /opt/el7al/deploy/restore-test.sh
crontab -e        # add:  0 3 * * *  /opt/el7al/deploy/backup.sh >> /var/log/el7al-backup.log 2>&1
/opt/el7al/deploy/backup.sh              # run once now
/opt/el7al/deploy/restore-test.sh        # proves the newest backup restores (uses a scratch database)
```
To restore for real after a disaster: start the stack, then `docker compose -f deploy/docker-compose.prod.yml exec -T postgres pg_restore -U el7al -d el7al_db --clean --if-exists < /var/backups/el7al/el7al-<stamp>.dump`, and unpack the files archive into the `el7al_miniodata` volume.

## Monitoring
- **Uptime:** the `Uptime` GitHub workflow checks the web app, the API health and the three certificates every 15 minutes from outside the server and fails (GitHub e-mails you) when something is wrong. An external service such as UptimeRobot on `https://api.<domain>/api/v1/health` is a good second opinion.
- **Errors (Sentry):** create two projects at sentry.io (Node.js for the API, React for the web) and one React Native project for the mobile app. Put the DSNs in `deploy/.env` as `SENTRY_DSN_BACKEND` and `SENTRY_DSN_WEB`, and the mobile DSN in the EAS build profile (`EXPO_PUBLIC_SENTRY_DSN` in `apps/mobile/eas.json`). Rebuild with the update command. Reports carry the error, the route and the user id only: no request bodies, headers, passwords or query strings. Empty DSN = reporting off.

## Server access
- **Admin password:** `docker compose -f deploy/docker-compose.prod.yml exec backend node dist/scripts/reset-admin-password.js <admin e-mail> "<new password, 12+ characters>"`. The admin account is the same for the web and the mobile app.
- **SSH:** use your own key, then turn off password login. Add your public key to `~/.ssh/authorized_keys`, open a **second** terminal and confirm the key login works, and only then create `/etc/ssh/sshd_config.d/99-hardening.conf` with `PasswordAuthentication no`, `PermitRootLogin prohibit-password`, `PubkeyAuthentication yes` and run `sshd -t && systemctl reload ssh`. Keep the first terminal open until the second one has connected. `apt install fail2ban` blocks repeated guesses.

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
- [ ] A restore of a backup was tried at least once (`restore-test.sh`).
- [ ] Uptime monitoring and error reporting (Sentry) are set up.
- [ ] Map tiles/routing: the free OpenStreetMap services are for light use; switch to a provider with a key for traffic.
- [ ] Privacy policy and terms published (the app stores require them: it uses location and phone numbers).
