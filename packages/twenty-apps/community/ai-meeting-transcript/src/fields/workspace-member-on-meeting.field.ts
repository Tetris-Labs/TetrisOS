import {
  MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  MEETING_WORKSPACE_MEMBER_FIELD_ID,
} from '../objects/meeting.object';
import { MEETINGS_ON_WORKSPACE_MEMBER_ID } from './meeting-on-workspace-member.field';
import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk';

export default defineField({
  universalIdentifier: MEETING_WORKSPACE_MEMBER_FIELD_ID,
  objectUniversalIdentifier: MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'workspaceMember',
  label: 'Owner',
  description: 'Workspace member who synced this meeting',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: MEETINGS_ON_WORKSPACE_MEMBER_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'workspaceMemberId',
  },
});
