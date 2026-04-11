import { defineLogicFunction } from 'twenty-sdk';
import type { CronPayload } from 'twenty-sdk';
import {
  fetchWorkspaceMembersWithGranolaKey,
  updateGranolaLastSyncedAt,
  createMeeting,
  findMeetingByGranolaId,
  findPeopleByEmails,
} from './granola-poller/crm-client';
import { fetchNewNotes, fetchNote } from './granola-poller/granola-client';
import type { GranolaAttendee } from './granola-poller/types';

// Emails from this domain belong to Tetris team members and should not be used
// to link meetings to CRM people — we only want to link to external participants.
const INTERNAL_DOMAIN = 'tetrislabs.co';

const isExternal = (attendee: GranolaAttendee): boolean =>
  !!attendee.email && !attendee.email.toLowerCase().endsWith(`@${INTERNAL_DOMAIN}`);

type PollResult = {
  processedMembers: number;
  processedMeetings: number;
  errors: string[];
};

const handler = async (_payload: CronPayload): Promise<PollResult> => {
  const members = await fetchWorkspaceMembersWithGranolaKey();
  const errors: string[] = [];
  let totalMeetings = 0;

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

          // Resolve the primary external attendee and their company
          const externalEmails = (note.attendees ?? [])
            .filter(isExternal)
            .map((a) => a.email);

          let personId: string | undefined;
          let companyId: string | undefined;

          if (externalEmails.length) {
            const people = await findPeopleByEmails(externalEmails);
            if (people.length > 0) {
              personId = people[0].id;
              companyId = people[0].companyId ?? undefined;
            }
          }

          await createMeeting({
            name,
            summaryMarkdown: note.summary_markdown,
            granolaId: note.id,
            meetingDate: note.calendar_event?.scheduled_start_time,
            granolaUrl: note.sharing_url,
            workspaceMemberId: member.id,
            personId,
            companyId,
          });

          totalMeetings++;
        } catch (err) {
          errors.push(`[${memberLabel}] note ${stub.id}: ${String(err)}`);
        }
      }

      await updateGranolaLastSyncedAt(member.id, syncStart);
    } catch (err) {
      errors.push(`[${memberLabel}] sync failed: ${String(err)}`);
    }
  }

  return { processedMembers: members.length, processedMeetings: totalMeetings, errors };
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
