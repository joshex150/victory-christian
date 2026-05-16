import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getContent, saveCover } from "@/lib/storage";

export const runtime = "nodejs";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid upload" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { success: false, message: "Only JPG, PNG, WebP, GIF, or AVIF images are allowed." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { success: false, message: "Image is too large (max 8 MB)." },
      { status: 400 },
    );
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const path = await saveCover(buf, file.type);
    const content = await getContent();
    return NextResponse.json({ success: true, path, content });
  } catch (err) {
    console.error("[upload] failed:", err);
    return NextResponse.json(
      { success: false, message: "Upload failed. Check the server logs." },
      { status: 500 },
    );
  }
}
