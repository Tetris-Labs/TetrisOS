import {
  MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  MEETING_ORGANISER_FIELD_ID,
} from '../objects/meeting.object';
import { ORGANISED_MEETINGS_ON_PERSON_ID } from './organised-meetings-on-person.field';
import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk';

export default defineField({
  universalIdentifier: MEETING_ORGANISER_FIELD_ID,
  objectUniversalIdentifier: MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'organiser',
  label: 'Organiser',
  description: 'Person who organised this meeting',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: ORGANISED_MEETINGS_ON_PERSON_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'organiserId',
  },
});
