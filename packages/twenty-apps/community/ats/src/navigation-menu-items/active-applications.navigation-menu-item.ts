import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk';
import { NAV_ACTIVE_ID, VIEW_APPLICATIONS_ACTIVE_ID } from 'src/constants';

export default defineNavigationMenuItem({
  universalIdentifier: NAV_ACTIVE_ID,
  name: 'active-applications',
  icon: 'IconFlame',
  color: 'orange',
  position: 1,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: VIEW_APPLICATIONS_ACTIVE_ID,
});
