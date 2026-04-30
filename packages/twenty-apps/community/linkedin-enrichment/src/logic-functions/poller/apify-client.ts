declare const process: { env: Record<string, string | undefined> };

const getApifyKey = (): string => {
  const key = process.env.APIFY_API_KEY ?? '';
  if (!key) throw new Error('APIFY_API_KEY is not set');
  return key;
};

type ApifyRunStatus =
  | 'READY'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'ABORTING'
  | 'ABORTED'
  | 'TIMED-OUT';

type ApifyRunInfo = {
  id: string;
  status: ApifyRunStatus;
  startedAt: string | null;
  finishedAt: string | null;
  defaultDatasetId: string;
};

export type LinkedInProfile = {
  id?: string;
  publicIdentifier?: string;
  linkedinUrl?: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  photo?: string;
  about?: string;
  location?: {
    linkedinText?: string;
    parsed?: {
      city?: string;
      state?: string;
      country?: string;
    };
  };
  openToWork?: boolean;
  websites?: string[];
  connectionsCount?: number;
  followerCount?: number;
  currentPosition?: {
    position?: string;
    companyName?: string;
    duration?: string;
    description?: string;
    startDate?: { month?: string; year?: number; text?: string };
    endDate?: { month?: string; year?: number; text?: string };
  }[];
  experience?: {
    position?: string;
    companyName?: string;
    employmentType?: string;
    workplaceType?: string;
    duration?: string;
    description?: string;
    startDate?: { month?: string; year?: number; text?: string };
    endDate?: { month?: string; year?: number; text?: string };
  }[];
  education?: {
    schoolName?: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: { month?: string; year?: number; text?: string };
    endDate?: { month?: string; year?: number; text?: string };
    insights?: string;
  }[];
  skills?: {
    name?: string;
    endorsements?: string;
    assessments?: string;
  }[];
  certifications?: {
    title?: string;
    issuedBy?: string;
    issuedAt?: string;
    link?: string;
  }[];
  honorsAndAwards?: {
    title?: string;
    issuedBy?: string;
    issuedAt?: string;
    description?: string;
  }[];
  projects?: {
    title?: string;
    description?: string;
    startDate?: { text?: string } | null;
    endDate?: { text?: string } | null;
  }[];
  receivedRecommendations?: {
    givenBy?: string;
    givenByHeadline?: string;
    givenAt?: string;
    description?: string;
    givenByLink?: string;
  }[];
  languages?: {
    name?: string;
  }[];
};

export const getRunStatus = async (
  runId: string,
): Promise<ApifyRunInfo> => {
  const res = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}?token=${getApifyKey()}`,
  );

  if (!res.ok) {
    throw new Error(`Apify run status HTTP ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as { data: ApifyRunInfo };
  return json.data;
};

export const getDatasetItems = async (
  datasetId: string,
): Promise<LinkedInProfile[]> => {
  const res = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${getApifyKey()}`,
  );

  if (!res.ok) {
    throw new Error(`Apify dataset HTTP ${res.status}: ${await res.text()}`);
  }

  return (await res.json()) as LinkedInProfile[];
};
