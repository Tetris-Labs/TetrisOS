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
- `API_KEY` from `core."applicationVariable"` where `key = 'WORKSPACE_API_KEY'` (or from remote config at `~/.config/twenty/config.json`)

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

---

## Twenty App Development — Hard-Won Rules

These rules come from building and deploying tarball apps. Skip them and you'll hit the same errors.

### Schema: Fields, Relations, Views

**Views only accept scalar fields.** Do NOT put RELATION or LINKS type fields in a `defineView`'s `fields` array — the server rejects them at install time. Only TEXT, DATE_TIME, NUMBER, SELECT, etc. are allowed.

**MANY_TO_ONE requires two field files.** A `MANY_TO_ONE` on Object A needs a matching `ONE_TO_MANY` reverse field on Object B. They reference each other via `relationTargetFieldMetadataUniversalIdentifier`. The `joinColumnName` (e.g. `personId`) on the MANY_TO_ONE side must match what GraphQL mutations use as the FK field name.

**Standard object UUIDs:**
- Person: `20202020-e674-48e5-a542-72570eee7213`
- Company: `20202020-b374-4779-a561-80086cb2e17f`

**`labelIdentifierFieldMetadataUniversalIdentifier` must point to an own-object field.** Never point it at a field on a related object — validation error at install time.

**Avoid junction objects for simple relations.** Junction objects cause record pages to show junction records (e.g. "Meeting Participations") instead of the target records (e.g. "Meetings"). Use direct MANY_TO_ONE unless you genuinely need N:M with extra data on the join.

### Logic Functions: Auth, Filtering, Data

**`/metadata` endpoint for app management; `/graphql` for CRM data.**
- `installApplication`, `uninstallApplication` → POST to `/metadata`
- All data mutations (`createMeeting`, `updateWorkspaceMember`, etc.) → POST to `/graphql`

**`updateWorkspaceMember` (and other user-workspace-gated mutations) requires a workspace API key.** App tokens carry `applicationId` in auth context, which fails the `USER_WORKSPACE_NOT_FOUND` pre-query hook. Store `WORKSPACE_API_KEY` as an app variable (`isSecret=false`) and pass it as the third arg to `gql()` only for those mutations:
```typescript
const getWorkspaceApiKey = () => process.env.WORKSPACE_API_KEY ?? getToken();
await gql(MUTATION, vars, getWorkspaceApiKey());
```

**Use workspace member email Set for internal/external filtering — never hardcoded domains.** Fetch all workspace member `userEmail` values and build a `Set<string>`. Any attendee email in the set is internal; everything else is external. Domain-based filtering breaks for contractors, partners, or anyone whose domain differs from the primary workspace domain.

**Backfill functions must re-evaluate all records, not just nulls.** Compare the freshly-computed correct value against the stored value and only patch if they differ. Skipping non-null records leaves wrong links in place.

**Always patch `companyId` alongside `personId`.** They must stay in sync. Whenever `personId` changes, set `companyId = person.companyId ?? null` in the same mutation.

**Capture `syncStart` before fetching notes, not after.** Set `granolaLastSyncedAt` to the time the poll started so notes created during processing are not missed on the next run.

### Front Components

**Relation lists on record pages are hardcoded — not configurable via views.** The built-in `RecordDetailRelationRecordsListItem` uses `RecordChip` which only shows the label identifier (usually `name`). You cannot add extra columns (e.g. date) to this list via view configuration. When the user needs richer display, build a custom front component as a tab.

**Key imports for front components:**
```typescript
import { useRecordId, definePageLayout, defineFrontComponent } from 'twenty-sdk';
import { CoreApiClient } from 'twenty-sdk/clients';
import styled from '@emotion/styled'; // NOT Linaria — front components use Emotion
```

**`useRecordId()` returns the current record's UUID** — use it as the filter variable when querying related records.

**One `definePageLayout` per object type.** To add a tab to both Person and Company pages, create two separate page layout files, each with the appropriate `objectUniversalIdentifier`.

**`definePageLayout` tab structure:**
```typescript
definePageLayout({
  universalIdentifier: '<uuid>',
  objectUniversalIdentifier: '<person-or-company-uuid>',
  tabs: [{
    universalIdentifier: '<tab-uuid>',
    label: 'Meetings',
    icon: 'IconVideo',
    widgets: [{
      universalIdentifier: '<widget-uuid>',
      type: 'FRONT_COMPONENT',
      frontComponentUniversalIdentifier: '<front-component-uuid>',
    }],
  }],
});
```

