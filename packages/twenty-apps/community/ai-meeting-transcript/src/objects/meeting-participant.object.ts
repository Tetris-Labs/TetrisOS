import { defineObject } from 'twenty-sdk';

export const MEETING_PARTICIPANT_OBJECT_UNIVERSAL_IDENTIFIER =
  'c5e6d7a8-b9c0-4d1e-8f2a-3b4c5d6e7f8a';

// Field UUIDs
export const MEETING_PARTICIPANT_MEETING_FIELD_ID =
  'c5e6d7a8-b9c0-4d1e-8f2a-3b4c5d6e7f8b';
export const MEETING_PARTICIPANT_PERSON_FIELD_ID =
  'c5e6d7a8-b9c0-4d1e-8f2a-3b4c5d6e7f8c';

export default defineObject({
  universalIdentifier: MEETING_PARTICIPANT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'meetingParticipant',
  namePlural: 'meetingParticipants',
  labelSingular: 'Meeting Participant',
  labelPlural: 'Meeting Participants',
  description: 'Junction linking a Meeting to a participant Person',
  icon: 'IconUsers',
  fields: [],
});
