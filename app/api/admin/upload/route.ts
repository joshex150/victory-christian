import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getServerSession } from "@/lib/auth";
import { saveContent } from "@/lib/storage";

export const runtime = "nodejs";

const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/avif", "avif"],
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

  const ext = ALLOWED.get(file.type);
  if (!ext) {
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

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const filename = `cover-${Date.now()}.${ext}`;
  const filepath = path.join(uploadsDir, filename);
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buf);

  const publicPath = `/uploads/${filename}`;
  const content = await saveContent({ coverImage: publicPath });

  return NextResponse.json({ success: true, path: publicPath, content });
}
