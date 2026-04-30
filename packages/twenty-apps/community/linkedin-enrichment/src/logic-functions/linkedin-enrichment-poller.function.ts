import { defineLogicFunction } from 'twenty-sdk';
import type { CronPayload } from 'twenty-sdk';
import { fetchPendingPersons, updatePerson } from './poller/crm-client';
import { getRunStatus, getDatasetItems } from './poller/apify-client';
import { mapProfileToPersonFields } from './poller/field-mapper';

// Records pending longer than this are marked as failed
const STALE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

type PollResult = {
  processed: number;
  enriched: number;
  failed: number;
  skipped: number;
  errors: string[];
};

const handler = async (_payload: CronPayload): Promise<PollResult> => {
  const pendingPersons = await fetchPendingPersons();

  if (!pendingPersons.length) {
    return { processed: 0, enriched: 0, failed: 0, skipped: 0, errors: [] };
  }

  const result: PollResult = {
    processed: pendingPersons.length,
    enriched: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  for (const person of pendingPersons) {
    try {
      if (!person.linkedinApifyRunId) {
        await updatePerson(person.id, {
          linkedinEnrichmentStatus: 'FAILED',
          linkedinEnrichmentError: 'No Apify run ID found',
        });
        result.failed++;
        continue;
      }

      const runInfo = await getRunStatus(person.linkedinApifyRunId);

      if (runInfo.status === 'SUCCEEDED') {
        const items = await getDatasetItems(runInfo.defaultDatasetId);
        const profile = items[0];

        if (!profile) {
          await updatePerson(person.id, {
            linkedinEnrichmentStatus: 'FAILED',
            linkedinEnrichmentError: 'Apify returned empty dataset',
          });
          result.failed++;
          continue;
        }

        // Map profile data to Person fields
        const enrichmentFields = mapProfileToPersonFields(profile, {
          name: person.name,
          jobTitle: person.jobTitle,
        });

        // Write all enrichment fields + metadata
        await updatePerson(person.id, {
          ...enrichmentFields,
          linkedinEnrichmentStatus: 'COMPLETE',
          linkedinEnrichedAt: new Date().toISOString(),
          linkedinEnrichmentError: null,
          linkedinRawPayload: profile,
        });

        result.enriched++;
      } else if (
        runInfo.status === 'FAILED' ||
        runInfo.status === 'ABORTED' ||
        runInfo.status === 'TIMED-OUT'
      ) {
        await updatePerson(person.id, {
          linkedinEnrichmentStatus: 'FAILED',
          linkedinEnrichmentError: `Apify run ${runInfo.status}`,
        });
        result.failed++;
      } else {
        // Still running — check for stale timeout
        const updatedAt = new Date(person.updatedAt).getTime();
        const now = Date.now();

        if (now - updatedAt > STALE_TIMEOUT_MS) {
          await updatePerson(person.id, {
            linkedinEnrichmentStatus: 'FAILED',
            linkedinEnrichmentError: `Timeout: pending for more than 15 minutes`,
          });
          result.failed++;
        } else {
          result.skipped++;
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      result.errors.push(`Person ${person.id}: ${message}`);

      try {
        await updatePerson(person.id, {
          linkedinEnrichmentStatus: 'FAILED',
          linkedinEnrichmentError: message,
        });
      } catch {
        // If we can't write the error, just continue
      }

      result.failed++;
    }
  }

  return result;
};

export default defineLogicFunction({
  universalIdentifier: 'e1f2a3b4-0001-4000-9000-000000000003',
  name: 'linkedin-enrichment-poller',
  description:
    'Polls Apify every minute for completed LinkedIn enrichment runs and writes results to Person records.',
  timeoutSeconds: 120,
  handler,
  cronTriggerSettings: {
    pattern: '*/1 * * * *',
  },
});
