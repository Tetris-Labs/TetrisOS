import {
  MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  MEETING_PERSON_FIELD_ID,
} from '../objects/meeting.object';
import { defineField, FieldType, RelationType } from 'twenty-sdk';

// UUID for the reverse ONE_TO_MANY field on person
export const MEETINGS_ON_PERSON_ID = 'bdcc802d-4301-44a1-b93f-6677b9da4c19';

export default defineField({
  universalIdentifier: MEETINGS_ON_PERSON_ID,
  // person standard object universal identifier
  objectUniversalIdentifier: '20202020-e674-48e5-a542-72570eee7213',
  type: FieldType.RELATION,
  name: 'meetings',
  label: 'Meetings',
  description: 'Meetings this person attended',
  icon: 'IconVideo',
  relationTargetObjectMetadataUniversalIdentifier: MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: MEETING_PERSON_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
