import { NextResponse } from "next/server";
import { getCover } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cover = await getCover("book:upcoming");
    if (!cover) {
      return NextResponse.json({ error: "No cover" }, { status: 404 });
    }
    return new NextResponse(new Uint8Array(cover.buf), {
      status: 200,
      headers: {
        "Content-Type": cover.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[cover:upcoming] failed:", err);
    return NextResponse.json({ error: "Failed to load cover" }, { status: 500 });
  }
}
