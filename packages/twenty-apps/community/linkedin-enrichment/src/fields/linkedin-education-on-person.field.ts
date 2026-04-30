import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk';

export default defineField({
  universalIdentifier: 'd1a2b3c4-0001-4000-8000-000000000009',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.TEXT,
  name: 'linkedinEducation',
  label: 'Education',
  description: 'School names from LinkedIn profile, comma-separated',
  icon: 'IconSchool',
});
