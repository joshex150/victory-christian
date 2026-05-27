import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth";
import { getSiteTheme, saveSiteTheme } from "@/lib/storage";

export const runtime = "nodejs";

const Hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Choose a valid six-digit hex color.");

const Theme = z
  .object({
    pageBackground: Hex,
    surface: Hex,
    softSurface: Hex,
    border: Hex,
    accent: Hex,
    accentDeep: Hex,
    headingText: Hex,
    bodyText: Hex,
    mutedText: Hex,
    buttonBackground: Hex,
    buttonHover: Hex,
    buttonText: Hex,
    badgeBackground: Hex,
    badgeText: Hex,
    inputBackground: Hex,
    toastBackground: Hex,
    toastBorder: Hex,
    toastText: Hex,
    coverBackground: Hex,
    coverAccent: Hex,
  })
  .strict();

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ success: true, theme: await getSiteTheme() });
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
  const parsed = Theme.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? "Invalid theme" },
      { status: 400 },
    );
  }
  return NextResponse.json({ success: true, theme: await saveSiteTheme(parsed.data) });
}
