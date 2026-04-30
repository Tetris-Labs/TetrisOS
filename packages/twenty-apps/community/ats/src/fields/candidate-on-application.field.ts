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
  universalIdentifier: APPLICATION_CANDIDATE_FIELD_ID,
  objectUniversalIdentifier: APPLICATION_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'candidate',
  label: 'Candidate',
  description: 'The person applying',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: PERSON_APPLICATIONS_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'candidateId',
  },
});
