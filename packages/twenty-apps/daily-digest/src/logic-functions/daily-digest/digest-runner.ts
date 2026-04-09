import fs from 'fs';
import path from 'path';
import {
  fetchAllWorkspaceMembers,
  fetchRecentNotes,
  fetchRecentOpportunities,
  fetchTasksForMember,
} from './crm-client';
import { renderDigestEmail } from './email-renderer';
import { sendEmail } from './email-sender';
import type { DigestResult, UserDigest } from './types';

declare const process: { env: Record<string, string | undefined>; cwd: () => string };

// Load app config from env vars OR from config file at known server path
const getAppConfigDir = (): Record<string, string> => {
  // Try config file at known server path or relative to cwd
  const possiblePaths = [
    path.join(process.cwd(), 'src', 'logic-functions', 'app-config.json'),
    '/app/packages/twenty-server/.local-storage/a79acd45-9d8d-42a4-b383-36371deaa6cb/c52865dd-39ca-47f0-ad8b-bc30c22fe16f/built-logic-function/src/logic-functions/app-config.json',
    '/tmp/logic-function-executor/built-logic-function/src/logic-functions/app-config.json',
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'));
  }
  return {
    LOOKBACK_HOURS: process.env.LOOKBACK_HOURS ?? '24',
    SKIP_EMPTY_DIGESTS: process.env.SKIP_EMPTY_DIGESTS ?? 'true',
    EMAIL_FROM: process.env.EMAIL_FROM ?? 'digest@example.com',
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME ?? 'Tetris Digest',
  };
};

const getLookbackHours = (): number => Number(getAppConfigDir().LOOKBACK_HOURS ?? '24');

const shouldSkipEmpty = (): boolean =>
  getAppConfigDir().SKIP_EMPTY_DIGESTS?.toLowerCase() === 'true';

const getFromEmail = (): string => getAppConfigDir().EMAIL_FROM ?? 'digest@example.com';
const getFromName = (): string => getAppConfigDir().EMAIL_FROM_NAME ?? 'Tetris Digest';

const hasContent = (digest: UserDigest): boolean =>
  digest.tasks.length > 0 || digest.notes.length > 0 || digest.opportunities.length > 0;

export const runDailyDigest = async (): Promise<DigestResult> => {
  const result: DigestResult = { sent: 0, skipped: 0, errors: [] };

  const sinceIso = new Date(
    Date.now() - getLookbackHours() * 60 * 60 * 1000,
  ).toISOString();

  // Fetch workspace-wide data once, in parallel
  const [members, notes, opportunities] = await Promise.all([
    fetchAllWorkspaceMembers(),
    fetchRecentNotes(sinceIso),
    fetchRecentOpportunities(sinceIso),
  ]);

  console.log(`Found ${members.length} workspace members to process`);

  for (const member of members) {
    // Skip members without a valid email address
    if (!member.userEmail || !member.userEmail.includes('@')) {
      console.log(`Skipping member ${member.name.firstName} - no valid email`);
      result.skipped++;
      continue;
    }

    // Fetch all active tasks for this member (assigned to them)
    let tasks;
    try {
      tasks = await fetchTasksForMember(member.id);
      console.log(`Found ${tasks.length} active tasks for ${member.name.firstName}`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`Error fetching tasks for ${member.userEmail}: ${errMsg}`);
      result.errors.push(`${member.userEmail} (tasks): ${errMsg}`);
      result.skipped++;
      continue;
    }

    const digest: UserDigest = { member, tasks, notes, opportunities };

    if (shouldSkipEmpty() && !hasContent(digest)) {
      console.log(`Skipping ${member.userEmail} - no content`);
      result.skipped++;
      continue;
    }

    const { subject, html } = renderDigestEmail(digest);

    const sendResult = await sendEmail({
      to: member.userEmail,
      subject,
      html,
      fromEmail: getFromEmail(),
      fromName: getFromName(),
    });

    if (sendResult.ok) {
      console.log(`Sent digest to ${member.userEmail}: ${subject}`);
      result.sent++;
    } else {
      const errMsg = sendResult.error;
      console.error(`Failed to send to ${member.userEmail}: ${errMsg}`);
      result.errors.push(`${member.userEmail}: ${errMsg}`);
    }
  }

  return result;
};