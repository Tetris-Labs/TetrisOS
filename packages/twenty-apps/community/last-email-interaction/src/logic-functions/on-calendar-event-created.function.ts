import { defineLogicFunction } from 'twenty-sdk';
import type { DatabaseEventPayload } from 'twenty-sdk';
import { mainCalendar } from '../index';

export default defineLogicFunction({
  universalIdentifier: '56172870-a866-49b1-a4b5-dd23696d2590',
  name: 'on-calendar-event-created',
  description: 'Updates Last Interaction and Interaction Status on people/companies when a calendar event is created',
  timeoutSeconds: 30,
  handler: async (payload: DatabaseEventPayload) => {
    return mainCalendar({
      properties: payload.properties,
      recordId: payload.recordId,
      userId: payload.userId,
    });
  },
  databaseEventTriggerSettings: {
    eventName: 'calendarEvent.created',
  },
});
