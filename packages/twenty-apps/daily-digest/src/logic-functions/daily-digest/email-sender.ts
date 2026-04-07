import nodemailer from 'nodemailer';

declare const process: { env: Record<string, string | undefined> };

export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  fromEmail: string;
  fromName: string;
};

export type SendResult = { ok: true } | { ok: false; error: string };

const getTransport = (): nodemailer.Transporter => {
  const host = process.env.SMTP_HOST ?? '';
  if (!host) throw new Error('SMTP_HOST is not configured');

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth:
      process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS ?? '',
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
