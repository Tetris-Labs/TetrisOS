# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Twenty is an open-source CRM built with modern technologies in a monorepo structure. The codebase is organized as an Nx workspace with multiple packages.

## Key Commands

### Development
```bash
# Start development environment (frontend + backend + worker)
yarn start

# Individual package development
npx nx start twenty-front     # Start frontend dev server
npx nx start twenty-server    # Start backend server
npx nx run twenty-server:worker  # Start background worker
```

### Testing
```bash
# Preferred: run a single test file (fast)
npx jest path/to/test.test.ts --config=packages/PROJECT/jest.config.mjs

# Run all tests for a package
npx nx test twenty-front      # Frontend unit tests
npx nx test twenty-server     # Backend unit tests
npx nx run twenty-server:test:integration:with-db-reset  # Integration tests with DB reset
# To run an indivual test or a pattern of tests, use the following command:
cd packages/{workspace} && npx jest "pattern or filename"

# Storybook
npx nx storybook:build twenty-front
npx nx storybook:test twenty-front

# When testing the UI end to end, click on "Continue with Email" and use the prefilled credentials.
```

### Code Quality
```bash
# Linting (diff with main - fastest, always prefer this)
npx nx lint:diff-with-main twenty-front
npx nx lint:diff-with-main twenty-server
npx nx lint:diff-with-main twenty-front --configuration=fix  # Auto-fix

# Linting (full project - slower, use only when needed)
npx nx lint twenty-front
npx nx lint twenty-server

# Type checking
npx nx typecheck twenty-front
npx nx typecheck twenty-server

# Format code
npx nx fmt twenty-front
npx nx fmt twenty-server
```

### Build
```bash
# Build packages (twenty-shared must be built first)
npx nx build twenty-shared
npx nx build twenty-front
npx nx build twenty-server
```

### Database Operations
```bash
# Database management
npx nx database:reset twenty-server         # Reset database
npx nx run twenty-server:database:init:prod # Initialize database
npx nx run twenty-server:database:migrate:prod # Run migrations

# Generate migration (replace [name] with kebab-case descriptive name)
npx nx run twenty-server:typeorm migration:generate src/database/typeorm/core/migrations/common/[name] -d src/database/typeorm/core/core.datasource.ts

# Sync metadata
npx nx run twenty-server:command workspace:sync-metadata
```

### Database Inspection (Postgres MCP)

A read-only Postgres MCP server is configured in `.mcp.json`. Use it to:
- Inspect workspace data, metadata, and object definitions while developing
- Verify migration results (columns, types, constraints) after running migrations
- Explore the multi-tenant schema structure (core, metadata, workspace-specific schemas)
- Debug issues by querying raw data to confirm whether a bug is frontend, backend, or data-level
- Inspect metadata tables to debug GraphQL schema generation or `workspace:sync-metadata` issues

This server is read-only — for write operations (reset, migrations, sync), use the CLI commands above.

### GraphQL
```bash
# Generate GraphQL types (run after schema changes)
npx nx run twenty-front:graphql:generate
npx nx run twenty-front:graphql:generate --configuration=metadata
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18, TypeScript, Jotai (state management), Linaria (styling), Vite
- **Backend**: NestJS, TypeORM, PostgreSQL, Redis, GraphQL (with GraphQL Yoga)
- **Monorepo**: Nx workspace managed with Yarn 4

### Package Structure
```
packages/
├── twenty-front/          # React frontend application
├── twenty-server/         # NestJS backend API
├── twenty-ui/             # Shared UI components library
├── twenty-shared/         # Common types and utilities
├── twenty-emails/         # Email templates with React Email
├── twenty-website/        # Next.js documentation website
├── twenty-zapier/         # Zapier integration
└── twenty-e2e-testing/    # Playwright E2E tests
```

### Key Development Principles
- **Functional components only** (no class components)
- **Named exports only** (no default exports)
- **Types over interfaces** (except when extending third-party interfaces)
- **String literals over enums** (except for GraphQL enums)
- **No 'any' type allowed** — strict TypeScript enforced
- **Event handlers preferred over useEffect** for state updates
- **Props down, events up** — unidirectional data flow
- **Composition over inheritance**
- **No abbreviations** in variable names (`user` not `u`, `fieldMetadata` not `fm`)

### Naming Conventions
- **Variables/functions**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE
- **Types/Classes**: PascalCase (suffix component props with `Props`, e.g. `ButtonProps`)
- **Files/directories**: kebab-case with descriptive suffixes (`.component.tsx`, `.service.ts`, `.entity.ts`, `.dto.ts`, `.module.ts`)
- **TypeScript generics**: descriptive names (`TData` not `T`)

### File Structure
- Components under 300 lines, services under 500 lines
- Components in their own directories with tests and stories
- Use `index.ts` barrel exports for clean imports
- Import order: external libraries first, then internal (`@/`), then relative

### Comments
- Use short-form comments (`//`), not JSDoc blocks
- Explain WHY (business logic), not WHAT
- Do not comment obvious code
- Multi-line comments use multiple `//` lines, not `/** */`

