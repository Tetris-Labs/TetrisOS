import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk';

export const GRANOLA_LAST_SYNCED_AT_FIELD_ID = '1eb98854-adc0-455a-a5ae-d5580b543ba6';

export default defineField({
  universalIdentifier: GRANOLA_LAST_SYNCED_AT_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.DATE_TIME,
  name: 'granolaLastSyncedAt',
  label: 'Granola Last Synced At',
  description: 'Timestamp of the most recent successful Granola sync. Updated automatically.',
  icon: 'IconClock',
  isNullable: true,
  defaultValue: null,
});
