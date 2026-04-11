import {
  MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  MEETING_COMPANY_FIELD_ID,
} from '../objects/meeting.object';
import { defineField, FieldType, RelationType } from 'twenty-sdk';

// UUID for the reverse ONE_TO_MANY field on company
export const MEETINGS_ON_COMPANY_ID = '875e8d95-99f3-4b04-a6d0-49f0c55a73eb';

export default defineField({
  universalIdentifier: MEETINGS_ON_COMPANY_ID,
  // company standard object universal identifier
  objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
  type: FieldType.RELATION,
  name: 'meetings',
  label: 'Meetings',
  description: 'Meetings associated with this company',
  icon: 'IconVideo',
  relationTargetObjectMetadataUniversalIdentifier: MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: MEETING_COMPANY_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
