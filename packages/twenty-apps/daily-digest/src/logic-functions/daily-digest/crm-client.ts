import type {
  GqlResponse,
  Note,
  NotesResponse,
  Opportunity,
  OpportunitiesResponse,
  Task,
  TasksResponse,
  WorkspaceMember,
  WorkspaceMembersResponse,
} from './types';

declare const process: { env: Record<string, string | undefined> };

const getApiUrl = (): string =>
  (process.env.TWENTY_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

const getToken = (): string => {
  const token = process.env.TWENTY_APP_ACCESS_TOKEN ?? '';
  if (!token) throw new Error('TWENTY_APP_ACCESS_TOKEN is not set');
  return token;
};

const gql = async <T>(query: string, variables?: Record<string, unknown>): Promise<T> => {
  const url = `${getApiUrl()}/graphql`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ query, variables: variables ?? {} }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GraphQL HTTP ${res.status}: ${text}`);
  }

  const json = (await res.json()) as GqlResponse<T>;
  if (json.errors?.length) {
    throw new Error(`GraphQL error: ${json.errors[0].message}`);
  }
  return json.data;
};

export const fetchAllWorkspaceMembers = async (): Promise<WorkspaceMember[]> => {
  const data = await gql<WorkspaceMembersResponse>(`
    query FetchWorkspaceMembers {
      workspaceMembers(orderBy: { name: { firstName: AscNullsLast } }) {
        edges {
          node {
            id
            name { firstName lastName }
            userEmail
            locale
            timeZone
          }
        }
      }
    }
  `);
  return data.workspaceMembers.edges.map((e) => e.node);
};

// Fetch all active tasks for a specific workspace member (assignee)
// Includes: URGENT priority, overdue, due today, due this week, and tasks with no due date
export const fetchTasksForMember = async (memberId: string): Promise<Task[]> => {
  // Get all non-DONE, non-CANCELLED tasks assigned to this member
  const data = await gql<TasksResponse>(
    `
    query FetchTasksForMember($memberId: UUID!) {
      tasks(
        filter: {
          assigneeId: { eq: $memberId }
        }
        orderBy: { dueAt: AscNullsLast }
      ) {
        edges {
          node {
            id
            title
            status
            dueAt
            bodyV2 { markdown }
          }
        }
      }
    }
  `,
    { memberId },
  );
  return data.tasks.edges
    .map((e) => e.node)
    .filter((task) => task.status !== 'DONE' && task.status !== 'CANCELLED' && task.status !== 'ARCHIVED')
    .sort((a, b) => {
      if (a.dueAt && b.dueAt) return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
      if (a.dueAt) return -1;
      if (b.dueAt) return 1;
      return 0;
    });
};

// Fetch workspace-wide notes created within the lookback window.
export const fetchRecentNotes = async (sinceIso: string): Promise<Note[]> => {
  const data = await gql<NotesResponse>(
    `
    query FetchRecentNotes($since: DateTime!) {
      notes(
        filter: { createdAt: { gte: $since } }
        orderBy: { createdAt: DescNullsLast }
        first: 20
      ) {
        edges {
          node {
            id
            title
            createdAt
            bodyV2 { markdown }
          }
        }
      }
    }
  `,
    { since: sinceIso },
  );
  return data.notes.edges.map((e) => e.node);
};

// Fetch workspace-wide opportunities updated within the lookback window.
export const fetchRecentOpportunities = async (sinceIso: string): Promise<Opportunity[]> => {
  const data = await gql<OpportunitiesResponse>(
    `
    query FetchRecentOpportunities($since: DateTime!) {
      opportunities(
        filter: { updatedAt: { gte: $since } }
        orderBy: { updatedAt: DescNullsLast }
        first: 30
      ) {
        edges {
          node {
            id
            name
            stage
            closeDate
            amount { amountMicros currencyCode }
            updatedAt
          }
        }
      }
    }
  `,
    { since: sinceIso },
  );
  return data.opportunities.edges.map((e) => e.node);
};