### State Management
- **Jotai** for global state: atoms for primitive state, selectors for derived state, atom families for dynamic collections
- Component-specific state with React hooks (`useState`, `useReducer` for complex logic)
- GraphQL cache managed by Apollo Client
- Use functional state updates: `setState(prev => prev + 1)`

### Backend Architecture
- **NestJS modules** for feature organization
- **TypeORM** for database ORM with PostgreSQL
- **GraphQL** API with code-first approach
- **Redis** for caching and session management
- **BullMQ** for background job processing

### Database & Migrations
- **PostgreSQL** as primary database
- **Redis** for caching and sessions
- **ClickHouse** for analytics (when enabled)
- Always generate migrations when changing entity files
- Migration names must be kebab-case (e.g. `add-agent-turn-evaluation`)
- Include both `up` and `down` logic in migrations
- Never delete or rewrite committed migrations

### Utility Helpers
Use existing helpers from `twenty-shared` instead of manual type guards:
- `isDefined()`, `isNonEmptyString()`, `isNonEmptyArray()`

## Development Workflow

IMPORTANT: Use Context7 for code generation, setup or configuration steps, or library/API documentation. Automatically use the Context7 MCP tools to resolve library IDs and get library docs without waiting for explicit requests.

### Before Making Changes
1. Always run linting (`lint:diff-with-main`) and type checking after code changes
2. Test changes with relevant test suites (prefer single-file test runs)
3. Ensure database migrations are generated for entity changes
4. Check that GraphQL schema changes are backward compatible
5. Run `graphql:generate` after any GraphQL schema changes

### Code Style Notes
- Use **Linaria** for styling with zero-runtime CSS-in-JS (styled-components pattern)
- Follow **Nx** workspace conventions for imports
- Use **Lingui** for internationalization
- Apply security first, then formatting (sanitize before format)

### Testing Strategy
- **Test behavior, not implementation** — focus on user perspective
- **Test pyramid**: 70% unit, 20% integration, 10% E2E
- Query by user-visible elements (text, roles, labels) over test IDs
- Use `@testing-library/user-event` for realistic interactions
- Descriptive test names: "should [behavior] when [condition]"
- Clear mocks between tests with `jest.clearAllMocks()`

## Dev Environment Setup

All dev environments (Claude Code web, Cursor, local) use one script:

```bash
bash packages/twenty-utils/setup-dev-env.sh
```

This handles everything: starts Postgres + Redis (auto-detects local services vs Docker), creates databases, and copies `.env` files. Idempotent — safe to run multiple times.

- `--docker` — force Docker mode (uses `packages/twenty-docker/docker-compose.dev.yml`)
- `--down` — stop services
- `--reset` — wipe data and restart fresh
- **Skip the setup script** for tasks that only read code — architecture questions, code review, documentation, etc.

**Note:** CI workflows (GitHub Actions) manage services via Actions service containers and run setup steps individually — they don't use this script.

## Important Files
- `nx.json` - Nx workspace configuration with task definitions
- `tsconfig.base.json` - Base TypeScript configuration
- `package.json` - Root package with workspace definitions
- `.cursor/rules/` - Detailed development guidelines and best practices

## CRM developer documentations (building apps, using api's, etc)

