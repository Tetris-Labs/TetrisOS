#!/usr/bin/env bash
# One-time post-install fix for Twenty's relation-picker bug on custom objects.
#
# Why this exists:
#   Twenty's relation picker queries the global `search` GraphQL endpoint, which
#   only returns records whose object has `isSearchable=true` AND a populated
#   `searchVector` column. Custom objects shipped from apps default both to off,
#   and the SDK / metadata API does NOT expose either setting. Without this
#   script, every "pick a Position" / "pick a Candidate" picker returns
#   "no results" even though the data is there.
#
# What this does:
#   1. Flips `isSearchable=true` on the `jobPosition` and `application` objects
#   2. Backfills `searchVector` for existing records
#   3. Adds Postgres triggers so future inserts/updates auto-populate searchVector
#
# Run after every fresh install or reinstall (idempotent — safe to re-run).

set -euo pipefail

DB_CONTAINER="${ATS_DB_CONTAINER:-twenty-db-1}"
DB_USER="${ATS_DB_USER:-postgres}"
DB_NAME="${ATS_DB_NAME:-default}"

# Auto-detect the workspace schema (Twenty creates one schema per workspace,
# named workspace_<id>). For multi-workspace installs, pass ATS_WORKSPACE_SCHEMA
# explicitly.
if [ -z "${ATS_WORKSPACE_SCHEMA:-}" ]; then
  ATS_WORKSPACE_SCHEMA=$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -A -c \
    "SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'workspace_%' LIMIT 1;")
fi

if [ -z "$ATS_WORKSPACE_SCHEMA" ]; then
  echo "ERROR: could not auto-detect workspace schema. Set ATS_WORKSPACE_SCHEMA env var." >&2
  exit 1
fi

echo "Using workspace schema: $ATS_WORKSPACE_SCHEMA"

docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" <<SQL
-- 1. Flip the metadata flag
UPDATE core."objectMetadata"
SET "isSearchable" = true
WHERE "nameSingular" IN ('jobPosition', 'jobApplication');

-- 2. Backfill searchVector for existing rows
UPDATE "$ATS_WORKSPACE_SCHEMA"."_jobPosition"
SET "searchVector" = to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(location, ''));

UPDATE "$ATS_WORKSPACE_SCHEMA"."_jobApplication"
SET "searchVector" = to_tsvector('simple', coalesce("displayLabel", '') || ' ' || coalesce(name, ''));

-- 3. Trigger to keep searchVector fresh for jobPosition
CREATE OR REPLACE FUNCTION "$ATS_WORKSPACE_SCHEMA".update_jobposition_search_vector()
RETURNS TRIGGER AS \$\$
BEGIN
  NEW."searchVector" := to_tsvector('simple', coalesce(NEW.name, '') || ' ' || coalesce(NEW.location, ''));
  RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS jobposition_search_vector_trigger ON "$ATS_WORKSPACE_SCHEMA"."_jobPosition";
CREATE TRIGGER jobposition_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "$ATS_WORKSPACE_SCHEMA"."_jobPosition"
  FOR EACH ROW EXECUTE FUNCTION "$ATS_WORKSPACE_SCHEMA".update_jobposition_search_vector();

-- 4. Trigger to keep searchVector fresh for application
CREATE OR REPLACE FUNCTION "$ATS_WORKSPACE_SCHEMA".update_jobapplication_search_vector()
RETURNS TRIGGER AS \$\$
BEGIN
  NEW."searchVector" := to_tsvector('simple', coalesce(NEW."displayLabel", '') || ' ' || coalesce(NEW.name, ''));
  RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS jobapplication_search_vector_trigger ON "$ATS_WORKSPACE_SCHEMA"."_jobApplication";
CREATE TRIGGER jobapplication_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "$ATS_WORKSPACE_SCHEMA"."_jobApplication"
  FOR EACH ROW EXECUTE FUNCTION "$ATS_WORKSPACE_SCHEMA".update_jobapplication_search_vector();

-- Verify
SELECT "nameSingular", "isSearchable" FROM core."objectMetadata"
WHERE "nameSingular" IN ('jobPosition', 'jobApplication');
SQL

# Flush Twenty's Redis cache so the workspace re-reads the metadata change
echo "Flushing Twenty Redis cache..."
docker exec "${ATS_REDIS_CONTAINER:-twenty-redis-1}" redis-cli FLUSHALL > /dev/null

echo ""
echo "Done. Reload the Twenty UI; the Position picker on Application records will now find your positions."
