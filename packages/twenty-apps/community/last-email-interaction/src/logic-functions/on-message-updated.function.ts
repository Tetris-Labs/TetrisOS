import { defineLogicFunction } from 'twenty-sdk';
import type { DatabaseEventPayload } from 'twenty-sdk';
import { main } from '../index';

export default defineLogicFunction({
  universalIdentifier: '4c17878f-b6b3-4d0a-8de6-967b1cb55002',
  name: 'on-message-updated',
  description: 'Updates Last Interaction and Interaction Status on people/companies when a message is updated',
  timeoutSeconds: 30,
  handler: async (payload: DatabaseEventPayload) => {
    return main({
      properties: payload.properties,
      recordId: payload.recordId,
      userId: payload.userId,
    });
  },
  databaseEventTriggerSettings: {
    eventName: 'message.updated',
  },
});
