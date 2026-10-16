#!/bin/sh
# Daily backup of the database and of the uploaded files (identity documents, receipts, avatars).
# Add to cron on the VPS, e.g.:  0 3 * * *  /opt/el7al/deploy/backup.sh >> /var/log/el7al-backup.log 2>&1
#
# Optional: set BACKUP_RSYNC_TARGET (e.g. user@other-server:/backups/el7al) to copy the files off this machine.
# A backup that only lives on the server it protects is not a backup.
set -eu

HERE="$(cd "$(dirname "$0")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/el7al}"
KEEP_DAYS="${KEEP_DAYS:-14}"
# How to run a command inside the database container. Overridable so the script can be tested elsewhere.
PG_EXEC="${PG_EXEC:-docker compose -f $HERE/docker-compose.prod.yml exec -T postgres}"
DB_USER="${DB_USER:-el7al}"
DB_NAME="${DB_NAME:-el7al_db}"
FILES_VOLUME="${FILES_VOLUME:-el7al_miniodata}"

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
DUMP="$BACKUP_DIR/el7al-$STAMP.dump"
FILES="$BACKUP_DIR/files-$STAMP.tar.gz"

# 1. Database. Written to a temporary name first so a failed run never leaves a broken "latest" backup.
$PG_EXEC pg_dump -U "$DB_USER" -d "$DB_NAME" --format=custom > "$DUMP.partial"
# The dump must be readable by pg_restore, otherwise it is worthless.
$PG_EXEC pg_restore --list < "$DUMP.partial" > /dev/null
mv "$DUMP.partial" "$DUMP"

# 2. Uploaded files (read-only mount of the storage volume).
docker run --rm -v "$FILES_VOLUME":/data:ro -v "$BACKUP_DIR":/backup alpine \
  tar czf "/backup/files-$STAMP.tar.gz.partial" -C /data .
mv "$FILES.partial" "$FILES"

# 3. Keep two weeks (configurable).
find "$BACKUP_DIR" \( -name 'el7al-*.dump' -o -name 'files-*.tar.gz' \) -mtime +"$KEEP_DAYS" -delete

# 4. Copy off the machine when a target is configured.
if [ -n "${BACKUP_RSYNC_TARGET:-}" ]; then
  rsync -a --delete-after "$BACKUP_DIR"/ "$BACKUP_RSYNC_TARGET"/
  echo "Copied to $BACKUP_RSYNC_TARGET"
fi

echo "Backup written: $DUMP ($(du -h "$DUMP" | cut -f1)), $FILES ($(du -h "$FILES" | cut -f1))"
