#!/usr/bin/env bash
# Post-install fixup for the "All Candidates" kanban view.
#
# Why this exists:
#   The twenty-sdk ViewManifest (v0.9.0) does not expose
#   `mainGroupByFieldMetadataUniversalIdentifier`, so the manifest can declare
#   type=KANBAN and the stage viewGroups but cannot wire the group-by field to
#   the view row. Without this, the kanban renders with no columns.
#
# What this does:
#   UPDATEs core.view.mainGroupByFieldMetadataId to the stage field id for the
#   "All Candidates" view (matched by universalIdentifier) in the target
#   workspace.
#
# Run after every install/upgrade of the ATS app into a workspace (idempotent).
# Default targets the ops workspace; pass TARGET_WORKSPACE_ID to override.

set -euo pipefail

DB_CONTAINER="${ATS_DB_CONTAINER:-twenty-db-1}"
DB_USER="${ATS_DB_USER:-postgres}"
DB_NAME="${ATS_DB_NAME:-default}"

# ops workspace by default. Change via env var to target a different workspace.
TARGET_WORKSPACE_ID="${TARGET_WORKSPACE_ID:-a79acd45-9d8d-42a4-b383-36371deaa6cb}"

# These universalIdentifiers come from src/constants.ts
ALL_VIEW_UNIVERSAL_ID="215ccf8e-f06c-4910-8445-31195d6f8442"
STAGE_FIELD_UNIVERSAL_ID="b11eaa60-a316-4837-a60c-5b0e89b94d56"

echo "Setting mainGroupByFieldMetadataId on 'All Candidates' view in workspace $TARGET_WORKSPACE_ID..."

docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" <<SQL
UPDATE core.view
SET "mainGroupByFieldMetadataId" = (
  SELECT id FROM core."fieldMetadata"
  WHERE "universalIdentifier" = '$STAGE_FIELD_UNIVERSAL_ID'
    AND "workspaceId" = '$TARGET_WORKSPACE_ID'
)
WHERE "universalIdentifier" = '$ALL_VIEW_UNIVERSAL_ID'
  AND "workspaceId" = '$TARGET_WORKSPACE_ID';

-- Verify
SELECT id, name, type, "mainGroupByFieldMetadataId" IS NOT NULL AS group_by_set
FROM core.view
WHERE "universalIdentifier" = '$ALL_VIEW_UNIVERSAL_ID'
  AND "workspaceId" = '$TARGET_WORKSPACE_ID';
SQL

echo "Done."
