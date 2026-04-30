import { defineLogicFunction } from 'twenty-sdk';
import type { DatabaseEventPayload } from 'twenty-sdk';
import { handleSubmit } from './submit-handler';

const handler = async (payload: DatabaseEventPayload) => {
  return handleSubmit(payload, 'created');
};

export default defineLogicFunction({
  universalIdentifier: 'e1f2a3b4-0001-4000-9000-000000000001',
  name: 'linkedin-enrichment-submit-created',
  description:
    'Submits an Apify LinkedIn scraping run when a Person record is created with a LinkedIn URL.',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'person.created',
  },
});
