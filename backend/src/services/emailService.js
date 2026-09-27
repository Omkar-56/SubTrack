import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let smtpTransporter = null;

function getSmtpTransporter() {
  if (!smtpTransporter && env.smtpUser && env.smtpPass) {
    smtpTransporter = nodemailer.createTransport({
      service: 'gmail', // optimized predefined settings for Gmail
      host: env.smtpHost || 'smtp.gmail.com',
      port: env.smtpPort || 465,
      secure: env.smtpSecure ?? (env.smtpPort === 465),
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });
  }
  return smtpTransporter;
}

/**
 * Send an email via Standard SMTP via Nodemailer (Gmail App Password, etc.),
 * or log cleanly to console if SMTP credentials haven't been provided yet.
 */
export async function sendEmail({ to, subject, html, text }) {
  const from = env.emailFrom || (env.smtpUser ? `SubTrack <${env.smtpUser}>` : 'SubTrack <notifications@gmail.com>');

  // 1. Send via Nodemailer SMTP (Gmail)
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text,
      });
      console.log(`[Email Sent via Gmail SMTP] To: ${to} | MessageId: ${info.messageId}`);
      return { success: true, provider: 'smtp', id: info.messageId };
    } catch (err) {
      console.error('[Gmail SMTP Error]', err.message);
      throw err;
    }
  }

  // 2. Simulated Fallback (when SMTP_USER / SMTP_PASS are not yet set)
  console.log('----------------------------------------------------');
  console.log('[EMAIL REMINDER SIMULATED]');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`From: ${from}`);
  console.log('[Note: Set SMTP_USER and SMTP_PASS in .env to deliver real Gmail emails]');
  console.log('----------------------------------------------------');

  return {
    success: true,
    provider: 'simulated',
    note: 'Email simulated in server logs. Configure SMTP_USER and SMTP_PASS in .env for real Gmail delivery.',
  };
}

/**
 * Format a clean HTML reminder email
 */
