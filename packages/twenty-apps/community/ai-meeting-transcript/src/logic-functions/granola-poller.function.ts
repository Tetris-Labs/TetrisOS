import { defineLogicFunction } from 'twenty-sdk';
import type { CronPayload } from 'twenty-sdk';
import {
  fetchWorkspaceMembersWithGranolaKey,
  fetchWorkspaceMemberEmails,
  updateGranolaLastSyncedAt,
  createMeeting,
  updateMeeting,
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

const isExternalParticipantEmail = (
  email: string,
  workspaceMemberEmails: Set<string>,
): boolean => {
  const normalizedEmail = email.trim().toLowerCase();

  return (
    !!normalizedEmail &&
    !normalizedEmail.endsWith(`@${INTERNAL_DOMAIN}`) &&
    !workspaceMemberEmails.has(normalizedEmail)
  );
};

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
  const workspaceMemberEmails = new Set(await fetchWorkspaceMemberEmails());
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

          const existing = await findMeetingByGranolaId(note.id);

          const name =
            note.title ||
            `Meeting - ${new Date(note.created_at).toLocaleDateString('en-US')}`;

          let companyId: string | undefined;

          // Resolve all external attendees for participants
          const externalAttendeeEmails = (note.attendees ?? [])
            .map((a: GranolaAttendee) => a.email)
            .filter((email: string) =>
              !!email && isExternalParticipantEmail(email, workspaceMemberEmails),
            );

          // Use the first matched external attendee to infer the company on the meeting.
          if (externalAttendeeEmails.length > 0) {
            const people = await findPeopleByEmails(externalAttendeeEmails);
            if (people.length > 0) {
              companyId = people[0].companyId ?? undefined;
            }
          }

          const meetingId = existing
            ? existing.id
            : await createMeeting({
                name,
                bodyMarkdown: note.summary_markdown,
                granolaId: note.id,
                meetingDate: note.calendar_event?.scheduled_start_time,
                granolaUrl: granolaNoteUrl(note.id),
                workspaceMemberId: member.id,
                companyId,
              });

          if (existing) {
            await updateMeeting({
              id: existing.id,
              companyId,
            });
          }

          // Create participant records for all matched external attendees
          if (externalAttendeeEmails.length > 0) {
            const participants = await findPeopleByEmails(externalAttendeeEmails);
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
