import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk';
import { NAV_PIPELINE_ID, VIEW_APPLICATIONS_ALL_ID } from 'src/constants';

export default defineNavigationMenuItem({
  universalIdentifier: NAV_PIPELINE_ID,
  name: 'all-applications',
  icon: 'IconUserCheck',
  color: 'purple',
  position: 2,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: VIEW_APPLICATIONS_ALL_ID,
});
