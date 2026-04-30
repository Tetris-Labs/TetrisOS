import { defineLogicFunction } from 'twenty-sdk';
import type { CronPayload } from 'twenty-sdk';
import {
  fetchWorkspaceMembersWithGranolaKey,
  fetchAllWorkspaceMemberEmails,
  updateGranolaLastSyncedAt,
  createMeeting,
  findMeetingByGranolaId,
  findPeopleByEmails,
} from './granola-poller/crm-client';
import type { PersonRecord } from './granola-poller/crm-client';
import { fetchNewNotes, fetchNote } from './granola-poller/granola-client';
import type {
  GranolaAttendee,
  GranolaTranscriptSegment,
} from './granola-poller/types';

// Domains belonging to the user's own org. Attendees with these emails are
// never matched as the meeting's person, and any matched person whose company
// has one of these domains is dropped from the company link too.
const INTERNAL_DOMAINS = ['tetrislabs.co', 'tetristalent.co'];

const emailDomain = (email: string): string =>
  email.toLowerCase().split('@')[1] ?? '';

const isInternalDomain = (domain: string): boolean =>
  INTERNAL_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`));

const isInternalCompanyDomain = (companyDomain: string | null): boolean => {
  if (!companyDomain) return false;
  const lower = companyDomain.toLowerCase();
  return INTERNAL_DOMAINS.some((d) => lower.includes(d));
};

const granolaNoteUrl = (noteId: string): string =>
  `https://app.granola.ai/note/${noteId}`;

// Format segments as one paragraph per line prefixed with HH:MM:SS offset from
// the first segment's start_time. Double newlines so markdown renders each on
// its own line.
const formatTranscript = (
  segments: GranolaTranscriptSegment[] | null | undefined,
): string => {
  if (!segments || segments.length === 0) return '';
  const baseMs = new Date(segments[0].start_time).getTime();
  if (Number.isNaN(baseMs)) return '';

  const pad = (n: number): string => n.toString().padStart(2, '0');
  const toOffset = (iso: string): string => {
    const deltaSec = Math.max(0, Math.floor((new Date(iso).getTime() - baseMs) / 1000));
    const h = Math.floor(deltaSec / 3600);
    const m = Math.floor((deltaSec % 3600) / 60);
    const s = deltaSec % 60;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  return segments
    .filter((seg) => seg.text && seg.start_time)
    .map((seg) => `[${toOffset(seg.start_time)}] ${seg.text.trim()}`)
    .join('\n\n');
};

type PollResult = {
  processedMembers: number;
  processedMeetings: number;
  fetchedNoteStubs: number;
  errors: string[];
};

const handler = async (_payload: CronPayload): Promise<PollResult> => {
  const members = await fetchWorkspaceMembersWithGranolaKey();
  const allMemberEmails = await fetchAllWorkspaceMemberEmails();
  const excludedEmails = new Set(
    allMemberEmails.map((e) => e.toLowerCase()).filter((e) => !!e),
  );

  const isExternalAttendee = (email: string): boolean => {
    if (!email) return false;
    const lower = email.toLowerCase();
    if (excludedEmails.has(lower)) return false;
    return !isInternalDomain(emailDomain(lower));
  };

  const errors: string[] = [];
  let totalMeetings = 0;
  let totalNoteStubs = 0;

  for (const member of members) {
    if (!member.granolaApiKey) continue;

    const memberLabel =
      [member.name.firstName, member.name.lastName].filter(Boolean).join(' ') ||
      member.userEmail;

    try {
      const noteStubs = await fetchNewNotes(
        member.granolaApiKey,
        member.granolaLastSyncedAt,
      );
      totalNoteStubs += noteStubs.length;

      for (const stub of noteStubs) {
        try {
          const note = await fetchNote(stub.id, member.granolaApiKey);

          if (!note.summary_markdown) continue;

          // Skip if we've already imported this Granola note
          const existing = await findMeetingByGranolaId(note.id);
          if (existing) continue;

          const name =
            note.title ||
            `Meeting - ${new Date(note.created_at).toLocaleDateString('en-US')}`;

          // If the member has a filter domain set, skip meetings with no attendee from that domain
          if (member.granolaFilterDomain) {
            const domain = member.granolaFilterDomain.toLowerCase().replace(/^@/, '');
            const hasMatchingAttendee = (note.attendees ?? []).some(
              (a: GranolaAttendee) => a.email?.toLowerCase().endsWith(`@${domain}`),
            );
            if (!hasMatchingAttendee) continue;
          }

          const externalAttendeeEmails = (note.attendees ?? [])
            .map((a: GranolaAttendee) => a.email)
            .filter((email: string) => isExternalAttendee(email));

          const externalPeople: PersonRecord[] = externalAttendeeEmails.length > 0
            ? await findPeopleByEmails(externalAttendeeEmails)
            : [];

          const primaryPerson = externalPeople[0];
          const personId = primaryPerson?.id;
          // Drop the company link if the matched person's company is one of our own
          const companyId =
            primaryPerson && !isInternalCompanyDomain(primaryPerson.companyDomain)
              ? primaryPerson.companyId ?? undefined
              : undefined;

          const transcriptMarkdown = formatTranscript(note.transcript);

          await createMeeting({
            name,
            bodyMarkdown: note.summary_markdown,
            transcriptMarkdown,
            granolaId: note.id,
            meetingDate: note.calendar_event?.scheduled_start_time,
            granolaUrl: granolaNoteUrl(note.id),
            workspaceMemberId: member.id,
            companyId,
            personId,
          });

          totalMeetings++;
        } catch (err) {
          errors.push(`[${memberLabel}] note ${stub.id}: ${String(err)}`);
        }
      }

      // Advance the watermark to the max created_at of fetched stubs. This way
      // we never advance past a note we haven't actually seen — if Granola hasn't
      // indexed a new note yet, the watermark stays put and we'll retry next run.
      // +1ms because Granola's created_after filter is strict (>); without it, a
      // note whose created_at exactly equals the watermark would be skipped.
      if (noteStubs.length > 0) {
        const maxCreatedAtMs = Math.max(
          ...noteStubs.map((s) => new Date(s.created_at).getTime()),
        );
        if (Number.isFinite(maxCreatedAtMs)) {
          const newWatermark = new Date(maxCreatedAtMs + 1).toISOString();
          try {
            await updateGranolaLastSyncedAt(member.id, newWatermark);
          } catch (err) {
            errors.push(`[${memberLabel}] lastSyncedAt update failed: ${String(err)}`);
          }
        }
      }
    } catch (err) {
      errors.push(`[${memberLabel}] sync failed: ${String(err)}`);
    }
  }

  return {
    processedMembers: members.length,
    processedMeetings: totalMeetings,
    fetchedNoteStubs: totalNoteStubs,
    errors,
  };
};

export default defineLogicFunction({
  universalIdentifier: 'c4e9c702-64a2-4081-90c4-3ffb75323a0e',
  name: 'granola-poller',
  description:
    "Polls Granola every 5 minutes for each workspace member's new meeting notes and syncs them to Twenty as Meeting records linked to the right people and companies.",
  timeoutSeconds: 120,
  handler,
  cronTriggerSettings: {
    pattern: '*/5 * * * *',
  },
});
