import { MEETING_OBJECT_UNIVERSAL_IDENTIFIER } from '../objects/meeting.object';
import {
  MEETING_PARTICIPANT_MEETING_FIELD_ID,
  MEETING_PARTICIPANT_OBJECT_UNIVERSAL_IDENTIFIER,
  MEETING_PARTICIPANT_PERSON_FIELD_ID,
} from '../objects/meeting-participant.object';
import { defineField, FieldType, RelationType } from 'twenty-sdk';

export const PARTICIPANTS_ON_MEETING_FIELD_ID =
  'c5e6d7a8-b9c0-4d1e-8f2a-3b4c5d6e7f8d';

export default defineField({
  universalIdentifier: PARTICIPANTS_ON_MEETING_FIELD_ID,
  objectUniversalIdentifier: MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'participants',
  label: 'Participants',
  description: 'People who attended this meeting',
  icon: 'IconUsers',
  relationTargetObjectMetadataUniversalIdentifier:
    MEETING_PARTICIPANT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    MEETING_PARTICIPANT_MEETING_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
    junctionTargetFieldUniversalIdentifier:
      MEETING_PARTICIPANT_PERSON_FIELD_ID,
  },
});
