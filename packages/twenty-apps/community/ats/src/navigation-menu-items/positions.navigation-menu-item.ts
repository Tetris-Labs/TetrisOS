import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk';
import { NAV_POSITIONS_ID, VIEW_POSITIONS_ALL_ID } from 'src/constants';

export default defineNavigationMenuItem({
  universalIdentifier: NAV_POSITIONS_ID,
  name: 'positions',
  icon: 'IconBriefcase',
  color: 'blue',
  position: 0,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: VIEW_POSITIONS_ALL_ID,
});
