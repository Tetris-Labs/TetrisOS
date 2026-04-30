import { defineApplication } from 'twenty-sdk';
import { ATS_APP_ID, ATS_RECRUITER_ROLE_ID } from 'src/constants';

export default defineApplication({
  universalIdentifier: ATS_APP_ID,
  displayName: 'ATS',
  description:
    'Minimal applicant tracking system. Adds Positions and Applications to Twenty so a recruiter can run hiring end-to-end without leaving the CRM.',
  defaultRoleUniversalIdentifier: ATS_RECRUITER_ROLE_ID,
  // Computed by `twenty deploy`; declared null so the SDK's type satisfies.
  apiClientChecksum: null,
});
