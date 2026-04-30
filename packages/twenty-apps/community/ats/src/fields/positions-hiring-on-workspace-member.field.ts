import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk';
import {
  POSITION_OBJECT_ID,
  POSITION_HIRING_MANAGER_FIELD_ID,
  WORKSPACE_MEMBER_POSITIONS_HIRING_FIELD_ID,
} from 'src/constants';

export default defineField({
  universalIdentifier: WORKSPACE_MEMBER_POSITIONS_HIRING_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'positionsHiring',
  label: 'Positions hiring',
  description: 'Open positions this workspace member is the hiring manager for',
  icon: 'IconBriefcase',
  relationTargetObjectMetadataUniversalIdentifier: POSITION_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier:
    POSITION_HIRING_MANAGER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
