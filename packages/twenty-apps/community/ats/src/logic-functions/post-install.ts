import {
  definePostInstallLogicFunction,
  type InstallPayload,
} from 'twenty-sdk';

declare const process: { env: Record<string, string | undefined> };

const getApiUrl = (): string =>
  (process.env.TWENTY_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

const getToken = (): string => process.env.TWENTY_APP_ACCESS_TOKEN ?? '';

// Twenty's relation picker queries the global `search` endpoint, which only
// returns records whose object has `isSearchable=true` AND a populated
// `searchVector`. The SDK + metadata API don't expose `isSearchable` for
// custom objects, so this app cannot self-fix — it requires direct DB access
// (see setup-search.sh in the app root).
//
// This post-install probe checks whether search is wired up. If not, it logs
// a loud warning so the operator knows to run setup-search.sh.
const handler = async (payload: InstallPayload): Promise<void> => {
  console.log(
    `[ats] post-install running. previousVersion=${payload.previousVersion ?? 'fresh-install'}`,
  );

  try {
    const res = await fetch(`${getApiUrl()}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        query: `{ search(searchInput: "", includedObjectNameSingulars: ["jobPosition"], limit: 1) { edges { node { recordId } } } }`,
      }),
    });

    const json = (await res.json()) as {
      data?: { search?: { edges?: unknown[] } };
    };

    const edges = json.data?.search?.edges ?? [];

    if (edges.length === 0) {
      console.warn(
        [
          '',
          '═══════════════════════════════════════════════════════════════',
          '[ats] WARNING: relation pickers will return "no results"',
          '═══════════════════════════════════════════════════════════════',
          '',
          'Twenty\'s SDK does not expose `isSearchable` for custom objects,',
          'and the metadata API does not accept it either. This means the',
          'Position and Candidate pickers on Application records will appear',
          'empty until you run the one-time setup script:',
          '',
          '    cd packages/twenty-apps/community/ats',
          '    ./setup-search.sh',
          '',
          'The script is idempotent — safe to re-run on every reinstall.',
          '═══════════════════════════════════════════════════════════════',
          '',
        ].join('\n'),
      );
    } else {
      console.log('[ats] search index OK — relation pickers will work.');
    }
  } catch (err) {
    console.warn('[ats] could not probe search endpoint:', err);
  }
};

export default definePostInstallLogicFunction({
  universalIdentifier: '420af5e9-4f51-4e00-8fdc-cda9d5a459a3',
  name: 'post-install',
  description:
    'Probes whether relation pickers are functional after install. Warns the operator if setup-search.sh needs to be run.',
  timeoutSeconds: 30,
  handler,
});
