import { defineObject, FieldType } from 'twenty-sdk';

export const MEETING_OBJECT_UNIVERSAL_IDENTIFIER = 'a991e711-f8cf-41d4-be9a-83e1cf2e07bb';

// Field UUIDs for cross-file relation wiring
export const MEETING_NAME_FIELD_ID = 'cae92507-ab90-46bb-bdf1-9bd1736e94f7';
export const MEETING_WORKSPACE_MEMBER_FIELD_ID = 'c3110621-650f-40fd-ab06-d402f2f1e2b6';
// Reuses old MEETING_PERSON_FIELD_ID UUID — data preserved, renamed to organiser
export const MEETING_ORGANISER_FIELD_ID = 'd2801814-8fe2-44e1-b836-16be75fbf2a8';
export const MEETING_COMPANY_FIELD_ID = '7fc508a8-2cd9-4219-94d9-17f0017653d0';

export default defineObject({
  universalIdentifier: MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'meeting',
  namePlural: 'meetings',
  labelSingular: 'Meeting',
  labelPlural: 'Meetings',
  description: 'A meeting imported from Granola, with summary and attendee links',
  icon: 'IconVideo',
  labelIdentifierFieldMetadataUniversalIdentifier: MEETING_NAME_FIELD_ID,
  fields: [
    {
      universalIdentifier: MEETING_NAME_FIELD_ID,
      name: 'name',
      type: FieldType.TEXT,
      label: 'Title',
      description: 'Meeting title from Granola',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: 'f69b1e72-7623-4e7f-91ba-ff3a5fddcd65',
      name: 'granolaId',
      type: FieldType.TEXT,
      label: 'Granola ID',
      description: 'Granola note ID (not_xxx). Prevents duplicate imports.',
      icon: 'IconVideo',
    },
    {
      universalIdentifier: '7b5884c9-b231-4d9f-a4fc-35295dccc030',
      name: 'meetingDate',
      type: FieldType.DATE_TIME,
      label: 'Meeting Date',
      description: 'Scheduled start time of the meeting',
      icon: 'IconCalendar',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: 'd12b9cf9-e1d1-40b6-957f-4467ca870bf3',
      name: 'body',
      type: FieldType.RICH_TEXT,
      label: 'Body',
      description: 'AI-generated meeting summary from Granola',
      icon: 'IconSparkles',
    },
    {
      universalIdentifier: '5491fcc9-7010-4743-81be-2735da9c58ca',
      name: 'granolaUrl',
      type: FieldType.LINKS,
      label: 'Granola URL',
      description: 'Link back to the original meeting in Granola',
      icon: 'IconLink',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: 'f61f0ded-c93d-4f8f-8a6e-29a5b2f584ba',
      name: 'source',
      type: FieldType.SELECT,
      label: 'Source',
      description: 'Where this meeting was imported from',
      icon: 'IconDatabase',
      defaultValue: "'GRANOLA'",
      options: [
        {
          id: '19c93aca-b77f-4ad5-bd66-bef061e69269',
          value: 'GRANOLA',
          label: 'Granola',
          position: 0,
          color: 'green',
        },
      ],
    },
  ],
});
