import { defineLogicFunction } from 'twenty-sdk';
import type { CronPayload } from 'twenty-sdk';
import {
  fetchWorkspaceMembersWithGranolaKey,
  updateGranolaLastSyncedAt,
  createMeeting,
  findMeetingByGranolaId,
  findPeopleByEmails,
  createMeetingParticipant,
  findMeetingParticipant,
} from './granola-poller/crm-client';
import { fetchNewNotes, fetchNote } from './granola-poller/granola-client';
import type { GranolaAttendee } from './granola-poller/types';

// Emails from this domain belong to Tetris team members and should not be used
// to link meetings to CRM people — we only want to link to external participants.
const INTERNAL_DOMAIN = 'tetrislabs.co';

const isExternal = (email: string): boolean =>
  !!email && !email.toLowerCase().endsWith(`@${INTERNAL_DOMAIN}`);

const granolaNoteUrl = (noteId: string): string =>
  `https://app.granola.ai/note/${noteId}`;

type PollResult = {
  processedMembers: number;
  processedMeetings: number;
  fetchedNoteStubs: number;
  errors: string[];
};

const handler = async (_payload: CronPayload): Promise<PollResult> => {
  const members = await fetchWorkspaceMembersWithGranolaKey();
  const errors: string[] = [];
  let totalMeetings = 0;
  let totalNoteStubs = 0;

  for (const member of members) {
    if (!member.granolaApiKey) continue;

    const memberLabel =
      [member.name.firstName, member.name.lastName].filter(Boolean).join(' ') ||
      member.userEmail;

    try {
      const syncStart = new Date().toISOString();
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

          // Resolve all external attendees — used for both company and participants
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
            .filter((email: string) => !!email && isExternal(email));

          const externalPeople = externalAttendeeEmails.length > 0
            ? await findPeopleByEmails(externalAttendeeEmails)
            : [];

          // Use first matched external attendee's company as the meeting company
          const companyId = externalPeople[0]?.companyId ?? undefined;

          const meetingId = await createMeeting({
            name,
            bodyMarkdown: note.summary_markdown,
            granolaId: note.id,
            meetingDate: note.calendar_event?.scheduled_start_time,
            granolaUrl: granolaNoteUrl(note.id),
            workspaceMemberId: member.id,
            companyId,
          });

          // Create participant records for all matched external attendees
          if (externalPeople.length > 0) {
            const participants = externalPeople;
            for (const participant of participants) {
              try {
                const alreadyLinked = await findMeetingParticipant(meetingId, participant.id);
                if (!alreadyLinked) {
                  await createMeetingParticipant(meetingId, participant.id);
                }
              } catch (err) {
                errors.push(
                  `[${memberLabel}] note ${stub.id}: participant ${participant.id}: ${String(err)}`,
                );
              }
            }
          }

          totalMeetings++;
        } catch (err) {
          errors.push(`[${memberLabel}] note ${stub.id}: ${String(err)}`);
        }
      }

      try {
        await updateGranolaLastSyncedAt(member.id, syncStart);
      } catch (err) {
        errors.push(`[${memberLabel}] lastSyncedAt update failed: ${String(err)}`);
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
    "Polls Granola hourly for each workspace member's new meeting notes and syncs them to Twenty as Meeting records linked to the right people and companies.",
  timeoutSeconds: 120,
  handler,
  cronTriggerSettings: {
    pattern: '0 * * * *',
  },
});
