import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk';

export default defineField({
  universalIdentifier: 'd1a2b3c4-0001-4000-8000-000000000002',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RICH_TEXT,
  name: 'linkedinAbout',
  label: 'About',
  description: 'LinkedIn profile about/summary section',
  icon: 'IconUser',
});
