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

export const gql = async <T>(
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

type PendingPerson = {
  id: string;
  linkedinApifyRunId: string;
  linkedinEnrichmentStatus: string;
  updatedAt: string;
  name: { firstName: string; lastName: string };
  jobTitle: string | null;
};

export const fetchPendingPersons = async (): Promise<PendingPerson[]> => {
  const data = await gql<{
    people: { edges: { node: PendingPerson }[] };
  }>(
    `query PendingEnrichment {
      people(
        filter: { linkedinEnrichmentStatus: { eq: PENDING } }
      ) {
        edges {
          node {
            id
            linkedinApifyRunId
            linkedinEnrichmentStatus
            updatedAt
            name { firstName lastName }
            jobTitle
          }
        }
      }
    }`,
  );

  return data.people.edges.map((e) => e.node);
};

export const updatePerson = async (
  personId: string,
  fields: Record<string, unknown>,
): Promise<void> => {
  await gql(
    `mutation UpdatePerson($id: UUID!, $input: PersonUpdateInput!) {
      updatePerson(id: $id, data: $input) { id }
    }`,
    { id: personId, input: fields },
  );
};
