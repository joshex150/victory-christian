import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth";
import { getEmailTemplate, saveEmailTemplate } from "@/lib/storage";

export const runtime = "nodejs";

const Hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Choose a valid six-digit hex color.");

const Template = z
  .object({
    subject: z.string().min(1).max(180),
    eyebrow: z.string().min(1).max(100),
    heading: z.string().min(1).max(180),
    subtitle: z.string().max(300),
    intro: z.string().min(1).max(500),
    message: z.string().min(1).max(1600),
    signoff: z.string().min(1).max(800),
    footer: z.string().min(1).max(1000),
    background: Hex,
    surface: Hex,
    headerBackground: Hex,
    border: Hex,
    accent: Hex,
    headingText: Hex,
    bodyText: Hex,
    mutedText: Hex,
  })
  .strict();

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ success: true, template: await getEmailTemplate() });
}

export async function PUT(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }
  const parsed = Template.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? "Invalid email template" },
      { status: 400 },
    );
  }
  return NextResponse.json({
    success: true,
    template: await saveEmailTemplate(parsed.data),
  });
}
