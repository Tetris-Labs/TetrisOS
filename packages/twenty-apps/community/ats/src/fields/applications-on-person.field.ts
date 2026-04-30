import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk';
import {
  APPLICATION_OBJECT_ID,
  APPLICATION_CANDIDATE_FIELD_ID,
  PERSON_APPLICATIONS_FIELD_ID,
} from 'src/constants';

export default defineField({
  universalIdentifier: PERSON_APPLICATIONS_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'applications',
  label: 'Applications',
  description: 'Applications this person has submitted',
  icon: 'IconUserCheck',
  relationTargetObjectMetadataUniversalIdentifier: APPLICATION_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: APPLICATION_CANDIDATE_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
