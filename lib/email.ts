import { Resend } from "resend";
import type { SiteContent } from "./storage";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM = process.env.RESEND_FROM_EMAIL || "No Guide to Womanhood <onboarding@resend.dev>";

function welcomeHTML(content: SiteContent) {
  const title = escapeHTML(content.bookTitle);
  const sub = escapeHTML(content.subheadline);
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#fdfaf7;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1014;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdfaf7;padding:48px 16px;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0"
               style="max-width:560px;background:#ffffff;border:1px solid #f4d7dd;border-radius:18px;overflow:hidden;">
          <tr><td style="background:linear-gradient(135deg,#fbeef0,#ffffff);padding:28px 32px;border-bottom:1px solid #fbeef0;">
            <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#b02c54;font-weight:600;">You're on the list</div>
            <h1 style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;color:#1a1014;">${title}</h1>
            <div style="margin-top:6px;color:#76636a;font-size:14px;">${sub}</div>
          </td></tr>
          <tr><td style="padding:28px 32px;">
            <p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:#3a2a30;">Thank you for joining the waitlist.</p>
            <p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:#3a2a30;">
              You'll be among the first to know when <em>${title}</em> drops. No spam, no noise — just one quiet note when it's time.
            </p>
            <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#3a2a30;">
              Until then: take care of her — the version of you who's still learning.
            </p>
            <div style="height:1px;background:#fbeef0;margin:24px 0;"></div>
            <p style="margin:0;font-size:13px;color:#76636a;">
              You're receiving this because you signed up at the ${title} waitlist.
              If this wasn't you, simply ignore this email.
            </p>
          </td></tr>
        </table>
        <div style="color:#a89aa0;font-size:12px;margin-top:18px;font-family:Georgia,serif;font-style:italic;">— ${escapeHTML(content.footerText)}</div>
      </td></tr>
    </table>
  </body>
</html>`;
}

function welcomeText(content: SiteContent) {
  return [
    `You're on the list — ${content.bookTitle}`,
    "",
    "Thank you for joining the waitlist.",
    `You'll be among the first to know when "${content.bookTitle}" drops. No spam, no noise — just one quiet note when it's time.`,
    "",
    "Until then: take care of her — the version of you who's still learning.",
    "",
    `— ${content.footerText}`,
  ].join("\n");
}

export async function sendWelcomeEmail(email: string, content: SiteContent) {
  const resend = getResend();
  if (!resend) {
    return { ok: false, skipped: true as const, reason: "RESEND_API_KEY not set" };
  }
  try {
    const result = await resend.emails.send({
      from: FROM,
      to: email,
      subject: `You're on the list — ${content.bookTitle}`,
      html: welcomeHTML(content),
      text: welcomeText(content),
    });
    if (result.error) {
      return { ok: false, skipped: false as const, error: result.error.message };
    }
    return { ok: true, skipped: false as const, id: result.data?.id };
  } catch (err) {
    return { ok: false, skipped: false as const, error: err instanceof Error ? err.message : String(err) };
  }
}

function escapeHTML(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
