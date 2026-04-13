import {
  MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  MEETING_ORGANISER_FIELD_ID,
} from '../objects/meeting.object';
import { defineField, FieldType, RelationType } from 'twenty-sdk';

// Reuses old MEETINGS_ON_PERSON_ID UUID — same field, renamed
export const ORGANISED_MEETINGS_ON_PERSON_ID = 'bdcc802d-4301-44a1-b93f-6677b9da4c19';

export default defineField({
  universalIdentifier: ORGANISED_MEETINGS_ON_PERSON_ID,
  objectUniversalIdentifier: '20202020-e674-48e5-a542-72570eee7213',
  type: FieldType.RELATION,
  name: 'organisedMeetings',
  label: 'Organised Meetings',
  description: 'Meetings this person organised',
  icon: 'IconVideo',
  relationTargetObjectMetadataUniversalIdentifier: MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: MEETING_ORGANISER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
