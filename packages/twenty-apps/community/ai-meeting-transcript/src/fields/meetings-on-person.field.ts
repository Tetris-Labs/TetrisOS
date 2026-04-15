import {
  MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  MEETING_PARTICIPANT_FIELD_ID,
} from '../objects/meeting.object';
import { defineField, FieldType, RelationType } from 'twenty-sdk';

export const MEETINGS_ON_PERSON_ID = 'e7f1a2b3-c4d5-4e6f-8a9b-0c1d2e3f4a5c';

export default defineField({
  universalIdentifier: MEETINGS_ON_PERSON_ID,
  // Person standard object universal identifier
  objectUniversalIdentifier: '20202020-e674-48e5-a542-72570eee7213',
  type: FieldType.RELATION,
  name: 'meetings',
  label: 'Meetings',
  description: 'Meetings linked to this person',
  icon: 'IconVideo',
  relationTargetObjectMetadataUniversalIdentifier: MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: MEETING_PARTICIPANT_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
