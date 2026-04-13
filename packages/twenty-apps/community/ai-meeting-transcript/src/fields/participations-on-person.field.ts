import {
  MEETING_PARTICIPANT_PERSON_FIELD_ID,
  MEETING_PARTICIPANT_OBJECT_UNIVERSAL_IDENTIFIER,
  MEETING_PARTICIPANT_MEETING_FIELD_ID,
} from '../objects/meeting-participant.object';
import { defineField, FieldType, RelationType } from 'twenty-sdk';

export const PARTICIPATIONS_ON_PERSON_FIELD_ID =
  'c5e6d7a8-b9c0-4d1e-8f2a-3b4c5d6e7f8e';

export default defineField({
  universalIdentifier: PARTICIPATIONS_ON_PERSON_FIELD_ID,
  objectUniversalIdentifier: '20202020-e674-48e5-a542-72570eee7213',
  type: FieldType.RELATION,
  name: 'meetings',
  label: 'Meetings',
  description: 'Meetings linked to this person through participants',
  icon: 'IconVideo',
  relationTargetObjectMetadataUniversalIdentifier:
    MEETING_PARTICIPANT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    MEETING_PARTICIPANT_PERSON_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
    junctionTargetFieldUniversalIdentifier:
      MEETING_PARTICIPANT_MEETING_FIELD_ID,
  },
});
