import type { UserDigest } from './types';

declare const process: { env: Record<string, string | undefined> };

const getBaseUrl = (): string =>
  (process.env.TWENTY_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const formatDate = (isoStr: string | null): string => {
  if (!isoStr) return 'No date';
  return new Date(isoStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (amountMicros: number | null, currencyCode: string): string => {
  if (amountMicros == null) return '';
  const amount = amountMicros / 1_000_000;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
};

// A task is overdue if its dueAt is strictly before the start of today (UTC)
const isOverdue = (dueAt: string | null): boolean => {
  if (!dueAt) return false;
  const startOfToday = new Date(new Date().toISOString().substring(0, 10) + 'T00:00:00.000Z');
  return new Date(dueAt) < startOfToday;
};

const renderTasksSection = (tasks: UserDigest['tasks']): string => {
  if (tasks.length === 0) {
    return '<p style="color:#6b7280;margin:0;">No tasks due today or overdue. Keep it up!</p>';
  }

  const rows = tasks
    .map((t) => {
      const overdue = isOverdue(t.dueAt);
      const badge = overdue
        ? '<span style="background:#fee2e2;color:#dc2626;padding:2px 7px;border-radius:4px;font-size:11px;font-weight:600;">OVERDUE</span>'
        : '<span style="background:#fef3c7;color:#d97706;padding:2px 7px;border-radius:4px;font-size:11px;font-weight:600;">DUE TODAY</span>';
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">
            <div style="margin-bottom:4px;">
              <span style="font-weight:600;color:#111827;">${escapeHtml(t.title)}</span>
              &nbsp;${badge}
            </div>
            <div style="color:#6b7280;font-size:13px;">
              Due: ${formatDate(t.dueAt)}&nbsp;&bull;&nbsp;Status: ${escapeHtml(t.status)}
            </div>
          </td>
        </tr>`;
    })
    .join('');

  return `<table style="width:100%;border-collapse:collapse;">${rows}</table>`;
};

const renderNotesSection = (notes: UserDigest['notes']): string => {
  if (notes.length === 0) {
    return '<p style="color:#6b7280;margin:0;">No new notes in the last 24 hours.</p>';
  }

  const visible = notes.slice(0, 5);
  const overflow = notes.length - visible.length;

  const items = visible
    .map(
      (n) =>
        `<li style="margin-bottom:8px;">
          <span style="font-weight:600;color:#111827;">${escapeHtml(n.title ?? 'Untitled note')}</span>
          <span style="color:#6b7280;font-size:13px;">&mdash; ${formatDate(n.createdAt)}</span>
        </li>`,
    )
    .join('');

  const more =
    overflow > 0
      ? `<li style="color:#6b7280;font-size:13px;">&hellip;and ${overflow} more</li>`
      : '';

  return `<ul style="padding-left:20px;margin:0;">${items}${more}</ul>`;
};

const renderOpportunitiesSection = (opps: UserDigest['opportunities']): string => {
  if (opps.length === 0) {
    return '<p style="color:#6b7280;margin:0;">No pipeline updates in the last 24 hours.</p>';
  }

  const visible = opps.slice(0, 8);
  const overflow = opps.length - visible.length;

  const rows = visible
    .map((o) => {
      const amtStr = o.amount
        ? formatCurrency(o.amount.amountMicros, o.amount.currencyCode)
        : '';
      const meta = [
        o.stage,
        amtStr,
        o.closeDate ? `Close: ${formatDate(o.closeDate)}` : '',
      ]
        .filter(Boolean)
        .join(' &bull; ');
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">
            <div style="font-weight:600;color:#111827;">${escapeHtml(o.name)}</div>
            <div style="color:#6b7280;font-size:13px;">${meta}</div>
          </td>
        </tr>`;
    })
    .join('');

  const more =
    overflow > 0
      ? `<tr><td style="color:#6b7280;font-size:13px;padding:8px 0;">&hellip;and ${overflow} more</td></tr>`
      : '';

  return `<table style="width:100%;border-collapse:collapse;">${rows}${more}</table>`;
};

const section = (title: string, icon: string, content: string): string => `
  <div style="margin-bottom:28px;">
    <h3 style="font-size:14px;font-weight:700;color:#374151;margin:0 0 12px;padding-bottom:8px;
               border-bottom:2px solid #f3f4f6;text-transform:uppercase;letter-spacing:0.05em;">
      ${icon}&nbsp; ${title}
    </h3>
    ${content}
  </div>`;

export const renderDigestEmail = (
  digest: UserDigest,
): { subject: string; html: string } => {
  const firstName = digest.member.name.firstName || 'there';
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const baseUrl = getBaseUrl();

  const overdueCount = digest.tasks.filter((t) => isOverdue(t.dueAt)).length;
  const subject =
    overdueCount > 0
      ? `Daily Digest — ${overdueCount} overdue task${overdueCount > 1 ? 's' : ''} need attention`
      : digest.tasks.length > 0
        ? `Daily Digest — ${digest.tasks.length} task${digest.tasks.length > 1 ? 's' : ''} due today`
        : `Daily Digest — ${today}`;

  const summaryParts = [
    digest.tasks.length > 0
      ? `${digest.tasks.length} task${digest.tasks.length !== 1 ? 's' : ''} due/overdue`
      : null,
    digest.notes.length > 0
      ? `${digest.notes.length} new note${digest.notes.length !== 1 ? 's' : ''}`
      : null,
    digest.opportunities.length > 0
      ? `${digest.opportunities.length} pipeline update${digest.opportunities.length !== 1 ? 's' : ''}`
      : null,
  ].filter(Boolean);

  const summaryLine =
    summaryParts.length > 0
      ? summaryParts.join(', ')
      : "Nothing new today — you're all caught up!";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Daily Digest</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto 48px;background:#ffffff;border-radius:8px;
              box-shadow:0 1px 3px rgba(0,0,0,0.1),0 1px 2px rgba(0,0,0,0.06);overflow:hidden;">

    <!-- Header -->
    <div style="background:#111827;padding:24px 32px;">
      <p style="color:#9ca3af;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.08em;">
        Twenty CRM
      </p>
      <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 4px;">Daily Digest</h1>
      <p style="color:#6b7280;font-size:14px;margin:0;">${today}</p>
    </div>

    <!-- Greeting -->
    <div style="padding:28px 32px 0;">
      <p style="color:#374151;font-size:16px;margin:0 0 6px;">Hi ${escapeHtml(firstName)},</p>
      <p style="color:#6b7280;font-size:14px;margin:0 0 28px;">${summaryLine}</p>
    </div>

    <!-- Content sections -->
    <div style="padding:0 32px 8px;">
      ${section('Tasks Due Today &amp; Overdue', '&#128203;', renderTasksSection(digest.tasks))}
      ${section('New Notes (Last 24h)', '&#128221;', renderNotesSection(digest.notes))}
      ${section('Pipeline Updates (Last 24h)', '&#127919;', renderOpportunitiesSection(digest.opportunities))}
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #f3f4f6;
                display:flex;justify-content:space-between;align-items:center;">
      <a href="${baseUrl}" style="color:#4f46e5;text-decoration:none;font-size:13px;font-weight:500;">
        Open Twenty CRM &rarr;
      </a>
      <span style="color:#9ca3af;font-size:12px;">Automated digest</span>
    </div>

  </div>
</body>
</html>`;

  return { subject, html };
};
