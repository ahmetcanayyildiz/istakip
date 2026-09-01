#!/usr/bin/env sh
# İşTakip local database backup.
#
# Usage:
#   SUPABASE_DB_URL='postgresql://...' sh scripts/backup-database.sh
#
# The connection string is read from the environment and is never written to
# disk, echoed, or committed. Output lands in ./backups, which is gitignored.

set -eu

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  cat >&2 <<'MSG'
SUPABASE_DB_URL is not set.

Get the pooler connection string from:
  Supabase Dashboard > Project Settings > Database > Connection string > URI

Then run (the leading space keeps it out of your shell history):
   SUPABASE_DB_URL='postgresql://...' sh scripts/backup-database.sh

Never commit this value and never paste it into a source file.
MSG
  exit 1
fi

BACKUP_DIR="$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)/backups"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$BACKUP_DIR"

echo "Writing backup set $STAMP to ./backups"

# Roles are dumped separately: Supabase manages them outside the schema dump.
npx --no-install supabase db dump --db-url "$SUPABASE_DB_URL" --role-only \
  -f "$BACKUP_DIR/${STAMP}_roles.sql"
npx --no-install supabase db dump --db-url "$SUPABASE_DB_URL" \
  -f "$BACKUP_DIR/${STAMP}_schema.sql"
npx --no-install supabase db dump --db-url "$SUPABASE_DB_URL" --data-only \
  -f "$BACKUP_DIR/${STAMP}_data.sql"

echo "Done:"
ls -la "$BACKUP_DIR" | grep "$STAMP"
echo
echo "Store these files outside the repository (encrypted drive or private storage)."
echo "They contain all customer, quote, job, expense and collection records."
