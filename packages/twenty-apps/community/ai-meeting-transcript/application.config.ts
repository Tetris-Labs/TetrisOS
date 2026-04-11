import { defineApplication } from 'twenty-sdk';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from './src/roles/default-role';

export default defineApplication({
  universalIdentifier: '028754f1-3235-43b9-9427-fa6a62dbd473',
  displayName: 'AI Meeting Transcript',
  description:
    'Polls Granola hourly for each workspace member and syncs meeting notes into Twenty as Meeting records linked to people and companies.',
  icon: 'IconVideo',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  apiClientChecksum: null,
});
