import { defineRole } from 'twenty-sdk';
import { ATS_RECRUITER_ROLE_ID } from 'src/constants';

// Wide write by design — recruiters need to edit candidate (Person) records
// freely to maintain profiles alongside CRM work. Per CEO review decision 3A.
export default defineRole({
  universalIdentifier: ATS_RECRUITER_ROLE_ID,
  label: 'ATS Recruiter',
  description: 'Full record access for hiring workflows',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: false,
});
