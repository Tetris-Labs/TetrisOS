import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk';

export default defineField({
  universalIdentifier: 'd1a2b3c4-0001-4000-8000-000000000014',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.TEXT,
  name: 'linkedinLanguages',
  label: 'Languages',
  description: 'Languages from LinkedIn profile',
  icon: 'IconLanguage',
});
