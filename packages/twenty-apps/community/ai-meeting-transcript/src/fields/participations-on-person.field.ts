import {
  MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  MEETING_PERSON_FIELD_ID,
} from '../objects/meeting.object';
import { defineField, FieldType, RelationType } from 'twenty-sdk';

export const PARTICIPATIONS_ON_PERSON_FIELD_ID =
  '6cdd0ae6-7abe-4093-ada3-d2cc95e4c054';

export default defineField({
  universalIdentifier: PARTICIPATIONS_ON_PERSON_FIELD_ID,
  objectUniversalIdentifier: '20202020-e674-48e5-a542-72570eee7213',
  type: FieldType.RELATION,
  name: 'meetings',
  label: 'Meetings',
  description: 'Meetings where this person is the primary attendee',
  icon: 'IconVideo',
  relationTargetObjectMetadataUniversalIdentifier:
    MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: MEETING_PERSON_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
