#!/bin/sh
# Daily database backup. Add to cron on the VPS, e.g.:  0 3 * * *  /opt/el7al/deploy/backup.sh
# Copy the files in $BACKUP_DIR off the server too (another machine or object storage).
set -eu
BACKUP_DIR="${BACKUP_DIR:-/var/backups/el7al}"
mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
docker compose -f "$(dirname "$0")/docker-compose.prod.yml" exec -T postgres \
  pg_dump -U el7al -d el7al_db --format=custom > "$BACKUP_DIR/el7al-$STAMP.dump"
# keep two weeks
find "$BACKUP_DIR" -name 'el7al-*.dump' -mtime +14 -delete
echo "Backup written: $BACKUP_DIR/el7al-$STAMP.dump"
