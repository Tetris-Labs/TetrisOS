import { defineView } from 'twenty-sdk';
import {
  VIEW_APPLICATIONS_ACTIVE_ID,
  APPLICATION_OBJECT_ID,
  APPLICATION_DISPLAY_LABEL_FIELD_ID,
  APPLICATION_POSITION_FIELD_ID,
  APPLICATION_CANDIDATE_FIELD_ID,
  APPLICATION_STAGE_FIELD_ID,
  APPLICATION_RATING_FIELD_ID,
  APPLICATION_APPLIED_AT_FIELD_ID,
  APPLICATION_SOURCE_FIELD_ID,
  VF_ACTIVE_LABEL,
  VF_ACTIVE_POSITION,
  VF_ACTIVE_CANDIDATE,
  VF_ACTIVE_STAGE,
  VF_ACTIVE_RATING,
  VF_ACTIVE_APPLIED_AT,
  VF_ACTIVE_SOURCE,
} from 'src/constants';

// Default unfiltered. Recruiter applies the "stage IS NOT IN (Hired, Disqualified)"
// filter through the Twenty UI after install. The SDK's view-filter type isn't
// exposed by twenty-sdk@0.8.0 so we can't declare the filter in the manifest yet.
export default defineView({
  universalIdentifier: VIEW_APPLICATIONS_ACTIVE_ID,
  name: 'Active',
  objectUniversalIdentifier: APPLICATION_OBJECT_ID,
  icon: 'IconFlame',
  position: 1,
  fields: [
    {
      universalIdentifier: VF_ACTIVE_LABEL,
      fieldMetadataUniversalIdentifier: APPLICATION_DISPLAY_LABEL_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: VF_ACTIVE_POSITION,
      fieldMetadataUniversalIdentifier: APPLICATION_POSITION_FIELD_ID,
      position: 1,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: VF_ACTIVE_CANDIDATE,
      fieldMetadataUniversalIdentifier: APPLICATION_CANDIDATE_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: VF_ACTIVE_STAGE,
      fieldMetadataUniversalIdentifier: APPLICATION_STAGE_FIELD_ID,
      position: 3,
      isVisible: true,
      size: 130,
    },
    {
      universalIdentifier: VF_ACTIVE_RATING,
      fieldMetadataUniversalIdentifier: APPLICATION_RATING_FIELD_ID,
      position: 4,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: VF_ACTIVE_APPLIED_AT,
      fieldMetadataUniversalIdentifier: APPLICATION_APPLIED_AT_FIELD_ID,
      position: 5,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: VF_ACTIVE_SOURCE,
      fieldMetadataUniversalIdentifier: APPLICATION_SOURCE_FIELD_ID,
      position: 6,
      isVisible: true,
      size: 130,
    },
  ],
});
