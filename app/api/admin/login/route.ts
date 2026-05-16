import { NextResponse } from "next/server";
import { z } from "zod";
import { checkAdminCredentials, createSession, setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Email and password are required." },
      { status: 400 },
    );
  }

  if (!checkAdminCredentials(parsed.data.email, parsed.data.password)) {
    return NextResponse.json(
      { success: false, message: "Invalid email or password." },
      { status: 401 },
    );
  }

  const token = await createSession(parsed.data.email);
  await setSessionCookie(token);

  return NextResponse.json({ success: true });
}
