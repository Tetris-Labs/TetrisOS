import { defineApplication } from 'twenty-sdk';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from './src/roles/default-role';

export default defineApplication({
  universalIdentifier: '5ca0bf1e-7156-416a-9f91-6e20ceef4f9a',
  displayName: 'LinkedIn Enrichment',
  description:
    'Automatically enriches Person records with LinkedIn profile data via Apify when a LinkedIn URL is added.',
  icon: 'IconBrandLinkedin',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  apiClientChecksum: null,
  applicationVariables: {
    APIFY_API_KEY: {
      universalIdentifier: 'd1018a29-86d2-496d-9173-240f1bfdbc17',
      description: 'Apify API key for LinkedIn profile scraping',
      isSecret: true,
      value: '',
    },
    APIFY_ACTOR_ID: {
      universalIdentifier: '25443261-c051-475b-a140-3379c7871cd1',
      description:
        'Apify actor ID for LinkedIn scraping (default: harvestapi~linkedin-profile-scraper)',
      isSecret: false,
      value: 'harvestapi~linkedin-profile-scraper',
    },
  },
});
