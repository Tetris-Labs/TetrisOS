#!/usr/bin/env node
// One-off: backfill transcript field on Meeting records that were imported before
// the transcript pipeline existed. Writes through GraphQL so Twenty converts the
// markdown → blocknote representation (the UI renders from blocknote).
//
// Usage: node backfill-transcripts.mjs <workspaceSchema> <workspaceJwt>

import { spawnSync } from 'node:child_process';

const GRANOLA_API_BASE = 'https://public-api.granola.ai/v1';
const TWENTY_API_URL = 'http://localhost:8080/graphql';
const [WORKSPACE_SCHEMA, WORKSPACE_JWT] = process.argv.slice(2);

if (!WORKSPACE_SCHEMA || !WORKSPACE_JWT) {
  console.error('usage: node backfill-transcripts.mjs <workspaceSchema> <workspaceJwt>');
  process.exit(1);
}

const psql = (sql) => {
  const res = spawnSync(
    'docker',
    ['exec', '-i', 'twenty-db-1', 'psql', '-U', 'postgres', '-d', 'default', '-t', '-A', '-F', '\t', '-c', sql],
    { encoding: 'utf8' },
  );
  if (res.status !== 0) throw new Error(`psql failed: ${res.stderr}`);
  return res.stdout
    .split('\n')
    .filter((l) => l.length > 0)
    .map((l) => l.split('\t'));
};

const gql = async (query, variables) => {
  const res = await fetch(TWENTY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${WORKSPACE_JWT}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(`GraphQL: ${json.errors[0].message}`);
  return json.data;
};

const formatTranscript = (segments) => {
  if (!segments?.length) return '';
  const baseMs = new Date(segments[0].start_time).getTime();
  if (Number.isNaN(baseMs)) return '';
  const pad = (n) => n.toString().padStart(2, '0');
  const toOffset = (iso) => {
    const deltaSec = Math.max(0, Math.floor((new Date(iso).getTime() - baseMs) / 1000));
    const h = Math.floor(deltaSec / 3600);
    const m = Math.floor((deltaSec % 3600) / 60);
    const s = deltaSec % 60;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };
  return segments
    .filter((s) => s.text && s.start_time)
    .map((s) => `[${toOffset(s.start_time)}] ${s.text.trim()}`)
    .join('\n\n');
};

const fetchNote = async (noteId, apiKey) => {
  const res = await fetch(`${GRANOLA_API_BASE}/notes/${noteId}?include=transcript`, {
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Granola ${res.status}: ${await res.text()}`);
  return res.json();
};

console.log(`[${WORKSPACE_SCHEMA}] loading members...`);
const memberRows = psql(`
  SELECT id, "granolaApiKey"
  FROM ${WORKSPACE_SCHEMA}."workspaceMember"
  WHERE "granolaApiKey" IS NOT NULL AND "granolaApiKey" <> '';
`);
const memberKey = Object.fromEntries(memberRows);
console.log(`  found ${memberRows.length} members with Granola keys`);

// Load meetings that don't yet have a populated blocknote. transcriptMarkdown
// may be already set (from the previous SQL-only backfill); we overwrite so the
// blocknote gets regenerated.
const meetingRows = psql(`
  SELECT id, "granolaId", "workspaceMemberId"
  FROM ${WORKSPACE_SCHEMA}."_meeting"
  WHERE "granolaId" IS NOT NULL
    AND ("transcriptBlocknote" IS NULL OR "transcriptBlocknote" = '')
  ORDER BY "createdAt" DESC;
`);
console.log(`  ${meetingRows.length} meetings need backfill\n`);

let done = 0, skipped = 0, failed = 0, empty = 0;

for (const [meetingId, granolaId, workspaceMemberId] of meetingRows) {
  const apiKey = memberKey[workspaceMemberId];
  if (!apiKey) {
    console.log(`skip ${granolaId} — no member API key`);
    skipped++;
    continue;
  }
  try {
    const note = await fetchNote(granolaId, apiKey);
    const markdown = formatTranscript(note.transcript);
    if (!markdown) {
      console.log(`empty ${granolaId} — no transcript available`);
      empty++;
      continue;
    }
    await gql(
      `mutation UpdateMeeting($id: UUID!, $data: MeetingUpdateInput!) {
        updateMeeting(id: $id, data: $data) { id }
      }`,
      {
        id: meetingId,
        data: { transcript: { markdown, blocknote: null } },
      },
    );
    const segCount = note.transcript?.length ?? 0;
    console.log(`ok   ${granolaId} — ${segCount} segments, ${markdown.length} chars`);
    done++;
  } catch (err) {
    console.log(`fail ${granolaId} — ${err.message}`);
    failed++;
  }
}

console.log(`\n${WORKSPACE_SCHEMA}: ${done} updated, ${empty} empty, ${skipped} skipped, ${failed} failed`);
