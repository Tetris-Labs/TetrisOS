import type { WorkspaceMemberWithGranola } from './types';

declare const process: { env: Record<string, string | undefined> };

type GqlResponse<T> = {
  data: T;
  errors?: { message: string }[];
};

const getApiUrl = (): string =>
  (process.env.TWENTY_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

const getToken = (): string => {
  const token = process.env.TWENTY_APP_ACCESS_TOKEN ?? '';
  if (!token) throw new Error('TWENTY_APP_ACCESS_TOKEN is not set');
  return token;
};

const gql = async <T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> => {
  const res = await fetch(`${getApiUrl()}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ query, variables: variables ?? {} }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL HTTP ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as GqlResponse<T>;
  if (json.errors?.length) {
    throw new Error(`GraphQL error: ${json.errors[0].message}`);
  }
  return json.data;
};

// --- Workspace Members ---

type WorkspaceMembersResponse = {
  workspaceMembers: {
    edges: { node: WorkspaceMemberWithGranola }[];
  };
};

export const fetchWorkspaceMembersWithGranolaKey =
  async (): Promise<WorkspaceMemberWithGranola[]> => {
    const data = await gql<WorkspaceMembersResponse>(`
    query FetchWorkspaceMembersWithGranolaKey {
      workspaceMembers(
        filter: { granolaApiKey: { isNullable: false, neq: "" } }
      ) {
        edges {
          node {
            id
            name { firstName lastName }
            userEmail
            granolaApiKey
            granolaLastSyncedAt
          }
        }
      }
    }
  `);
    return data.workspaceMembers.edges.map((e) => e.node);
  };

export const updateGranolaLastSyncedAt = async (
  workspaceMemberId: string,
  granolaLastSyncedAt: string,
): Promise<void> => {
  await gql(
    `
    mutation UpdateWorkspaceMemberGranolaSync($id: UUID!, $granolaLastSyncedAt: DateTime!) {
      updateWorkspaceMember(id: $id, data: { granolaLastSyncedAt: $granolaLastSyncedAt }) {
        id
      }
    }
  `,
    { id: workspaceMemberId, granolaLastSyncedAt },
  );
};

// --- People / Companies ---

type PersonRecord = { id: string; companyId: string | null };
type PeopleResponse = {
  people: { edges: { node: PersonRecord }[] };
};

export const findPeopleByEmails = async (emails: string[]): Promise<PersonRecord[]> => {
  if (!emails.length) return [];
  const data = await gql<PeopleResponse>(
    `
    query FindPeopleByEmails($emails: [String!]!) {
      people(
        filter: { emails: { primaryEmail: { in: $emails } } }
        first: 20
      ) {
        edges { node { id companyId } }
      }
    }
  `,
    { emails },
  );
  return data.people.edges.map((e) => e.node);
};

// --- Meetings ---

type MeetingRecord = { id: string };
type MeetingsResponse = {
  meetings: { edges: { node: MeetingRecord }[] };
};

export const findMeetingByGranolaId = async (
  granolaId: string,
): Promise<MeetingRecord | null> => {
  const data = await gql<MeetingsResponse>(
    `
    query FindMeetingByGranolaId($granolaId: String!) {
      meetings(filter: { granolaId: { eq: $granolaId } }, first: 1) {
        edges { node { id } }
      }
    }
  `,
    { granolaId },
  );
  return data.meetings.edges[0]?.node ?? null;
};

export type CreateMeetingInput = {
  name: string;
  summaryMarkdown: string;
  granolaId: string;
  meetingDate?: string;
  granolaUrl?: string;
  workspaceMemberId?: string;
  personId?: string;
  companyId?: string;
};

type CreateMeetingResponse = {
  createMeeting: { id: string };
};

export const createMeeting = async (input: CreateMeetingInput): Promise<string> => {
  const data: Record<string, unknown> = {
    name: input.name,
    summary: { markdown: input.summaryMarkdown, blocknote: null },
    granolaId: input.granolaId,
    source: 'GRANOLA',
  };

  if (input.meetingDate) data.meetingDate = input.meetingDate;
  if (input.granolaUrl) {
    data.granolaUrl = {
      primaryLinkUrl: input.granolaUrl,
      primaryLinkLabel: 'Granola',
      secondaryLinks: null,
    };
  }
  if (input.workspaceMemberId) data.workspaceMemberId = input.workspaceMemberId;
  if (input.personId) data.personId = input.personId;
  if (input.companyId) data.companyId = input.companyId;

  const res = await gql<CreateMeetingResponse>(
    `
    mutation CreateMeeting($data: MeetingCreateInput!) {
      createMeeting(data: $data) {
        id
      }
    }
  `,
    { data },
  );

  return res.createMeeting.id;
};
