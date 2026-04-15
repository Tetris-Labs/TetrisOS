import {
  MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  MEETING_PARTICIPANT_FIELD_ID,
} from '../objects/meeting.object';
import { MEETINGS_ON_PERSON_ID } from './meetings-on-person.field';
import { defineField, FieldType, RelationType } from 'twenty-sdk';

export default defineField({
  universalIdentifier: MEETING_PARTICIPANT_FIELD_ID,
  objectUniversalIdentifier: MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'participant',
  label: 'Participant',
  description: 'External person who attended this meeting',
  icon: 'IconUser',
  // Person standard object universal identifier
  relationTargetObjectMetadataUniversalIdentifier:
    '20202020-e674-48e5-a542-72570eee7213',
  relationTargetFieldMetadataUniversalIdentifier: MEETINGS_ON_PERSON_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'participantId',
  },
});
