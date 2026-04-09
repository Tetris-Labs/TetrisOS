import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

declare const process: { env: Record<string, string | undefined>; cwd: () => string };

// Load SMTP config from env vars OR from a config file
const getSmtpConfig = (): { host: string; port: number; secure: boolean; user?: string; pass?: string } => {
  // Try env vars first
  const host = process.env.SMTP_HOST ?? '';
  if (host) {
    return {
      host,
      port: Number(process.env.SMTP_PORT ?? '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    };
  }
  // Try config file fallback at known server path
  const possiblePaths = [
    path.join(process.cwd(), 'src', 'logic-functions', 'smtp-config.json'),
    '/app/packages/twenty-server/.local-storage/a79acd45-9d8d-42a4-b383-36371deaa6cb/c52865dd-39ca-47f0-ad8b-bc30c22fe16f/built-logic-function/src/logic-functions/smtp-config.json',
    '/tmp/logic-function-executor/built-logic-function/src/logic-functions/smtp-config.json',
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  }
  throw new Error('SMTP_HOST is not configured');
};

export type Task = {
  id: string;
  title: string;
  status: string;
  dueAt: string | null;
  body?: string | null;
  priority?: string | null;
};

export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  fromEmail: string;
  fromName: string;
};

export type SendResult = { ok: true } | { ok: false; error: string };

const getTransport = (): nodemailer.Transporter => {
  const config = getSmtpConfig();

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user
      ? {
          user: config.user,
          pass: config.pass ?? '',
        }
      : undefined,
  });
};

