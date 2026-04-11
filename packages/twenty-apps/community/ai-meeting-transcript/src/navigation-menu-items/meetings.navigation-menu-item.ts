import { defineNavigationMenuItem } from 'twenty-sdk';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { MEETING_OBJECT_UNIVERSAL_IDENTIFIER } from '../objects/meeting.object';

export default defineNavigationMenuItem({
  universalIdentifier: 'a1b2c3d4-0001-4e5f-9a8b-7c6d5e4f3a2b',
  position: 0,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: MEETING_OBJECT_UNIVERSAL_IDENTIFIER,
});
