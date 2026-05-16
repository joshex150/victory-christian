import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/auth";

export const config = {
  matcher: ["/admin/dashboard/:path*"],
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.AUTH_SECRET;

  if (!token || !secret) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
}
