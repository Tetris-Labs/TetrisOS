import { generateDigestEmail } from './email-sender';
import type { UserDigest } from './types';

const isOverdue = (dueAt: string | null, status: string): boolean => {
  if (!dueAt || status === 'DONE' || status === 'CANCELLED') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueAt) < today;
};

const isDueToday = (dueAt: string | null, status: string): boolean => {
  if (!dueAt || status === 'DONE' || status === 'CANCELLED') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const due = new Date(dueAt);
  return due >= today && due < tomorrow;
};

const isDueSoon = (dueAt: string | null, status: string): boolean => {
  if (!dueAt || status === 'DONE' || status === 'CANCELLED') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const due = new Date(dueAt);
  return due > today && due <= nextWeek;
};

export const renderDigestEmail = (
  digest: UserDigest,
): { subject: string; html: string } => {
  const firstName = digest.member.name.firstName || 'there';
  
  // 🚨 Urgent Priority: only URGENT priority (regardless of due date)
  const urgentTasks = digest.tasks.filter((t) => 
    t.priority === 'URGENT' && t.status !== 'DONE' && t.status !== 'CANCELLED'
  );
  
  // ⚠️ Overdue: due date has passed OR due today - include ALL priorities (except URGENT which is shown above)
  const overdueTasks = digest.tasks.filter((t) => 
    (isOverdue(t.dueAt, t.status) || isDueToday(t.dueAt, t.status)) &&
    t.status !== 'DONE' && t.status !== 'CANCELLED' &&
    t.priority !== 'URGENT' // already shown in urgent
  );
  
  // 📅 Coming Up: due in next 7 days - NOT overdue, NOT urgent
  const comingUpTasks = digest.tasks.filter((t) => 
    !isOverdue(t.dueAt, t.status) && 
    !isDueToday(t.dueAt, t.status) &&
    isDueSoon(t.dueAt, t.status) &&
    t.status !== 'DONE' && t.status !== 'CANCELLED' &&
    t.priority !== 'URGENT'
  );

  // Generate subject
  const urgentCount = urgentTasks.length;
  const overdueCount = overdueTasks.length;
  
  let subject: string;
  if (urgentCount > 0) {
    subject = `🚨 You have ${urgentCount} urgent task${urgentCount > 1 ? 's' : ''}!`;
  } else if (overdueCount > 0) {
    subject = `⚠️ ${overdueCount} overdue task${overdueCount > 1 ? 's' : ''} need attention`;
  } else if (comingUpTasks.length > 0) {
    subject = `📋 Your Daily Digest — ${comingUpTasks.length} upcoming task${comingUpTasks.length > 1 ? 's' : ''}`;
  } else {
    subject = `✨ Your Daily Digest — All caught up!`;
  }

  // Generate HTML using the new beautiful template
  const html = generateDigestEmail(firstName, urgentTasks, overdueTasks, comingUpTasks);

  return { subject, html };
};