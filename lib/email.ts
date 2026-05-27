import { Resend } from "resend";
import { fillTemplate, type EmailTemplate } from "./settings";
import type { SiteContent } from "./storage";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM = process.env.RESEND_FROM_EMAIL || "No Guide to Womanhood <onboarding@resend.dev>";

function welcomeHTML(content: SiteContent, template: EmailTemplate) {
  const eyebrow = escapedField(template.eyebrow, content);
  const heading = escapedField(template.heading, content);
  const subtitle = escapedField(template.subtitle, content);
  const intro = paragraphHTML(fillTemplate(template.intro, content));
  const message = paragraphHTML(fillTemplate(template.message, content));
  const signoff = paragraphHTML(fillTemplate(template.signoff, content));
  const footer = paragraphHTML(fillTemplate(template.footer, content));
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${template.background};font-family:'Helvetica Neue',Arial,sans-serif;color:${template.headingText};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${template.background};padding:48px 16px;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0"
               style="max-width:560px;background:${template.surface};border:1px solid ${template.border};border-radius:18px;overflow:hidden;">
          <tr><td style="background:${template.headerBackground};padding:28px 32px;border-bottom:1px solid ${template.border};">
            <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:${template.accent};font-weight:600;">${eyebrow}</div>
            <h1 style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;color:${template.headingText};">${heading}</h1>
            <div style="margin-top:6px;color:${template.mutedText};font-size:14px;">${subtitle}</div>
          </td></tr>
          <tr><td style="padding:28px 32px;">
            <p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:${template.bodyText};">${intro}</p>
            <p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:${template.bodyText};">${message}</p>
            <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:${template.bodyText};">${signoff}</p>
            <div style="height:1px;background:${template.border};margin:24px 0;"></div>
            <p style="margin:0;font-size:13px;line-height:1.6;color:${template.mutedText};">${footer}</p>
          </td></tr>
        </table>
        <div style="color:${template.mutedText};font-size:12px;margin-top:18px;font-family:Georgia,serif;font-style:italic;">${escapedField("{{footerText}}", content)}</div>
      </td></tr>
    </table>
  </body>
</html>`;
}

function welcomeText(content: SiteContent, template: EmailTemplate) {
  return [
    fillTemplate(template.eyebrow, content),
    fillTemplate(template.heading, content),
    "",
    fillTemplate(template.intro, content),
    fillTemplate(template.message, content),
    "",
    fillTemplate(template.signoff, content),
    "",
    fillTemplate(template.footer, content),
    content.footerText,
  ].join("\n");
}

export async function sendWelcomeEmail(
  email: string,
  content: SiteContent,
  template: EmailTemplate,
) {
  const resend = getResend();
  if (!resend) {
    return { ok: false, skipped: true as const, reason: "RESEND_API_KEY not set" };
  }
  try {
    const result = await resend.emails.send({
      from: FROM,
      to: email,
      subject: fillTemplate(template.subject, content),
      html: welcomeHTML(content, template),
      text: welcomeText(content, template),
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

function escapedField(value: string, content: SiteContent) {
  return escapeHTML(fillTemplate(value, content));
}

function paragraphHTML(value: string) {
  return escapeHTML(value).replace(/\n/g, "<br>");
}
