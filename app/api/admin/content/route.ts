import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth";
import { getContent, saveContent } from "@/lib/storage";

export const runtime = "nodejs";

const Patch = z
  .object({
    eyebrow: z.string().max(80).optional(),
    headline: z.string().max(280).optional(),
    subheadline: z.string().max(280).optional(),
    body: z.string().max(6000).optional(),
    bookTitle: z.string().max(140).optional(),
    author: z.string().max(140).optional(),
    formHeading: z.string().max(160).optional(),
    formMicrocopy: z.string().max(160).optional(),
    buttonText: z.string().max(40).optional(),
    privacyNote: z.string().max(240).optional(),
    footerText: z.string().max(240).optional(),
    coverImage: z.string().max(2000).optional(),
    releaseDate: z.string().max(60).optional(),
  })
  .strict();

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const content = await getContent();
  return NextResponse.json({ success: true, content });
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
  const parsed = Patch.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const content = await saveContent(parsed.data);
  return NextResponse.json({ success: true, content });
}
