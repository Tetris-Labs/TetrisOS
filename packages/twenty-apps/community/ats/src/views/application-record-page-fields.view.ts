import { defineView } from 'twenty-sdk';
import {
  VIEW_APPLICATION_RECORD_PAGE_ID,
  APPLICATION_OBJECT_ID,
  APPLICATION_DISPLAY_LABEL_FIELD_ID,
  APPLICATION_STAGE_FIELD_ID,
  APPLICATION_RATING_FIELD_ID,
  APPLICATION_SOURCE_FIELD_ID,
  APPLICATION_APPLIED_AT_FIELD_ID,
  APPLICATION_DISQUALIFY_REASON_FIELD_ID,
  APPLICATION_NOTES_FIELD_ID,
  VF_APP_PAGE_LABEL,
  VF_APP_PAGE_STAGE,
  VF_APP_PAGE_RATING,
  VF_APP_PAGE_SOURCE,
  VF_APP_PAGE_APPLIED_AT,
  VF_APP_PAGE_DISQUALIFY,
  VF_APP_PAGE_NOTES,
} from 'src/constants';

// Kept around (even after page layouts were reverted) so Twenty's installer
// doesn't try to cascade-delete viewFields still referenced by the layout
// widgets that haven't been removed yet. Safe to delete in a future version
// once the page layouts are uninstalled.
export default defineView({
  universalIdentifier: VIEW_APPLICATION_RECORD_PAGE_ID,
  name: 'Application Record Page Fields',
  objectUniversalIdentifier: APPLICATION_OBJECT_ID,
  icon: 'IconList',
  type: 'FIELDS_WIDGET' as never,
  position: 0,
  fields: [
    { universalIdentifier: VF_APP_PAGE_LABEL, fieldMetadataUniversalIdentifier: APPLICATION_DISPLAY_LABEL_FIELD_ID, position: 0, isVisible: true },
    { universalIdentifier: VF_APP_PAGE_STAGE, fieldMetadataUniversalIdentifier: APPLICATION_STAGE_FIELD_ID, position: 1, isVisible: true },
    { universalIdentifier: VF_APP_PAGE_RATING, fieldMetadataUniversalIdentifier: APPLICATION_RATING_FIELD_ID, position: 2, isVisible: true },
    { universalIdentifier: VF_APP_PAGE_SOURCE, fieldMetadataUniversalIdentifier: APPLICATION_SOURCE_FIELD_ID, position: 3, isVisible: true },
    { universalIdentifier: VF_APP_PAGE_APPLIED_AT, fieldMetadataUniversalIdentifier: APPLICATION_APPLIED_AT_FIELD_ID, position: 4, isVisible: true },
    { universalIdentifier: VF_APP_PAGE_DISQUALIFY, fieldMetadataUniversalIdentifier: APPLICATION_DISQUALIFY_REASON_FIELD_ID, position: 5, isVisible: true },
    { universalIdentifier: VF_APP_PAGE_NOTES, fieldMetadataUniversalIdentifier: APPLICATION_NOTES_FIELD_ID, position: 6, isVisible: true },
  ],
});
