import { defineRole, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk';
import { MEETING_OBJECT_UNIVERSAL_IDENTIFIER } from '../objects/meeting.object';
import { MEETING_PARTICIPANT_OBJECT_UNIVERSAL_IDENTIFIER } from '../objects/meeting-participant.object';

export const DEFAULT_ROLE_UNIVERSAL_IDENTIFIER = '03b767db-8e70-4512-9c8a-5fcc330c2fd9';

export default defineRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'AI Meeting Transcript Role',
  description:
    'Read/write access for workspace members (to read Granola API keys and update sync timestamps), write access for meetings, read access for people and companies.',
  canUpdateAllSettings: false,
  canAccessAllTools: false,
  // workspaceMember is a system object — canReadAllObjectRecords grants the poller
  // access to fetch workspace members with their granolaApiKey field
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  objectPermissions: [
    // Meeting: read/write (we create and update meetings)
    {
      objectUniversalIdentifier: MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    // Person: read-only (we look up people by email to link them to meetings)
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    // Company: read-only (we resolve the company from each person record)
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    // MeetingParticipant: read/write (we create participant junction records)
    {
      objectUniversalIdentifier: MEETING_PARTICIPANT_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
  ],
});
