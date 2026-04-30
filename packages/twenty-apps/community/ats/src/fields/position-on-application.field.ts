import { defineField, FieldType, RelationType } from 'twenty-sdk';
import {
  APPLICATION_OBJECT_ID,
  POSITION_OBJECT_ID,
  APPLICATION_POSITION_FIELD_ID,
  POSITION_APPLICATIONS_FIELD_ID,
} from 'src/constants';

export default defineField({
  universalIdentifier: APPLICATION_POSITION_FIELD_ID,
  objectUniversalIdentifier: APPLICATION_OBJECT_ID,
  type: FieldType.RELATION,
  // Named 'forPosition' (not 'position') to avoid colliding with Twenty's
  // implicit per-record sort field also called 'position'.
  name: 'forPosition',
  label: 'Position',
  description: 'The role this application is for',
  icon: 'IconBriefcase',
  relationTargetObjectMetadataUniversalIdentifier: POSITION_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: POSITION_APPLICATIONS_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'forPositionId',
  },
});
