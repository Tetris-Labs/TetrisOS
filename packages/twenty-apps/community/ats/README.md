# ATS — Applicant Tracking System for Twenty CRM

A minimal ATS that turns Twenty into a hiring workspace. Adds two new objects (Position, Application) and extends Person with a relation to Applications so one candidate can apply to many roles without duplicating their profile.

## What's in V1

- **Position** object: title, department, location, employment type, JD, status, opened/closed dates, hiring manager relation
- **Application** object: the join between a candidate (Person) and a Position, holding stage, source, applied date, rating, disqualify reason, notes, plus an auto-composed display label
- **Pipeline stages**: Applied → Phone Screen → Interview → Offer → Hired, plus Disqualified as a parallel terminal
- **Views**: All Positions (table), All Applications (table), Active Applications (table, excludes Hired + Disqualified)
- **Logic function** `set-application-display-label`: auto-composes each application's title as `"{candidate name} — {position name}"` on create and update
- **Role** `ats-recruiter`: full read/write on all workspace records

## ⚠️ Required post-install step: `./setup-search.sh`

Twenty's SDK does not expose `isSearchable` for custom objects, and the metadata API doesn't accept it either. Without flipping it, Twenty's relation pickers (e.g., the Position picker on an Application form) return "no results" even when records exist — the picker uses the global `search` GraphQL endpoint, which only queries searchable objects.

After every fresh install or reinstall, run:

```bash
cd packages/twenty-apps/community/ats
./setup-search.sh
```

This script:
1. Sets `isSearchable=true` on `jobPosition` and `application` via direct SQL
2. Backfills `searchVector` for existing records
3. Adds Postgres triggers so future inserts/updates auto-populate `searchVector`
4. Flushes Twenty's Redis cache

Safe to re-run (idempotent). The post-install logic function will warn loudly in the worker logs (`docker logs twenty-worker-1`) if you forget.

**File a Twenty SDK issue upstream** to expose `isSearchable` through `defineObject` so apps can ship without this dance.

## Kanban views (post-install step)

**The SDK does not currently expose kanban `mainGroupBy` configuration through the app manifest.** After installing the app, create kanban views manually through the Twenty UI:

1. **Pipeline** kanban: open the All Applications view, click the view switcher → "+", pick `Kanban`, group by **Stage**. This is your per-position pipeline board (filter by position to get a per-role kanban).
2. **Positions by Department** kanban (optional): on All Positions, add a kanban view grouped by **Department**.

This takes about 30 seconds total. It is the one meaningful manual configuration step V1 asks of you.

## Installing / Upgrading

### First install

```bash
cd packages/twenty-apps/community/ats
yarn install
./node_modules/.bin/twenty deploy
```

Then install the app via the metadata GraphQL:

```bash
curl -s http://localhost:8080/metadata \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"query": "mutation { installApplication(appRegistrationId: \"<appRegistrationId>\") }"}'
```

Get the `appRegistrationId` from `core.applicationRegistration`:
```sql
SELECT id FROM core."applicationRegistration"
WHERE "universalIdentifier" = '12090ba2-9689-4d84-9fee-a500765478a0';
```

### Upgrades (preserve data)

1. Bump `version` in `package.json` (must be strictly higher semver).
2. Run `./node_modules/.bin/twenty deploy`.
3. Run the same `installApplication` mutation. This **upserts** — data is preserved.

The Twenty UI's "Upgrade" button only works for NPM-published apps, not tarball installs. Always use the mutation.

## ⚠️ Do NOT uninstall with live data

`uninstallApplication` cascade-deletes every record owned by this app — every Position and every Application. There is no built-in undo. To change or upgrade the app, always use `installApplication` (which upserts and preserves records), never `uninstallApplication` followed by a reinstall.

Back up Position and Application tables with `pg_dump` before any risky schema change.

## UUID immutability

Every `universalIdentifier` in `src/constants.ts` and every SELECT option `id` (including the six stage UUIDs) is a stable identifier. **Never change a UUID after `0.0.1` is deployed.** Twenty treats a changed UUID as a new entity and orphans existing records. Add new UUIDs for new things; do not edit existing ones.

## Architecture in one diagram

```
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│     Position     │ 1────< │   Application    │ >────1 │  Person (core)   │
│ (new object)     │        │  (new object)    │        │  extended with   │
│                  │        │                  │        │  applications    │
│ - name           │        │ - displayLabel   │        │  ONE_TO_MANY     │
│ - department     │        │ - stage          │        │                  │
│ - JD             │        │ - source         │        │ (linkedinLink,   │
│ - status         │        │ - appliedAt      │        │  jobTitle, etc.  │
│ - hiringManager  │        │ - rating         │        │  already exist   │
│   ↓              │        │ - disqualify     │        │  on core Person) │
│ WorkspaceMember  │        │ - notes          │        │                  │
└──────────────────┘        └──────────────────┘        └──────────────────┘
                                     ▲
                                     │ triggers on create/update
                            ┌──────────────────────────┐
                            │ set-application-         │
                            │   display-label          │
                            │ (logic function)         │
                            └──────────────────────────┘
```

## Development

```bash
yarn install
yarn test           # runs vitest on the display-label logic function unit tests
yarn lint
yarn lint:fix
```

## Known V1 limitations (tracked for V1.1+)

- **No duplicate-Application guard.** Nothing prevents adding the same Person to the same Position twice. Add a pre-save database-event check in V1.1.
- **Position closed does not auto-resolve in-flight applications.** Recruiter must manually disqualify or hire each. Add a UI banner in V1.1.
- **No public apply URL.** Candidate intake is manual only. V1.5+.
- **No per-position stage customization.** The 6 global stages are shared across all positions. V2.
- **No scorecards.** Rating SELECT + per-application notes cover the 80% case.

## License

MIT
