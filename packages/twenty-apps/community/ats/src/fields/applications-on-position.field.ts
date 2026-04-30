import { defineField, FieldType, RelationType } from 'twenty-sdk';
import {
  APPLICATION_OBJECT_ID,
  POSITION_OBJECT_ID,
  APPLICATION_POSITION_FIELD_ID,
  POSITION_APPLICATIONS_FIELD_ID,
} from 'src/constants';

export default defineField({
  universalIdentifier: POSITION_APPLICATIONS_FIELD_ID,
  objectUniversalIdentifier: POSITION_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'applications',
  label: 'Applications',
  description: 'Candidates applying to this position',
  icon: 'IconUserCheck',
  relationTargetObjectMetadataUniversalIdentifier: APPLICATION_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: APPLICATION_POSITION_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
