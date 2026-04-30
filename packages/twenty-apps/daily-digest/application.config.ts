import { defineApplication } from 'twenty-sdk';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from './src/roles/default-role';

export const APPLICATION_UNIVERSAL_IDENTIFIER = 'c52865dd-39ca-47f0-ad8b-bc30c22fe16f';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Daily Digest',
  description:
    'Sends a personalized daily email digest to each workspace member summarising their overdue/due-today tasks, recent notes, and pipeline updates.',
  icon: 'IconMail',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  apiClientChecksum: null,
  applicationVariables: {
    SMTP_HOST: {
      universalIdentifier: '156ddf17-a109-4053-87a1-bd28954b89cc',
      description: 'SMTP server hostname (e.g. smtp.gmail.com)',
      isSecret: false,
      value: '',
    },
    SMTP_PORT: {
      universalIdentifier: '3bbb622b-a817-420a-b759-d68694e7d8f8',
      description: 'SMTP port (587 for STARTTLS, 465 for SSL/TLS)',
      isSecret: false,
      value: '587',
    },
    SMTP_USER: {
      universalIdentifier: '2713d2d2-b3d6-4164-8616-9934b45bc6fa',
      description: 'SMTP username / login',
      isSecret: true,
      value: '',
    },
    SMTP_PASS: {
      universalIdentifier: '252ec907-2ef3-49e0-a3bc-71b7ba68feec',
      description: 'SMTP password or app-specific password',
      isSecret: true,
      value: '',
    },
    SMTP_SECURE: {
      universalIdentifier: '5320f57c-fef2-4e0b-b01e-3d055039ec34',
      description: 'Set to "true" for direct TLS (port 465). Use "false" for STARTTLS (port 587).',
      isSecret: false,
      value: 'false',
    },
    EMAIL_FROM: {
      universalIdentifier: '86cc101f-6643-4a53-92f2-7d6b2645c571',
      description: 'From address for digest emails (must be authorised by your SMTP provider)',
      isSecret: false,
      value: 'digest@example.com',
    },
    EMAIL_FROM_NAME: {
      universalIdentifier: 'c77eed08-6a7d-4273-8a73-de0adacbff57',
      description: 'Display name shown as the sender',
      isSecret: false,
      value: 'Twenty CRM',
    },
    LOOKBACK_HOURS: {
      universalIdentifier: 'de533a9a-bfeb-4812-ab85-9e6762e54df7',
      description: 'How many hours back to look for new notes and opportunity updates (default: 24)',
      isSecret: false,
      value: '24',
    },
    SKIP_EMPTY_DIGESTS: {
      universalIdentifier: '34ae4ad3-8604-4d3c-b194-bfd8e0ac22c3',
      description:
        'Set to "true" to skip sending an email when a user has no tasks, notes, or pipeline items (default: true)',
      isSecret: false,
      value: 'true',
    },
    WORKSPACE_API_KEY: {
      universalIdentifier: 'b1e2f3a4-c5d6-7890-abcd-ef1234567890',
      description: 'Workspace API key — required to access custom fields (like task priority) that are invisible to app tokens. Must be stored with isSecret=false so the value is injected as-is into the function runtime.',
      isSecret: false,
      value: '',
    },
  },
});
