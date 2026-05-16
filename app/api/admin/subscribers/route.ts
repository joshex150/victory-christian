import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getSubscribers, removeSubscriber } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const format = url.searchParams.get("format");
  const list = await getSubscribers();

  if (format === "csv") {
    const header = "email,createdAt\n";
    const body = list
      .map((s) => `${escapeCSV(s.email)},${escapeCSV(s.createdAt)}`)
      .join("\n");
    return new NextResponse(header + body, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="subscribers-${Date.now()}.csv"`,
      },
    });
  }

  return NextResponse.json({ success: true, subscribers: list, total: list.length });
}

export async function DELETE(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  let json: { email?: string };
  try {
    json = (await req.json()) as { email?: string };
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }
  const email = (json.email ?? "").trim();
  if (!email) {
    return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });
  }
  const total = await removeSubscriber(email);
  return NextResponse.json({ success: true, total });
}

function escapeCSV(v: string) {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}
