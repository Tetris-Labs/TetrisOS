import { defineLogicFunction } from 'twenty-sdk';
import type { DatabaseEventPayload } from 'twenty-sdk';
import { main } from '../index';

export default defineLogicFunction({
  universalIdentifier: 'f4f1e127-87f0-4dcf-99fe-8061adf5cbe6',
  name: 'on-message-created',
  description: 'Updates Last Interaction and Interaction Status on people/companies when a message is created',
  timeoutSeconds: 30,
  handler: async (payload: DatabaseEventPayload) => {
    return main({
      properties: payload.properties,
      recordId: payload.recordId,
      userId: payload.userId,
    });
  },
  databaseEventTriggerSettings: {
    eventName: 'message.created',
  },
});