export function buildReminderEmailHtml({
  userName = 'there',
  subscriptionName,
  category = 'other',
  amount,
  currency = 'USD',
  billingCycle = 'monthly',
  dueDateFormatted,
  daysLeft,
  isTrial = false,
  postTrialAmount = null,
  postTrialCurrency = null,
  appUrl = 'https://subtrack.app',
}) {
  const isUrgent = daysLeft <= 1;
  const daysText =
    daysLeft === 0
      ? 'DUE TODAY'
      : daysLeft === 1
      ? 'DUE TOMORROW'
      : `DUE IN ${daysLeft} DAYS`;

  const bannerBg = isTrial
    ? '#EA580C' // Warm Orange / Alert
    : isUrgent
    ? '#DC2626' // Red
    : '#1F6F54'; // SubTrack Forest Green

  const chargeAmountStr = isTrial && postTrialAmount !== null
    ? `${postTrialCurrency || currency} ${Number(postTrialAmount).toFixed(2)} / ${billingCycle}`
    : `${currency} ${Number(amount).toFixed(2)} / ${billingCycle}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SubTrack Renewal Reminder</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f6f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1c1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f6f2; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" style="max-width: 540px; background-color: #ffffff; border-radius: 6px; border: 1px solid #e3e1da; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #1F6F54; padding: 20px 24px; text-align: left;">
              <span style="font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">SubTrack</span>
              <span style="font-size: 11px; color: #e2f1ec; margin-left: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Renewal Sentinel</span>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 28px 24px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #3d3d3a;">
                Hi ${userName || 'there'},
              </p>

              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #55544f;">
                ${
                  isTrial
                    ? `This is a reminder that your free trial for <strong>${subscriptionName}</strong> is approaching its cancellation deadline.`
                    : `You have an upcoming subscription renewal for <strong>${subscriptionName}</strong> scheduled soon.`
                }
              </p>

              <!-- Subscription Highlight Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf9f6; border: 1px solid #ebe9e1; border-radius: 4px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="left">
                          <span style="display: inline-block; font-size: 10px; font-weight: 700; background-color: ${bannerBg}; color: #ffffff; padding: 2px 8px; border-radius: 3px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                            ${daysText}
                          </span>
                          <h3 style="margin: 4px 0 2px; font-size: 18px; font-weight: 700; color: #1c1c1a;">
                            ${subscriptionName}
                          </h3>
                          <span style="font-size: 12px; color: #76746e; text-transform: capitalize;">
                            ${category}
                          </span>
                        </td>
                        <td align="right" valign="top">
                          <span style="font-size: 20px; font-weight: 700; color: #1c1c1a; font-family: monospace, sans-serif;">
                            ${currency} ${Number(amount).toFixed(2)}
                          </span>
                          <div style="font-size: 11px; color: #76746e; text-transform: capitalize;">
                            per ${billingCycle}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <hr style="border: none; border-top: 1px solid #e3e1da; margin: 14px 0;" />

                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #55544f;">
                      <tr>
                        <td style="padding: 4px 0;"><strong>${isTrial ? 'Trial Deadline' : 'Renewal Date'}:</strong></td>
                        <td align="right" style="padding: 4px 0; font-weight: 600; color: #1c1c1a;">${dueDateFormatted}</td>
                      </tr>
                      ${
                        isTrial && postTrialAmount !== null
                          ? `<tr>
                              <td style="padding: 4px 0;"><strong>Cost After Trial:</strong></td>
                              <td align="right" style="padding: 4px 0; font-weight: 600; color: #1c1c1a;">${chargeAmountStr}</td>
                            </tr>`
                          : ''
                      }
                    </table>
                  </td>
                </tr>
              </table>

              ${
                isTrial
                  ? `<div style="background-color: #fff7ed; border-left: 3px solid #EA580C; padding: 12px 16px; margin-bottom: 24px; font-size: 13px; color: #9a3412;">
                      <strong>Action Required:</strong> If you don't intend to keep ${subscriptionName}, remember to cancel it before <strong>${dueDateFormatted}</strong> to avoid being billed.
                    </div>`
                  : ''
              }

              <!-- Button CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0 16px;">
                    <a href="${appUrl}/subscriptions" target="_blank" style="display: inline-block; background-color: #1F6F54; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: 600; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.06);">
                      Manage in SubTrack &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 16px 0 0; font-size: 12px; color: #8a8880; line-height: 1.4; text-align: center;">
                Need to record payment? Open SubTrack and click <strong>"✓ Paid"</strong> to advance your billing cycle.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #faf9f6; border-top: 1px solid #ebe9e1; padding: 16px 24px; text-align: center; font-size: 11px; color: #9a9890;">
              SubTrack · Minimalist Recurring Bill & Subscription Tracker<br />
              You received this automated reminder based on your subscription settings (alerting 1–3 days prior to due date).
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Plain text fallback version for email clients
 */
export function buildReminderEmailText({
  userName = 'there',
  subscriptionName,
  amount,
  currency = 'USD',
  billingCycle = 'monthly',
  dueDateFormatted,
  daysLeft,
  isTrial = false,
  postTrialAmount = null,
  postTrialCurrency = null,
  appUrl = 'https://subtrack.app',
}) {
  const daysText =
    daysLeft === 0
      ? 'DUE TODAY'
      : daysLeft === 1
      ? 'DUE TOMORROW'
      : `DUE IN ${daysLeft} DAYS`;

  const subjectPrefix = isTrial ? 'Trial Expiry Alert' : 'Renewal Reminder';

  return `
SubTrack ${subjectPrefix}: ${subscriptionName} (${daysText})

Hi ${userName || 'there'},

${
  isTrial
    ? `Your free trial for ${subscriptionName} ends on ${dueDateFormatted}. Cancel before then to avoid being charged ${postTrialCurrency || currency} ${Number(postTrialAmount || amount).toFixed(2)}/${billingCycle}.`
    : `Your subscription to ${subscriptionName} is scheduled to renew on ${dueDateFormatted} for ${currency} ${Number(amount).toFixed(2)}/${billingCycle}.`
}

Subscription Details:
- Name: ${subscriptionName}
- Status: ${daysText}
- Due Date: ${dueDateFormatted}
- Amount: ${currency} ${Number(amount).toFixed(2)} (${billingCycle})

Manage your subscriptions at: ${appUrl}/subscriptions

--
SubTrack · Minimalist Recurring Bill & Subscription Tracker
`.trim();
}
