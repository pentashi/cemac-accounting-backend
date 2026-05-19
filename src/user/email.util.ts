import nodemailer from 'nodemailer';

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }
  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const host = process.env.MAIL_HOST;
  const port = Number.parseInt(process.env.MAIL_PORT ?? '587', 10);
  if (!host || !Number.isFinite(port)) {
    return;
  }

  const secure = parseBool(process.env.MAIL_SECURE, port === 465);
  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth:
      process.env.MAIL_USERNAME && process.env.MAIL_PASSWORD
        ? {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
          }
        : undefined,
  });
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  const fromAddress =
    process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME;
  if (!fromAddress) {
    return;
  }
  const from = process.env.MAIL_FROM_NAME
    ? `${process.env.MAIL_FROM_NAME} <${fromAddress}>`
    : fromAddress;

  await transport.sendMail({
    from,
    to: email,
    subject: 'Password Reset Request',
    text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
    html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Reset Password</a></p>`,
  });
}
