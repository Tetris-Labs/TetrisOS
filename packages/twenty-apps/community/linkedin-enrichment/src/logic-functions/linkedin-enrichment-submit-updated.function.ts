import { defineLogicFunction } from 'twenty-sdk';
import type { DatabaseEventPayload } from 'twenty-sdk';
import { handleSubmit } from './submit-handler';

const handler = async (payload: DatabaseEventPayload) => {
  return handleSubmit(payload, 'updated');
};

export default defineLogicFunction({
  universalIdentifier: 'e1f2a3b4-0001-4000-9000-000000000002',
  name: 'linkedin-enrichment-submit-updated',
  description:
    'Submits an Apify LinkedIn scraping run when a Person record LinkedIn URL is updated.',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'person.updated',
    updatedFields: ['linkedinLink'],
  },
});