When building API routes or extending the application, automatically reference the relevant article below using Context7 or WebFetch before writing code.

### APIs
- **APIs overview** (authentication, Core API, Metadata API, REST vs GraphQL, rate limits, batch ops): https://docs.twenty.com/developers/extend/api

### Webhooks
- **Webhooks** (create/manage webhooks, events, payload format, validation, Node.js example): https://docs.twenty.com/developers/extend/webhooks

### Apps (building Twenty apps / logic functions)
- **Getting started** (scaffold app, prerequisites, project structure, key files, local dev server): https://docs.twenty.com/developers/extend/apps/getting-started
- **Building apps** (defineEntity functions, defineRole, defineApplication, defineObject, defineField, defineLogicFunction, definePreInstallLogicFunction, definePostInstallLogicFunction, defineFrontComponent, defineSkill, defineAgent, defineView, defineNavigationMenuItem, definePageLayout, typed API clients via twenty-client-sdk, testing, CLI reference, CI): https://docs.twenty.com/developers/extend/apps/building
- **Publishing apps** (build, deploy as tarball, share deployed app, publish to npm, marketplace metadata, installing apps): https://docs.twenty.com/developers/extend/apps/publishing

### App Deployment & Update Workflow (Tarball apps — our setup)

**Deploying a new version (without uninstalling):**
1. Bump `version` in `package.json` (must be strictly higher semver)
2. Run `./node_modules/.bin/twenty deploy` from the app directory — builds and uploads the tarball
3. Trigger install via GraphQL (the UI upgrade button only works for NPM apps, not tarball apps):
```bash
curl -s http://localhost:8080/metadata \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"query": "mutation { installApplication(appRegistrationId: \"<appRegistrationId>\") }"}'
```
- `appRegistrationId` is in `core."applicationRegistration"` table: `SELECT id FROM core."applicationRegistration" WHERE "universalIdentifier" = '<universalIdentifier>';`
- `API_KEY` — see workspace-specific API key sources below

**Getting API keys per workspace:**

- **ops** (`a79acd45-9d8d-42a4-b383-36371deaa6cb`): Use the key stored in `~/.twenty/config.json` (the Twenty CLI remote config). This is always valid and is what `twenty deploy` uses under the hood.
  ```bash
  cat ~/.twenty/config.json  # grab the "apiKey" field under "remotes.prod"
  ```
- **hatz** (`8234e383-bbbb-4c25-b102-3d18bdc99a76`): No pre-saved key file. Generate one from the DB using the APP_SECRET signing formula:
  ```bash
  # 1. Get an unrevoked API key ID for hatz
  docker exec twenty-db-1 psql -U postgres -d default -t -c \
    "SELECT id FROM core.\"apiKey\" WHERE \"workspaceId\" = '8234e383-bbbb-4c25-b102-3d18bdc99a76' AND \"revokedAt\" IS NULL AND \"expiresAt\" > NOW() LIMIT 1;"

  # 2. Generate a signed JWT (APP_SECRET from packages/twenty-docker/.env)
  node -e "
  const crypto = require('crypto');
  const APP_SECRET = 'tetrisOS_secret_key_2026_randomstring42';
  const workspaceId = '8234e383-bbbb-4c25-b102-3d18bdc99a76';
  const jti = '<API_KEY_ID_FROM_STEP_1>';
  const secret = crypto.createHash('sha256').update(APP_SECRET + workspaceId + 'API_KEY').digest('hex');
  const header = Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url');
  const now = Math.floor(Date.now()/1000);
  const payload = Buffer.from(JSON.stringify({sub:workspaceId,type:'API_KEY',workspaceId,iat:now,exp:now+86400*365,jti})).toString('base64url');
  const sig = crypto.createHmac('sha256',secret).update(header+'.'+payload).digest('base64url');
  console.log(header+'.'+payload+'.'+sig);
  "
  ```
  The signing formula is: `secret = sha256(APP_SECRET + workspaceId + "API_KEY")` — this is what the Twenty server uses internally (`jwt-wrapper.service.ts: generateAppSecret`).

