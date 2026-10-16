#!/bin/sh
# Proves that the latest backup can really be restored: loads it into a scratch database, counts the rows
# of the main tables, then removes the scratch database. The live database is never touched.
#   /opt/el7al/deploy/restore-test.sh
set -eu

HERE="$(cd "$(dirname "$0")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/el7al}"
PG_EXEC="${PG_EXEC:-docker compose -f $HERE/docker-compose.prod.yml exec -T postgres}"
DB_USER="${DB_USER:-el7al}"
SCRATCH="restore_check"

LATEST="$(ls -t "$BACKUP_DIR"/el7al-*.dump 2>/dev/null | head -n 1 || true)"
[ -n "$LATEST" ] || { echo "No backup found in $BACKUP_DIR. Run backup.sh first."; exit 1; }
echo "Restoring $LATEST into a scratch database..."

$PG_EXEC psql -U "$DB_USER" -d postgres -v ON_ERROR_STOP=1 \
  -c "DROP DATABASE IF EXISTS $SCRATCH;" -c "CREATE DATABASE $SCRATCH;" > /dev/null
trap '$PG_EXEC psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS '"$SCRATCH"';" > /dev/null' EXIT

$PG_EXEC pg_restore -U "$DB_USER" -d "$SCRATCH" --no-owner < "$LATEST"

for table in User Mission ChatMessage Review TopupTransaction Category; do
  count="$($PG_EXEC psql -U "$DB_USER" -d "$SCRATCH" -tAc "SELECT count(*) FROM \"$table\";")"
  echo "  $table: $count rows"
done
echo "Restore test passed."
