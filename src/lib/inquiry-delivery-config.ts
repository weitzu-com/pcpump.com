export const inquiryRecipient = 'sales@pcpump.com';

// Feishu Admin confirms sales@pcpump.com is an alias of this member mailbox.
// Authentication and the public sender address are separate identities.
const authorizedSmtpAccounts = new Set(['sales@pcpump.com', 'kenny@cnps.net.cn']);

export function smtpConfiguration() {
  const user = process.env.INQUIRY_SMTP_USER?.trim().toLowerCase();
  const pass = process.env.INQUIRY_SMTP_PASSWORD;
  if (!user || !pass || !authorizedSmtpAccounts.has(user)) return null;
  return { host: 'smtp.feishu.cn', port: 465, secure: true as const, auth: { user, pass } };
}

export function inquiryDeliveryReady() {
  return Boolean(process.env.INQUIRY_RECEIVER_URL || smtpConfiguration() || process.env.INQUIRY_WEBHOOK_URL);
}

export function emailNotificationsConfigured() {
  return Boolean((process.env.INQUIRY_MAIL_PROVIDER === 'cloudflare' && process.env.INQUIRY_RECEIVER_URL) || smtpConfiguration());
}
