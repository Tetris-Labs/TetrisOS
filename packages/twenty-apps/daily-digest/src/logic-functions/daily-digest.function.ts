import { defineLogicFunction } from 'twenty-sdk';
import type { CronPayload } from 'twenty-sdk';
import { runDailyDigest } from './daily-digest/digest-runner';

const handler = async (_payload: CronPayload): Promise<{ sent: number; skipped: number; errors: string[] }> => {
  return runDailyDigest();
};

export default defineLogicFunction({
  universalIdentifier: 'd48a3b0f-0010-4842-ac13-52f54a1b861c',
  name: 'daily-digest',
  description:
    'Sends a personalized daily email digest to each workspace member summarising overdue/due-today tasks, recent notes, and pipeline updates.',
  timeoutSeconds: 60,
  handler,
  cronTriggerSettings: {
    // 7:00 AM New York = 12:00 UTC (EST) / 11:00 UTC (EDT)
    pattern: '0 12 * * *',
  },
});
