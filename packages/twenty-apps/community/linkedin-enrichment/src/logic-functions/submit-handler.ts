import type { DatabaseEventPayload } from 'twenty-sdk';

declare const process: { env: Record<string, string | undefined> };

const LINKEDIN_URL_PATTERN = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;

// Accept URLs with or without scheme (user may paste "linkedin.com/in/foo")
const normalizeLinkedinUrl = (raw: string): string => {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, '')}`;
};

const getApiUrl = (): string =>
  (process.env.TWENTY_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

const getToken = (): string => {
  const token = process.env.TWENTY_APP_ACCESS_TOKEN ?? '';
  if (!token) throw new Error('TWENTY_APP_ACCESS_TOKEN is not set');
  return token;
};

const getApifyKey = (): string => {
  const key = process.env.APIFY_API_KEY ?? '';
  if (!key) throw new Error('APIFY_API_KEY is not set');
  return key;
};

const getApifyActorId = (): string =>
  process.env.APIFY_ACTOR_ID ?? 'harvestapi~linkedin-profile-scraper';

type GqlResponse<T> = {
  data: T;
  errors?: { message: string }[];
};

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

const updatePerson = async (
  personId: string,
  fields: Record<string, unknown>,
): Promise<void> => {
  await gql(
    `mutation UpdatePerson($id: UUID!, $input: PersonUpdateInput!) {
      updatePerson(id: $id, data: $input) { id }
    }`,
    { id: personId, input: fields },
  );
};

const submitApifyRun = async (
  linkedinUrl: string,
): Promise<{ runId: string; datasetId: string }> => {
  const actorId = getApifyActorId();
  const res = await fetch(
    `https://api.apify.com/v2/acts/${actorId}/runs?token=${getApifyKey()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileScraperMode: 'Profile details no email ($4 per 1k)',
        queries: [linkedinUrl],
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Apify HTTP ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as {
    data: { id: string; defaultDatasetId: string };
  };

  return {
    runId: json.data.id,
    datasetId: json.data.defaultDatasetId,
  };
};

type SubmitResult = {
  action: 'submitted' | 'skipped' | 'error';
  personId: string;
  reason?: string;
  runId?: string;
};

// Extract the LinkedIn URL from the LINKS field.
// The LINKS type stores the URL at linkedinLinkPrimaryLinkUrl in the DB,
// but in the event payload it appears as linkedinLink.primaryLinkUrl.
const extractLinkedinUrl = (record: Record<string, unknown>): string | null => {
  const link = record.linkedinLink as
    | { primaryLinkUrl?: string }
    | null
    | undefined;
  return link?.primaryLinkUrl || null;
};

export const handleSubmit = async (
  payload: DatabaseEventPayload,
  eventType: 'created' | 'updated',
): Promise<SubmitResult> => {
  const personId = payload.recordId;

  try {
    const properties = payload.properties as {
      after: Record<string, unknown>;
      before?: Record<string, unknown>;
      updatedFields?: string[];
    };

    const afterRecord = properties.after;
    const beforeRecord = properties.before;

    const rawUrl = extractLinkedinUrl(afterRecord);

    // No LinkedIn URL — nothing to do
    if (!rawUrl) {
      return { action: 'skipped', personId, reason: 'no linkedinUrl' };
    }

    const linkedinUrl = normalizeLinkedinUrl(rawUrl);

    // Validate URL pattern
    if (!LINKEDIN_URL_PATTERN.test(linkedinUrl)) {
      await updatePerson(personId, {
        linkedinEnrichmentStatus: 'FAILED',
        linkedinEnrichmentError: `Invalid LinkedIn URL: ${linkedinUrl}`,
      });
      return { action: 'error', personId, reason: 'invalid URL' };
    }

    // For updates, check if URL actually changed
    if (eventType === 'updated' && beforeRecord) {
      const previousRaw = extractLinkedinUrl(beforeRecord);
      const previousUrl = previousRaw ? normalizeLinkedinUrl(previousRaw) : null;
      const currentStatus = afterRecord.linkedinEnrichmentStatus as
        | string
        | null;

      // URL didn't change — only re-trigger if status is FAILED (retry)
      if (previousUrl === linkedinUrl && currentStatus !== 'FAILED') {
        return { action: 'skipped', personId, reason: 'url unchanged' };
      }
    }

    // Don't re-submit if already pending
    const currentStatus = afterRecord.linkedinEnrichmentStatus as
      | string
      | null;
    if (currentStatus === 'PENDING') {
      return { action: 'skipped', personId, reason: 'already pending' };
    }

    // Set status to PENDING and submit Apify run
    const { runId } = await submitApifyRun(linkedinUrl);

    await updatePerson(personId, {
      linkedinEnrichmentStatus: 'PENDING',
      linkedinApifyRunId: runId,
      linkedinEnrichmentError: null,
    });

    return { action: 'submitted', personId, runId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    try {
      await updatePerson(personId, {
        linkedinEnrichmentStatus: 'FAILED',
        linkedinEnrichmentError: message,
      });
    } catch {
      // If we can't even write the error, just log it
    }

    return { action: 'error', personId, reason: message };
  }
};
