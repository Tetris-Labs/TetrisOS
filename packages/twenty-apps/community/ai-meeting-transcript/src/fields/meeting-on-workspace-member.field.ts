import {
  MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  MEETING_WORKSPACE_MEMBER_FIELD_ID,
} from '../objects/meeting.object';
import { defineField, FieldType, RelationType } from 'twenty-sdk';

// UUID for the reverse ONE_TO_MANY field on workspaceMember
export const MEETINGS_ON_WORKSPACE_MEMBER_ID = 'c7b54dea-e1a1-421a-8738-8b2b8171faac';

export default defineField({
  universalIdentifier: MEETINGS_ON_WORKSPACE_MEMBER_ID,
  // workspaceMember standard object universal identifier
  objectUniversalIdentifier: '20202020-3319-4234-a34c-82d5c0e881a6',
  type: FieldType.RELATION,
  name: 'meetings',
  label: 'Meetings',
  description: 'Meetings synced by this workspace member',
  icon: 'IconVideo',
  relationTargetObjectMetadataUniversalIdentifier: MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: MEETING_WORKSPACE_MEMBER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
