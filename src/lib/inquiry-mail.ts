import nodemailer from 'nodemailer';
import { inquiryRecipient, smtpConfiguration } from './inquiry-delivery-config';

export type EngineeringMail = {
  reference: string;
  system: string;
  fields: Record<string, string>;
  selection: Record<string, string>;
  receivedAt: string;
};

export async function sendEngineeringMail(inquiry: EngineeringMail) {
  const config = smtpConfiguration();
  if (!config) throw new Error('SMTP configuration is unavailable.');
  const transport = nodemailer.createTransport({
    ...config,
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
    disableFileAccess: true,
    disableUrlAccess: true,
    logger: false,
    debug: false,
  });
  try {
    const result = await transport.sendMail({
      from: { name: 'PCPUMP Website', address: inquiryRecipient },
      to: inquiryRecipient,
      replyTo: inquiry.fields.email,
      subject: `[PCPUMP inquiry] ${inquiry.reference} · ${inquiry.system}`,
      messageId: `<${inquiry.reference}@pcpump.com>`,
      text: [
        'New website engineering inquiry',
        `Reference: ${inquiry.reference}`,
        `Received: ${inquiry.receivedAt}`,
        `System: ${inquiry.system}`,
        ...Object.entries(inquiry.selection).map(([key, value]) => `${key}: ${value}`),
        '',
        ...Object.entries(inquiry.fields).filter(([key]) => key !== 'website').map(([key, value]) => `${key}: ${value || 'Unknown / to follow'}`),
        '',
        'Equipment selections are candidates for engineering review. Compatibility is not confirmed.',
      ].join('\n'),
      attachments: [{ filename: `${inquiry.reference}.json`, content: JSON.stringify(inquiry, null, 2), contentType: 'application/json' }],
    });
    if (!result.accepted?.some((address: string | { address: string }) => (typeof address === 'string' ? address : address.address).toLowerCase() === inquiryRecipient)) {
      throw new Error('The receiving address was not accepted.');
    }
    return { status: 'accepted_by_mail_server' as const };
  } finally {
    transport.close();
  }
}
