import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk';

export const GRANOLA_FILTER_DOMAIN_FIELD_ID = 'b7c91a2e-5f43-4d88-a6e1-72f3c8d09b14';

export default defineField({
  universalIdentifier: GRANOLA_FILTER_DOMAIN_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.TEXT,
  name: 'granolaFilterDomain',
  label: 'Granola Filter Domain',
  description:
    'Only import meetings with at least one attendee from this domain (e.g. acme.com). Leave blank to import all meetings.',
  icon: 'IconFilter',
  isNullable: true,
  defaultValue: null,
});
