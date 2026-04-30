import type { GranolaNote, GranolaNotesListResponse } from './types';

const GRANOLA_API_BASE = 'https://public-api.granola.ai/v1';

const granolaFetch = async <T>(path: string, apiKey: string): Promise<T> => {
  const res = await fetch(`${GRANOLA_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Granola API ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
};

// Fetch all notes created after sinceIso, paginating through all results.
// sinceIso = null means fetch everything (first sync).
export const fetchNewNotes = async (
  apiKey: string,
  sinceIso: string | null,
): Promise<GranolaNote[]> => {
  const allNotes: GranolaNote[] = [];
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams();
    if (sinceIso) params.set('created_after', sinceIso);
    if (cursor) params.set('cursor', cursor);
    const qs = params.toString();

    const response = await granolaFetch<GranolaNotesListResponse>(
      `/notes${qs ? `?${qs}` : ''}`,
      apiKey,
    );
    allNotes.push(...response.notes);
    cursor = response.hasMore ? response.cursor : undefined;
  } while (cursor);

  return allNotes;
};

// Fetch a single note — includes summary_markdown, calendar_event, and full transcript.
// ?include=transcript is required; without it Granola returns transcript=null.
export const fetchNote = async (noteId: string, apiKey: string): Promise<GranolaNote> => {
  return granolaFetch<GranolaNote>(`/notes/${noteId}?include=transcript`, apiKey);
};
