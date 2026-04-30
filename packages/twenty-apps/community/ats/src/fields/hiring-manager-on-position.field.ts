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
  universalIdentifier: POSITION_HIRING_MANAGER_FIELD_ID,
  objectUniversalIdentifier: POSITION_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'hiringManager',
  label: 'Hiring manager',
  description: 'Workspace member responsible for this role',
  icon: 'IconUserStar',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    WORKSPACE_MEMBER_POSITIONS_HIRING_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'hiringManagerId',
  },
});
