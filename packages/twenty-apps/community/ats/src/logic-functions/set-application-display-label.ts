import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordCreateEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk';
import { SET_DISPLAY_LABEL_FUNCTION_ID } from 'src/constants';

declare const process: { env: Record<string, string | undefined> };

type ApplicationRecord = {
  id: string;
  displayLabel?: string | null;
  candidateId?: string | null;
  forPositionId?: string | null;
};

type PersonNameRecord = {
  name?: { firstName?: string | null; lastName?: string | null } | null;
};

type PositionNameRecord = {
  name?: string | null;
};

// Twenty injects TWENTY_API_URL with the host-exposed SERVER_URL value (e.g.
// http://localhost:8080). From inside the worker container, "localhost" is
// the worker itself, not the server — every fetch fails with ECONNREFUSED.
// Always rewrite localhost/127.0.0.1 to the docker service name.
// Override with ATS_API_URL app variable if your deployment differs.
const getApiUrl = (): string => {
  const raw =
    process.env.ATS_API_URL ??
    process.env.TWENTY_API_URL ??
    process.env.SERVER_URL ??
    'http://localhost:3000';
  return raw
    .replace('://localhost', '://twenty-server-1')
    .replace('://127.0.0.1', '://twenty-server-1')
    .replace(/\/$/, '');
};

const getToken = (): string => {
  const token = process.env.TWENTY_APP_ACCESS_TOKEN ?? '';
  if (!token) throw new Error('TWENTY_APP_ACCESS_TOKEN is not set');
  return token;
};

type GqlResponse<T> = { data: T; errors?: { message: string }[] };

const gql = async <T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> => {
  const res = await fetch(`${getApiUrl()}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ query, variables: variables ?? {} }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL HTTP ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as GqlResponse<T>;
  if (json.errors?.length) {
    throw new Error(`GraphQL error: ${json.errors[0].message}`);
  }
  return json.data;
};

export const composeLabel = (
  person: PersonNameRecord | null,
  position: PositionNameRecord | null,
): string => {
  const first = person?.name?.firstName?.trim() ?? '';
  const last = person?.name?.lastName?.trim() ?? '';
  const candidateName = [first, last].filter(Boolean).join(' ') || '?';
  const positionName = position?.name?.trim() || '?';
  return `${candidateName} — ${positionName}`;
};

export const handler = async (
  params: DatabaseEventPayload<
    | ObjectRecordCreateEvent<ApplicationRecord>
    | ObjectRecordUpdateEvent<ApplicationRecord>
  >,
): Promise<void> => {
  console.log('[displayLabel] event:', params.name);
  console.log(
    '[displayLabel] payload.after:',
    JSON.stringify(params.properties?.after),
  );

  const [, action] = params.name.split('.');
  if (!['created', 'updated'].includes(action)) {
    console.log('[displayLabel] skipped — action not create/update');
    return;
  }

  const application = params.properties.after;
  if (!application?.id) {
    console.log('[displayLabel] skipped — no application.id');
    return;
  }


  // Twenty exposes the object using its nameSingular as the GraphQL field —
  // the Position object is renamed to `jobPosition` (see position.object.ts
  // for why), so the query must use `jobPosition`, not `position`.
  // Each query is wrapped in its own try/catch so a single failed lookup
  // doesn't blank out the label entirely.
  const safeQuery = async <T>(query: string, vars: Record<string, unknown>) => {
    try {
      return await gql<T>(query, vars);
    } catch (err) {
      console.warn('[set-application-display-label] query failed:', err);
      return null;
    }
  };

  const [personData, positionData] = await Promise.all([
    application.candidateId
      ? safeQuery<{ person: PersonNameRecord | null }>(
          `query GetPerson($id: UUID!) { person(filter: { id: { eq: $id } }) { name { firstName lastName } } }`,
          { id: application.candidateId },
        )
      : Promise.resolve(null),
    application.forPositionId
      ? safeQuery<{ jobPosition: PositionNameRecord | null }>(
                `query GetJobPosition($id: UUID!) { jobPosition(filter: { id: { eq: $id } }) { name } }`,
          { id: application.forPositionId },
        )
      : Promise.resolve(null),
  ]);

  const nextLabel = composeLabel(
    personData?.person ?? null,
    positionData?.jobPosition ?? null,
  );

  console.log('[displayLabel] computed:', nextLabel);

  // Skip if the label is already correct — prevents an infinite loop where our
  // own write re-fires application.updated.
  if (application.displayLabel === nextLabel) {
    console.log('[displayLabel] already up to date');
    return;
  }

  try {
    await gql(
      `mutation UpdateAppLabel($id: UUID!, $label: String!) {
         updateJobApplication(id: $id, data: { displayLabel: $label }) { id }
       }`,
      { id: application.id, label: nextLabel },
    );
    console.log('[displayLabel] wrote:', nextLabel);
  } catch (err) {
    console.error('[displayLabel] write failed:', err);
  }
};

export default defineLogicFunction({
  universalIdentifier: SET_DISPLAY_LABEL_FUNCTION_ID,
  name: 'set-application-display-label',
  description:
    'Composes Application.displayLabel as "{candidate} — {position}" on create/update',
  timeoutSeconds: 10,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'jobApplication.*',
  },
});
