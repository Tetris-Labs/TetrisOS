import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk';

export const GRANOLA_API_KEY_FIELD_ID = '42e82908-ddf8-4073-8805-935e86c4102e';

export default defineField({
  universalIdentifier: GRANOLA_API_KEY_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.TEXT,
  name: 'granolaApiKey',
  label: 'Granola API Key',
  description:
    'Personal Granola API key (starts with grn_). Set this in Settings > Accounts > Granola.',
  icon: 'IconKey',
  isNullable: true,
  defaultValue: null,
});
