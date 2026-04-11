import {
  MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  MEETING_PERSON_FIELD_ID,
} from '../objects/meeting.object';
import { MEETINGS_ON_PERSON_ID } from './meeting-on-person.field';
import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk';

export default defineField({
  universalIdentifier: MEETING_PERSON_FIELD_ID,
  objectUniversalIdentifier: MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'person',
  label: 'Person',
  description: 'Primary external attendee linked to this meeting',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: MEETINGS_ON_PERSON_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'personId',
  },
});