- **Note:** `WORKSPACE_API_KEY` values in `core."applicationVariable"` are **encrypted** — they are not usable as auth tokens. Don't try to use them directly.

**App variables are preserved** on `installApplication` (it upserts, not recreates). Variables are only lost on `uninstallApplication` (cascade delete). Never uninstall unless you have the variable values backed up.

**Manually triggering a logic function:**
```bash
cd packages/twenty-apps/community/<app-name>
./node_modules/.bin/twenty exec -n <functionName> -p '{}'
```

**WORKSPACE_API_KEY requirement:** Any app that calls `updateWorkspaceMember` (or other mutations gated by the user-workspace pre-query hook) must have `WORKSPACE_API_KEY` set as an app variable (`isSecret=false`). App tokens carry an `applicationId` in auth context which fails the hook. Insert directly into DB if not set via UI:
```sql
INSERT INTO core."applicationVariable" (key, value, description, "isSecret", "applicationId")
VALUES ('WORKSPACE_API_KEY', '<jwt>', 'Workspace API key for updateWorkspaceMember', false, '<applicationId>');
```
Then flush Redis cache: `DEL engine:workspace:cache:application-variable:<workspaceId>:hash` and `:data`

### Full documentation index
- https://docs.twenty.com/llms.txt

## Multi-Workspace: Creating & Onboarding a New Workspace

This project runs Twenty in multi-workspace mode with wildcard subdomains on `tetrislabs.co`. Each workspace is accessed at `{subdomain}.tetrislabs.co`. Root `tetrislabs.co` is the marketing site on Vercel and stays untouched. Caddy (`*.tetrislabs.co` block) reverse-proxies all subdomains to the Twenty server on `:8080`.

### Env var split: `SERVER_URL` vs `FRONTEND_URL`
- `SERVER_URL=https://ops.tetrislabs.co` — API base. Baked at server runtime into `window._env_.REACT_APP_SERVER_BASE_URL` (see `generate-front-config.ts:14`). Must be a reachable URL (backend validates as URL at startup).
- `FRONTEND_URL=https://tetrislabs.co` — used by `DomainServerConfigService.getFrontUrl()` to derive workspace URLs as `{workspaceSubdomain}.tetrislabs.co`. Without it, workspace URLs nest under `SERVER_URL`'s host (e.g. `app.ops.tetrislabs.co`).
- Both must be listed in `docker-compose.yml` `environment:` for the server service — `.env` alone is insufficient.

### Workspace creation flow (gotchas)
1. Clicking "Create Workspace" calls `signUpInNewWorkspaceMutation`. The backend **auto-generates the subdomain from the user's email domain** (e.g. `harshil@tetrislabs.co` → subdomain `tetrislabs` → URL `tetrislabs.tetrislabs.co`). Onboarding has no UI to pick the subdomain.
2. Onboarding (`/create/workspace`) sets the `displayName`, then runs `activateWorkspace` — this does metadata creation (~2s), prefill, and seeding. Expect 5–15s of "stuck loading" with no progress indicator.
3. Change the subdomain **after** onboarding via Settings → Workspace, or directly in DB: `UPDATE core.workspace SET subdomain='<new>' WHERE id='<id>';` — then the workspace is reachable at `<new>.tetrislabs.co`.

### Fresh-install bugs to expect (and fixes)

**`commandMenuItem.engineComponentKey NOT NULL` violation during `activateWorkspace`** (on `prefillWorkflowCommandMenuItems`): seed code passes `null` but the column is `NOT NULL`. Fix the source in `packages/twenty-server/src/engine/workspace-manager/standard-objects-prefill-data/prefill-workflow-command-menu-items.ts` — set `engineComponentKey: 'TRIGGER_WORKFLOW_VERSION'`. For a running container, patch the compiled dist and restart:
```bash
docker exec twenty-server-1 sed -i "s/engineComponentKey: null,/engineComponentKey: 'TRIGGER_WORKFLOW_VERSION',/" /app/packages/twenty-server/dist/engine/workspace-manager/standard-objects-prefill-data/prefill-workflow-command-menu-items.js
docker exec twenty-worker-1 sed -i "s/engineComponentKey: null,/engineComponentKey: 'TRIGGER_WORKFLOW_VERSION',/" /app/packages/twenty-server/dist/engine/workspace-manager/standard-objects-prefill-data/prefill-workflow-command-menu-items.js
docker restart twenty-server-1 twenty-worker-1
```
If the activation already failed, delete the `PENDING_CREATION` row: `DELETE FROM core.workspace WHERE id='<id>';` and retry.

