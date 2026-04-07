// Generic GraphQL response envelope
export type GqlResponse<T> = {
  data: T;
  errors?: Array<{ message: string; extensions?: { code?: string } }>;
};

// Workspace member returned from the workspaceMembers query
export type WorkspaceMember = {
  id: string;
  name: { firstName: string; lastName: string };
  userEmail: string | null;
  locale: string | null;
  timeZone: string | null;
};

export type WorkspaceMembersResponse = {
  workspaceMembers: {
    edges: Array<{ node: WorkspaceMember }>;
  };
};

// Task assigned to a workspace member
export type Task = {
  id: string;
  title: string;
  status: string;
  dueAt: string | null;
  body: string | null;
};

export type TasksResponse = {
  tasks: {
    edges: Array<{ node: Task }>;
  };
};

// Note created within the lookback window
export type Note = {
  id: string;
  title: string | null;
  createdAt: string;
  body: { markdown: string | null } | null;
};

export type NotesResponse = {
  notes: {
    edges: Array<{ node: Note }>;
  };
};

// Opportunity updated within the lookback window
export type Opportunity = {
  id: string;
  name: string;
  stage: string;
  closeDate: string | null;
  amount: { amountMicros: number | null; currencyCode: string } | null;
  updatedAt: string;
};

export type OpportunitiesResponse = {
  opportunities: {
    edges: Array<{ node: Opportunity }>;
  };
};

// Per-user digest bundle passed to the renderer
export type UserDigest = {
  member: WorkspaceMember;
  // Tasks overdue or due today assigned to this user, excluding DONE status
  tasks: Task[];
  // Workspace-wide notes created in the lookback window
  notes: Note[];
  // Workspace-wide opportunities updated in the lookback window
  opportunities: Opportunity[];
};

// Result returned by runDailyDigest
export type DigestResult = {
  sent: number;
  skipped: number;
  errors: string[];
};