export const sendEmail = async (params: SendEmailParams): Promise<SendResult> => {
  try {
    const transporter = getTransport();
    await transporter.sendMail({
      from: `"${params.fromName}" <${params.fromEmail}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return 'No date';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isOverdue = (dueAt: string | null): boolean => {
  if (!dueAt) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueAt) < today;
};

const isDueToday = (dueAt: string | null): boolean => {
  if (!dueAt) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const due = new Date(dueAt);
  return due >= today && due < tomorrow;
};

const isDueSoon = (dueAt: string | null): boolean => {
  if (!dueAt) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const due = new Date(dueAt);
  return due > today && due <= nextWeek;
};

const getPriorityColor = (priority: string | null | undefined): { bg: string; text: string; label: string } => {
  switch (priority) {
    case 'URGENT':
      return { bg: '#FEE2E2', text: '#DC2626', label: 'Urgent' };
    case 'HIGH':
      return { bg: '#FEF3C7', text: '#D97706', label: 'High' };
    case 'MEDIUM':
      return { bg: '#DBEAFE', text: '#1D4ED8', label: 'Medium' };
    case 'LOW':
      return { bg: '#D1FAE5', text: '#059669', label: 'Low' };
    default:
      return { bg: '#F3F4F6', text: '#6B7280', label: 'Normal' };
  }
};

const getStatusColor = (status: string): { bg: string; text: string; label: string } => {
  switch (status) {
    case 'TODO':
      return { bg: '#FEF3C7', text: '#92400E', label: 'To Do' };
    case 'IN_PROGRESS':
      return { bg: '#DBEAFE', text: '#1E40AF', label: 'In Progress' };
    case 'DONE':
      return { bg: '#D1FAE5', text: '#065F46', label: 'Done' };
    case 'CANCELLED':
      return { bg: '#F3F4F6', text: '#6B7280', label: 'Cancelled' };
    default:
      return { bg: '#F3F4F6', text: '#6B7280', label: status };
  }
};

const generateTaskRow = (task: Task): string => {
  const priorityStyle = getPriorityColor(task.priority);
  const statusStyle = getStatusColor(task.status);
  const overdue = task.status === 'TODO' && isOverdue(task.dueAt);
  const dueToday = task.status === 'TODO' && isDueToday(task.dueAt);
  
  let dueDateStr = '';
  if (task.dueAt) {
    if (overdue) dueDateStr = `Was due: ${formatDate(task.dueAt)}`;
    else if (dueToday) dueDateStr = 'Due today';
    else dueDateStr = `Due: ${formatDate(task.dueAt)}`;
  }
  
  return `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6;">
        <div style="font-size: 14px; font-weight: 500; color: #1f2937; margin-bottom: 4px;">
          ${task.title}
          ${task.priority === 'URGENT' ? '<span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; background-color: #FEE2E2; color: #DC2626; margin-left: 8px;">URGENT</span>' : ''}
        </div>
        ${dueDateStr ? `<div style="font-size: 12px; color: ${overdue ? '#DC2626' : '#6b7280'};">${dueDateStr}</div>` : ''}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; text-align: right;">
        <span style="display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background-color: ${statusStyle.bg}; color: ${statusStyle.text};">${statusStyle.label}</span>
      </td>
    </tr>
  `;
};

const generateSection = (title: string, tasks: Task[], color: string, icon: string): string => {
  if (tasks.length === 0) {
    return `
    <tr>
      <td style="padding: 0 24px;">
        <div style="margin-bottom: 12px;">
          <span style="display: inline-block; width: 4px; height: 20px; background-color: ${color}; border-radius: 2px; vertical-align: middle; margin-right: 8px;"></span>
          <span style="font-size: 14px; font-weight: 600; color: #374151; vertical-align: middle;">${icon} ${title}</span>
        </div>
        <div style="background-color: #f9fafb; border: 1px dashed #d1d5db; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">No items in this category 🎉</p>
        </div>
      </td>
    </tr>
    `;
  }
  
  const taskRows = tasks.map(generateTaskRow).join('');
  
  return `
    <tr>
      <td style="padding: 0 24px;">
        <div style="margin-bottom: 12px;">
          <span style="display: inline-block; width: 4px; height: 20px; background-color: ${color}; border-radius: 2px; vertical-align: middle; margin-right: 8px;"></span>
          <span style="font-size: 14px; font-weight: 600; color: #374151; vertical-align: middle;">${icon} ${title}</span>
          <span style="margin-left: 8px; background-color: ${color}20; color: ${color}; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 500;">${tasks.length}</span>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
          ${taskRows}
        </table>
      </td>
    </tr>
  `;
};

export const generateDigestEmail = (
  name: string,
  urgentTasks: Task[],
  overdueTasks: Task[],
  comingUpTasks: Task[]
): string => {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const totalActive = urgentTasks.length + overdueTasks.length + comingUpTasks.length;
  
  const urgentSection = generateSection('Urgent Priority', urgentTasks, '#DC2626', '🚨');
  const overdueSection = generateSection('Overdue', overdueTasks, '#F59E0B', '⚠️');
  const comingUpSection = generateSection('Coming Up', comingUpTasks, '#059669', '📅');

  const hasNoTasks = totalActive === 0;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Daily Digest</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6C2BD9 0%, #8B5CF6 100%); padding: 32px 24px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="https://www.tetrislabs.co/favicon.ico" alt="Tetris OS" width="48" height="48" style="display: block; margin-bottom: 12px;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Tetris OS</h1>
                    <p style="color: rgba(255, 255, 255, 0.8); margin: 8px 0 0 0; font-size: 14px;">Daily Task Digest</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Date & Summary -->
          <tr>
            <td style="padding: 24px 24px 0 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin: 0 0 4px 0;">Hey ${name || 'there'}! 👋</h2>
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">${today}</p>
                  </td>
                  <td align="right">
                    <div style="background-color: ${totalActive > 0 ? '#6C2BD9' : '#10B981'}; color: #ffffff; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                      ${totalActive > 0 ? `${totalActive} active` : 'All clear'}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 16px 0 0 0;">
              ${hasNoTasks ? `
              <tr>
                <td style="padding: 40px 24px; text-align: center;">
                  <div style="font-size: 48px; margin-bottom: 16px;">✨</div>
                  <h3 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">You're all caught up!</h3>
                  <p style="color: #6b7280; font-size: 14px; margin: 0;">No pending tasks. Enjoy your day!</p>
                </td>
              </tr>
              ` : `
              ${urgentSection}
              ${overdueSection}
              ${comingUpSection}
              `}
            </td>
          </tr>
          
          <!-- View All Tasks Button -->
          <tr>
            <td style="padding: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://ops.tetrislabs.co/objects/tasks?viewId=6e378e81-4eee-4994-8010-6b9a83ff8d37" style="display: inline-block; background-color: #6C2BD9; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 600;">View All Tasks →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">Powered by Tetris OS 🧩</p>
              <p style="color: #d1d5db; font-size: 11px; margin: 8px 0 0 0;">Tetris Labs — Turn how your team works into AI-powered systems</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};