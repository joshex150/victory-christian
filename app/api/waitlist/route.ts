import { NextResponse } from "next/server";
import { z } from "zod";
import { addSubscriber, getContent } from "@/lib/storage";
import { sendWelcomeEmail } from "@/lib/email";

export const runtime = "nodejs";

const Body = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 },
    );
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Please enter a valid email address.",
      },
      { status: 400 },
    );
  }

  const { email } = parsed.data;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;
  const ua = req.headers.get("user-agent");

  try {
    const result = await addSubscriber({
      email,
      createdAt: new Date().toISOString(),
      ip,
      ua,
    });

    if (!result.added) {
      return NextResponse.json({
        success: true,
        message: "You're already on the list. We'll be in touch.",
      });
    }

    // Fire-and-handle: don't block the user on email outcome, but log issues.
    const content = await getContent();
    const mail = await sendWelcomeEmail(email, content);
    if (!mail.ok && !mail.skipped) {
      console.warn("[waitlist] welcome email failed:", mail.error);
    }

    return NextResponse.json({
      success: true,
      message: "You're on the list. Check your inbox.",
    });
  } catch (err) {
    console.error("[waitlist] failure:", err);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
