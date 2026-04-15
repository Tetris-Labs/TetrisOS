export type WorkspaceMemberWithGranola = {
  id: string;
  name: { firstName: string; lastName: string };
  userEmail: string;
  granolaApiKey: string | null;
  granolaLastSyncedAt: string | null;
  granolaFilterDomain: string | null;
};

export type GranolaAttendee = {
  name?: string;
  email: string;
};

export type GranolaCalendarEvent = {
  event_title?: string;
  scheduled_start_time?: string;
  scheduled_end_time?: string;
  organiser?: string;
  calendar_event_id?: string;
};

export type GranolaNote = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  owner?: { name?: string; email?: string };
  summary_markdown?: string;
  // URL to view the note in the Granola web app
  sharing_url?: string;
  calendar_event?: GranolaCalendarEvent;
  attendees?: GranolaAttendee[];
};

export type GranolaNotesListResponse = {
  notes: GranolaNote[];
  hasMore: boolean;
  cursor?: string;
};
