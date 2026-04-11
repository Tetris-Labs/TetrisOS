import {
  MEETING_PARTICIPANT_PERSON_FIELD_ID,
  MEETING_PARTICIPANT_OBJECT_UNIVERSAL_IDENTIFIER,
} from '../objects/meeting-participant.object';
import { PARTICIPATIONS_ON_PERSON_FIELD_ID } from './participations-on-person.field';
import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk';

export default defineField({
  universalIdentifier: MEETING_PARTICIPANT_PERSON_FIELD_ID,
  objectUniversalIdentifier: MEETING_PARTICIPANT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'person',
  label: 'Person',
  description: 'The person participating in this meeting',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    PARTICIPATIONS_ON_PERSON_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'personId',
  },
});
