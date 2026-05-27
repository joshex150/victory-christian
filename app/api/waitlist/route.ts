import { NextResponse } from "next/server";
import { z } from "zod";
import { addSubscriber, bookSubscriberList, getContent, getEmailTemplate } from "@/lib/storage";
import { sendWelcomeEmail } from "@/lib/email";

export const runtime = "nodejs";

const Body = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  list: z.enum(["main", "upcoming"]).optional(),
});

export async function POST(req: Request) {
  let failureMessage = "Something went wrong. Please try again.";
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 },
    );
  }

  try {
    const content = await getContent();
    const requestedList =
      typeof json === "object" &&
      json !== null &&
      "list" in json &&
      json.list === "upcoming"
        ? "upcoming"
        : "main";
    const messages =
      requestedList === "upcoming"
        ? {
            invalid: content.upcomingFormInvalidEmailMessage,
            generic: content.upcomingFormGenericErrorMessage,
            success: content.upcomingFormSuccessMessage,
            existing: content.upcomingFormExistingMessage,
          }
        : {
            invalid: content.formInvalidEmailMessage,
            generic: content.formGenericErrorMessage,
            success: content.formSuccessMessage,
            existing: content.formExistingMessage,
          };
    failureMessage = messages.generic;
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: messages.invalid }, { status: 400 });
    }

    const { email, list = "main" } = parsed.data;
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const ua = req.headers.get("user-agent");
    const result = await addSubscriber(
      {
        email,
        createdAt: new Date().toISOString(),
        ip,
        ua,
      },
      list === "main" ? "main" : bookSubscriberList("upcoming"),
    );

    if (!result.added) {
      return NextResponse.json({
        success: true,
        message: messages.existing,
      });
    }

    // Do not block a successful signup on the external mail service.
    const emailContent =
      list === "main"
        ? content
        : {
            ...content,
            bookTitle: content.upcomingTitle || "Upcoming book",
            subheadline: content.upcomingSubheadline,
          };
    const template =
      list === "main" ? await getEmailTemplate() : content.upcomingEmailTemplate;
    const mail = await sendWelcomeEmail(email, emailContent, template);
    if (!mail.ok && !mail.skipped) {
      console.warn(`[waitlist:${list}] welcome email failed:`, mail.error);
    }

    return NextResponse.json({
      success: true,
      message: messages.success,
    });
  } catch (err) {
    console.error("[waitlist] failure:", err);
    return NextResponse.json(
      { success: false, message: failureMessage },
      { status: 500 },
    );
  }
}
