import { defineLogicFunction } from 'twenty-sdk';
import type { DatabaseEventPayload } from 'twenty-sdk';
import { mainCalendar } from '../index';

export default defineLogicFunction({
  universalIdentifier: '6cbdc31b-b34f-4035-94c9-1c6509d3e037',
  name: 'on-calendar-event-updated',
  description: 'Updates Last Interaction and Interaction Status on people/companies when a calendar event is updated',
  timeoutSeconds: 30,
  handler: async (payload: DatabaseEventPayload) => {
    return mainCalendar({
      properties: payload.properties,
      recordId: payload.recordId,
      userId: payload.userId,
    });
  },
  databaseEventTriggerSettings: {
    eventName: 'calendarEvent.updated',
  },
});
