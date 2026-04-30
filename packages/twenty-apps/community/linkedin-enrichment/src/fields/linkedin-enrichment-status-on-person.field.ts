import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk';

export default defineField({
  universalIdentifier: 'd1a2b3c4-0001-4000-8000-000000000015',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'linkedinEnrichmentStatus',
  label: 'Enrichment Status',
  description: 'Status of LinkedIn enrichment',
  icon: 'IconRefresh',
  options: [
    {
      id: 'cdb9729c-5ab9-4bba-ad73-890db661dc9f',
      value: 'PENDING',
      label: 'Pending',
      color: 'yellow',
      position: 0,
    },
    {
      id: '9626bcaf-3a90-4c3a-abd4-13f7625b4daf',
      value: 'COMPLETE',
      label: 'Complete',
      color: 'green',
      position: 1,
    },
    {
      id: '236b4168-c1c8-43c7-8357-d805da33f8de',
      value: 'FAILED',
      label: 'Failed',
      color: 'red',
      position: 2,
    },
  ],
});
