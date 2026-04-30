#!/usr/bin/env node
// One-off: re-apply person + company matching to existing Granola meetings using
// the same exclusion rules the live poller now uses.
//
// Usage: node backfill-person-company.mjs <workspaceSchema>

import { spawnSync } from 'node:child_process';

const GRANOLA_API_BASE = 'https://public-api.granola.ai/v1';
const INTERNAL_DOMAINS = ['tetrislabs.co', 'tetristalent.co'];
const [WORKSPACE_SCHEMA] = process.argv.slice(2);

if (!WORKSPACE_SCHEMA) {
  console.error('usage: node backfill-person-company.mjs <workspaceSchema>');
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

const fetchNote = async (noteId, apiKey) => {
  const res = await fetch(`${GRANOLA_API_BASE}/notes/${noteId}?include=transcript`, {
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Granola ${res.status}: ${await res.text()}`);
  return res.json();
};

const isInternalDomain = (domain) =>
  INTERNAL_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`));

const isInternalCompanyDomain = (companyDomain) => {
  if (!companyDomain) return false;
  const lower = companyDomain.toLowerCase();
  return INTERNAL_DOMAINS.some((d) => lower.includes(d));
};

console.log(`[${WORKSPACE_SCHEMA}] loading workspace member emails...`);
const memberEmailRows = psql(`
  SELECT lower("userEmail")
  FROM ${WORKSPACE_SCHEMA}."workspaceMember"
  WHERE "userEmail" IS NOT NULL AND "userEmail" <> '';
`);
const excludedEmails = new Set(memberEmailRows.map(([e]) => e));
console.log(`  ${excludedEmails.size} workspace member emails will be excluded`);

console.log(`[${WORKSPACE_SCHEMA}] loading members with Granola keys...`);
const memberRows = psql(`
  SELECT id, "granolaApiKey"
  FROM ${WORKSPACE_SCHEMA}."workspaceMember"
  WHERE "granolaApiKey" IS NOT NULL AND "granolaApiKey" <> '';
`);
const memberKey = Object.fromEntries(memberRows);
console.log(`  ${memberRows.length} members have Granola keys`);

const meetingRows = psql(`
  SELECT id, "granolaId", "workspaceMemberId"
  FROM ${WORKSPACE_SCHEMA}."_meeting"
  WHERE "granolaId" IS NOT NULL
  ORDER BY "meetingDate" DESC NULLS LAST;
`);
console.log(`  ${meetingRows.length} meetings to evaluate\n`);

let setBoth = 0, setPersonOnly = 0, setNeither = 0, skipped = 0, failed = 0;

for (const [meetingId, granolaId, workspaceMemberId] of meetingRows) {
  const apiKey = memberKey[workspaceMemberId];
  if (!apiKey) {
    skipped++;
    console.log(`skip ${granolaId} — no member API key`);
    continue;
  }

  try {
    const note = await fetchNote(granolaId, apiKey);
    const attendees = note.attendees ?? [];

    const externalEmails = attendees
      .map((a) => a.email)
      .filter((e) => !!e)
      .map((e) => e.toLowerCase())
      .filter((e) => {
        if (excludedEmails.has(e)) return false;
        const domain = e.split('@')[1] ?? '';
        return !isInternalDomain(domain);
      });

    if (externalEmails.length === 0) {
      // No external attendees — clear person/company.
      psql(`
        UPDATE ${WORKSPACE_SCHEMA}."_meeting"
        SET "personId" = NULL, "companyId" = NULL
        WHERE id = '${meetingId}';
      `);
      setNeither++;
      console.log(`none ${granolaId} — no external attendees (cleared)`);
      continue;
    }

    // Quote/escape emails for SQL IN clause
    const emailList = externalEmails.map((e) => `'${e.replace(/'/g, "''")}'`).join(',');
    const personRows = psql(`
      SELECT p.id, p."companyId", c."domainNamePrimaryLinkUrl"
      FROM ${WORKSPACE_SCHEMA}.person p
      LEFT JOIN ${WORKSPACE_SCHEMA}.company c ON c.id = p."companyId"
      WHERE lower(p."emailsPrimaryEmail") IN (${emailList})
      LIMIT 1;
    `);

    if (personRows.length === 0) {
      psql(`
        UPDATE ${WORKSPACE_SCHEMA}."_meeting"
        SET "personId" = NULL, "companyId" = NULL
        WHERE id = '${meetingId}';
      `);
      setNeither++;
      console.log(`none ${granolaId} — external attendees not in CRM (cleared)`);
      continue;
    }

    const [personId, companyId, companyDomain] = personRows[0];
    const finalCompanyId =
      companyId && companyId !== '' && !isInternalCompanyDomain(companyDomain)
        ? companyId
        : null;

    const setCompanySql = finalCompanyId
      ? `"companyId" = '${finalCompanyId}'`
      : `"companyId" = NULL`;

    psql(`
      UPDATE ${WORKSPACE_SCHEMA}."_meeting"
      SET "personId" = '${personId}', ${setCompanySql}
      WHERE id = '${meetingId}';
    `);

    if (finalCompanyId) {
      setBoth++;
      console.log(`ok   ${granolaId} — person+company set`);
    } else {
      setPersonOnly++;
      console.log(`ok   ${granolaId} — person only (company internal/missing)`);
    }
  } catch (err) {
    failed++;
    console.log(`fail ${granolaId} — ${err.message}`);
  }
}

console.log(
  `\n${WORKSPACE_SCHEMA}: ${setBoth} both, ${setPersonOnly} person-only, ${setNeither} none, ${skipped} skipped, ${failed} failed`,
);
