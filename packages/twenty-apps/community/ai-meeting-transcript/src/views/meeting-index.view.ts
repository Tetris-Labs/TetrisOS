import { defineView, ViewKey } from 'twenty-sdk';
import {
  MEETING_NAME_FIELD_ID,
  MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
} from '../objects/meeting.object';

export default defineView({
  universalIdentifier: 'e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b',
  name: 'All Meetings',
  objectUniversalIdentifier: MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconVideo',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: 'f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
      fieldMetadataUniversalIdentifier: MEETING_NAME_FIELD_ID,
      isVisible: true,
      position: 0,
    },
    {
      universalIdentifier: 'a2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d',
      fieldMetadataUniversalIdentifier: '7b5884c9-b231-4d9f-a4fc-35295dccc030',
      isVisible: true,
      position: 1,
    },
  ],
});
