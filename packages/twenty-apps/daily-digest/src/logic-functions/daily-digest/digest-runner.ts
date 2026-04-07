import {
  fetchAllWorkspaceMembers,
  fetchRecentNotes,
  fetchRecentOpportunities,
  fetchTasksForMember,
} from './crm-client';
import { renderDigestEmail } from './email-renderer';
import { sendEmail } from './email-sender';
import type { DigestResult, UserDigest } from './types';

declare const process: { env: Record<string, string | undefined> };

const getLookbackHours = (): number => Number(process.env.LOOKBACK_HOURS ?? '24');

const shouldSkipEmpty = (): boolean =>
  (process.env.SKIP_EMPTY_DIGESTS ?? 'true').toLowerCase() === 'true';

const getFromEmail = (): string => process.env.EMAIL_FROM ?? 'digest@example.com';
const getFromName = (): string => process.env.EMAIL_FROM_NAME ?? 'Twenty CRM';

const hasContent = (digest: UserDigest): boolean =>
  digest.tasks.length > 0 || digest.notes.length > 0 || digest.opportunities.length > 0;

// End of today in UTC — used so tasks due today are included
const endOfTodayIso = (): string => {
  const todayDate = new Date().toISOString().substring(0, 10);
  return `${todayDate}T23:59:59.999Z`;
};

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

  const todayEnd = endOfTodayIso();

  for (const member of members) {
    // Skip members without a valid email address
    if (!member.userEmail || !member.userEmail.includes('@')) {
      result.skipped++;
      continue;
    }

    // Per-user task query (not done, due on or before end of today)
    let tasks;
    try {
      tasks = await fetchTasksForMember(member.id, todayEnd);
    } catch (err) {
      result.errors.push(
        `${member.userEmail} (tasks): ${err instanceof Error ? err.message : String(err)}`,
      );
      result.skipped++;
      continue;
    }

    const digest: UserDigest = { member, tasks, notes, opportunities };

    if (shouldSkipEmpty() && !hasContent(digest)) {
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
      result.sent++;
    } else {
      result.errors.push(`${member.userEmail}: ${sendResult.error}`);
    }
  }

  return result;
};