### Post-creation setup checklist (per new workspace)

**1. Enable Apps UI** — feature flags don't copy across workspaces. For each new workspace:
```sql
INSERT INTO core."featureFlag" ("workspaceId", key, value)
VALUES ('<newWorkspaceId>', 'IS_APPLICATION_ENABLED', true);
```
Then flush the feature-flag Redis cache (UI won't pick it up otherwise):
```bash
docker exec twenty-redis-1 redis-cli DEL \
  "engine:workspace:feature-flag:feature-flags-map:<newWorkspaceId>:data" \
  "engine:workspace:feature-flag:feature-flags-map:<newWorkspaceId>:hash"
```
Hard refresh (Ctrl+Shift+R) for the UI to repopulate.

**2. Install tarball apps** — Twenty's UI **does not** list tarball-deployed apps as installable in the marketplace (only npm-published apps are). Tarball apps must be installed via GraphQL for each workspace:
- Get an API key: create via UI (Settings → Developers → API Keys) or find an unrevoked JWT in `packages/twenty-apps/*/.env`.
- Run `installApplication` for each tarball `appRegistrationId`:
```bash
curl -s http://localhost:8080/metadata \
  -H "Authorization: Bearer $WORKSPACE_JWT" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { installApplication(appRegistrationId: \"<id>\") }"}'
```
- List tarball registration IDs: `SELECT id, name FROM core."applicationRegistration" WHERE "sourceType"='tarball';`
- `WORKSPACE_API_KEY` stored as `core."applicationVariable"` is **encrypted** (not a usable JWT). Don't try to reuse it as an auth token — create a fresh API key in the target workspace.

**3. Install errors are often stale-state** — if install returns `Migration action 'create' for 'fieldMetadata' failed` with FK violation on `objectMetadataId`, the previous attempt left a half-installed `core.application` row. Uninstall first, then retry:
```bash
curl -s http://localhost:8080/metadata -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"query": "mutation { uninstallApplication(universalIdentifier: \"<univIdent>\") }"}'
```
(Note: `uninstallApplication` takes `universalIdentifier`, not `applicationId`.)

**4. "Your Apps" UI is workspace-scoped** — `findManyApplicationRegistrations` (resolver) filters by `ownerWorkspaceId = currentWorkspaceId`. Apps registered from workspace A don't appear in workspace B's "Your Apps", even though they're installable globally. Setting `workspaceId=NULL` on the registration removes it from ALL workspaces (no OR-NULL fallback). To surface install/uninstall controls in a second workspace, either patch the resolver or duplicate the registration row per workspace.

### Avoid in app design
- **`junctionTargetFieldUniversalIdentifier`**: migration ordering is broken in the app-SDK for fresh installs — the field creating the junction reference runs before the junction's target field is committed, causing `Could not find junction column id for universal identifier ...`. Upgrades work (target field already exists); fresh installs fail. Prefer direct `MANY_TO_ONE` relations until the SDK is fixed.

### Useful debug queries
```sql
-- Workspaces and status
SELECT id, "displayName", subdomain, "activationStatus" FROM core.workspace ORDER BY "createdAt" DESC;

-- Admin user of a workspace
SELECT u.email, r.label FROM core."userWorkspace" uw
  JOIN core."user" u ON u.id=uw."userId"
  JOIN core."roleTarget" rt ON rt."userWorkspaceId"=uw.id
  JOIN core."role" r ON r.id=rt."roleId"
  WHERE uw."workspaceId"='<id>';

-- Feature flags per workspace
SELECT key, value FROM core."featureFlag" WHERE "workspaceId"='<id>';

-- Installed apps per workspace
SELECT name, version, "sourceType" FROM core.application
  WHERE "workspaceId"='<id>' AND "deletedAt" IS NULL;
```

