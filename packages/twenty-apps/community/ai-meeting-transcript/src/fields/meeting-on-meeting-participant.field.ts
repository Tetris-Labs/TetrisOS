import {
  MEETING_PARTICIPANT_MEETING_FIELD_ID,
  MEETING_PARTICIPANT_OBJECT_UNIVERSAL_IDENTIFIER,
} from '../objects/meeting-participant.object';
import { PARTICIPANTS_ON_MEETING_FIELD_ID } from './participants-on-meeting.field';
import { defineField, FieldType, RelationType } from 'twenty-sdk';
import { MEETING_OBJECT_UNIVERSAL_IDENTIFIER } from '../objects/meeting.object';

export default defineField({
  universalIdentifier: MEETING_PARTICIPANT_MEETING_FIELD_ID,
  objectUniversalIdentifier: MEETING_PARTICIPANT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'meeting',
  label: 'Meeting',
  description: 'The meeting this participant record belongs to',
  icon: 'IconVideo',
  relationTargetObjectMetadataUniversalIdentifier:
    MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    PARTICIPANTS_ON_MEETING_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'meetingId',
  },
});
