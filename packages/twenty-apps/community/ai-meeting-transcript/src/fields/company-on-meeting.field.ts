import {
  MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  MEETING_COMPANY_FIELD_ID,
} from '../objects/meeting.object';
import { MEETINGS_ON_COMPANY_ID } from './meeting-on-company.field';
import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk';

export default defineField({
  universalIdentifier: MEETING_COMPANY_FIELD_ID,
  objectUniversalIdentifier: MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'company',
  label: 'Company',
  description: 'Primary company linked to this meeting',
  icon: 'IconBuilding',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: MEETINGS_ON_COMPANY_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'companyId',
  },
});
